import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { exams, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id));

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.is_published) {
      return NextResponse.json(
        { error: "This exam is not available" },
        { status: 403 }
      );
    }

    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.exam_id, id))
      .orderBy(questions.order);

    const questionsToReturn = examQuestions.map((q) => {
      const baseFields = {
        id: q.id,
        exam_id: q.exam_id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order: q.order,
      };

      if (q.question_type === 'matching') {
        const optionsData = q.options as any;
        
        console.log('Processing matching question:', {
          id: q.id,
          raw_options: optionsData,
          has_matching_pairs: !!(optionsData?.matching_pairs),
          has_right_options: !!(optionsData?.right_options)
        });

        return {
          ...baseFields,
          matching_pairs: optionsData?.matching_pairs || [],
          right_options: optionsData?.right_options || []
        };
      } else if (q.question_type === 'multiple_choice') {
        return {
          ...baseFields,
          options: Array.isArray(q.options) ? q.options : []
        };
      } else if (q.question_type === 'short_answer') {
        return baseFields;
      } else {
        return {
          ...baseFields,
          options: Array.isArray(q.options) ? q.options : []
        };
      }
    });

    //console.log('Questions to return:', JSON.stringify(questionsToReturn, null, 2));

    return NextResponse.json({
      ...exam,
      questions: questionsToReturn,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}