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
  options: z.any().optional(),
  correct_answer: z.any(),
  points: z.number().min(1, "Points must be at least 1"),
  order: z.number().min(1),
});

interface MatchingPair {
  left: any;
  right: any;
}

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

    const [newExam] = await db.insert(exams).values({
      ...validatedExam,
      created_by: session.user.id,
    }).returning();

    for (const q of questionsData) {
      let optionsValue = null;
      let correctAnswerValue = null;

      if (q.question_type === "multiple_choice") {
        const options = Array.isArray(q.options) ? q.options : [];
        const correctAnswer = String(q.correct_answer || "");
        
        optionsValue = options;
        correctAnswerValue = correctAnswer;
      } 
      else if (q.question_type === "short_answer") {
        const correctAnswer = q.correct_answer;
        
        if (Array.isArray(correctAnswer)) {
          correctAnswerValue = correctAnswer;
        } else {
          correctAnswerValue = [String(correctAnswer || "")];
        }
      }
      else if (q.question_type === "matching") {
        const matchingPairs = Array.isArray(q.correct_answer) 
          ? q.correct_answer 
          : [];
        
        const validPairs = matchingPairs.filter((pair: any) => 
          pair && 
          typeof pair === 'object' && 
          pair.left && 
          pair.right
        );
        
        optionsValue = validPairs;
        correctAnswerValue = validPairs;
      }

      await db.insert(questions).values({
        exam_id: newExam.id,
        question_text: String(q.question_text || ""),
        question_type: q.question_type,
        options: optionsValue,
        correct_answer: correctAnswerValue,
        points: Number(q.points) || 1,
        order: Number(q.order) || 1,
      });
    }

    return NextResponse.json({
      success: true,
      examId: newExam.id,
      message: "Exam created successfully",
    });

  } catch (error: any) {
    console.error("Error creating exam:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}