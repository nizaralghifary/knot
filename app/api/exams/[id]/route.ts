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

      try {
        const rawOptions = q.options;
        let parsedOptions: any = null;
        
        if (rawOptions && typeof rawOptions === 'string') {
          try {
            parsedOptions = JSON.parse(rawOptions);
          } catch (parseError) {
            console.error(`Failed to parse options for question ${q.id}:`, parseError);
            parsedOptions = null;
          }
        } else if (rawOptions) {
          parsedOptions = rawOptions; 
        }

        {/*console.log('Parsed options for question:', {
          id: q.id,
          type: q.question_type,
          raw: rawOptions,
          parsed: parsedOptions
        });*/}

        if (q.question_type === 'matching') {
          const matchingPairs = Array.isArray(parsedOptions) 
            ? parsedOptions.filter(pair => pair && typeof pair === 'object')
            : [];
          
          const rightOptions = matchingPairs
            .map(pair => pair.right)
            .filter(right => right && typeof right === 'string');
          
          const shuffledRightOptions = [...rightOptions].sort(() => Math.random() - 0.5);

          return {
            ...baseFields,
            matching_pairs: matchingPairs,
            right_options: shuffledRightOptions
          };
        } else if (q.question_type === 'multiple_choice') {
          const options = Array.isArray(parsedOptions) 
            ? parsedOptions.filter(opt => typeof opt === 'string')
            : [];
          
          return {
            ...baseFields,
            options: options
          };
        } else if (q.question_type === 'short_answer') {
          return baseFields;
        } else {
          return {
            ...baseFields,
            options: []
          };
        }
      } catch (error) {
        console.error(`Error processing question ${q.id}:`, error);
        return {
          ...baseFields,
          options: q.question_type === 'multiple_choice' ? [] : undefined,
          matching_pairs: q.question_type === 'matching' ? [] : undefined,
          right_options: q.question_type === 'matching' ? [] : undefined
        };
      }
    });

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