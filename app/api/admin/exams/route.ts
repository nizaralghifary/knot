import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { exams, questions } from "@/lib/db/schema";
import { z } from "zod";

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  is_published: z.boolean().default(false),
});

const matchingPairSchema = z.object({
  left: z.string().min(1, "Left side is required"),
  right: z.string().min(1, "Right side is required"),
});

const questionSchema = z.object({
  question_text: z.string().min(1, "Question text is required"),
  question_type: z.enum(["multiple_choice", "short_answer", "matching"]),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([
    z.string(),
    z.string().array(),
    matchingPairSchema.array()
  ]),
  points: z.number().min(1, "Points must be at least 1"),
  order: z.number().min(1),
}).refine((data) => {
  if (data.question_type === "multiple_choice") {
    if (!data.options || data.options.length === 0) {
      return false;
    }
    return typeof data.correct_answer === "string";
  }
  
  if (data.question_type === "short_answer") {
    return typeof data.correct_answer === "string" && data.correct_answer.trim().length > 0;
  }
  
  if (data.question_type === "matching") {
    return Array.isArray(data.correct_answer) && data.correct_answer.length > 0;
  }
  
  return true;
}, {
  message: "Invalid data for question type",
  path: ["correct_answer"]
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { exam: examData, questions: questionsData } = body;

    const validatedExam = examSchema.parse(examData);
    
    if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    const validatedQuestions = questionsData.map((q, index) => {
      try {
        return questionSchema.parse({ 
          ...q, 
          order: index + 1 
        });
      } catch (error) {
        throw new Error(`Question ${index + 1}: ${error instanceof z.ZodError ? error.errors[0].message : "Invalid data"}`);
      }
    });

    const result = await db.transaction(async (tx) => {
      const [newExam] = await tx.insert(exams).values({
        ...validatedExam,
        created_by: session.user.id,
      }).returning();

      const examQuestions = validatedQuestions.map(q => {
        let optionsValue = null;
        let correctAnswerValue = null;

        if (q.question_type === "multiple_choice") {
          optionsValue = q.options || [];
          correctAnswerValue = q.correct_answer;
        } 
        else if (q.question_type === "short_answer") {
          optionsValue = null;
          correctAnswerValue = q.correct_answer;
        }
        else if (q.question_type === "matching") {
          const matchingPairs = q.correct_answer as Array<{left: string, right: string}>;
          
          const matching_pairs = matchingPairs.map(pair => ({ left: pair.left }));
          
          const right_options = matchingPairs.map(pair => pair.right);
          const shuffled_right_options = right_options.sort(() => Math.random() - 0.5);
          
          optionsValue = {
            matching_pairs,
            right_options: shuffled_right_options
          };
          
          correctAnswerValue = matchingPairs.reduce((acc, pair) => {
            acc[pair.left] = pair.right;
            return acc;
          }, {} as Record<string, string>);
        }

        return {
          exam_id: newExam.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: optionsValue,
          correct_answer: correctAnswerValue,
          points: q.points,
          order: q.order,
        };
      });

      const newQuestions = await tx.insert(questions).values(examQuestions).returning();

      return {
        exam: newExam,
        questions: newQuestions,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Exam created successfully",
    });

  } catch (error: any) {
    console.error("Error creating exam:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}