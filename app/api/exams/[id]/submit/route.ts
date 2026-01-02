import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { answers, examAttempts, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

type MatchingAnswer = Record<string, string>;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: examId } = await context.params;
    const body = await req.json();
    const { answers: userAnswers } = body;

    const [attempt] = await db
      .insert(examAttempts)
      .values({
        user_id: session.user.id,
        exam_id: examId,
        started_at: new Date(),
      })
      .returning();

    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.exam_id, examId));

    let totalScore = 0;

    const answersToInsert = userAnswers.map((userAnswer: any) => {
      const question = examQuestions.find((q) => q.id === userAnswer.question_id);
      
      if (!question) {
        return null;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      const correctAnswer = question.correct_answer;

      if (question.question_type === "multiple_choice") {
        const userAns = String(userAnswer.user_answer || "").trim();
        const correctAns = String(correctAnswer || "").trim();
        isCorrect = userAns === correctAns;
        
      } else if (question.question_type === "short_answer") {
        const userAns = String(userAnswer.user_answer || "").toLowerCase().trim();
        
        if (Array.isArray(correctAnswer)) {
          const correctAnswers = correctAnswer.map((ans: any) => 
            String(ans).toLowerCase().trim()
          );
          isCorrect = correctAnswers.includes(userAns);
        } else {
          const correctAns = String(correctAnswer || "").toLowerCase().trim();
          isCorrect = userAns === correctAns;
        }
        
      } else if (question.question_type === "matching") {
        const userAns = userAnswer.user_answer;
        
        if (!userAns || typeof userAns !== 'object') {
          isCorrect = false;
        } else if (!correctAnswer || typeof correctAnswer !== 'object') {
          isCorrect = false;
        } else {
          const correctAnsTyped = correctAnswer as MatchingAnswer;
          const userAnsTyped = userAns as MatchingAnswer;
          
          const correctKeys = Object.keys(correctAnsTyped);
          const userKeys = Object.keys(userAnsTyped);
          
          if (userKeys.length !== correctKeys.length) {
            isCorrect = false;
          } else {
            let correctMatches = 0;
            
            for (const leftItem of correctKeys) {
              const correctRight = String(correctAnsTyped[leftItem] || "").trim();
              const userRight = String(userAnsTyped[leftItem] || "").trim();
              
              if (userRight === correctRight) {
                correctMatches++;
              }
            }
            
            isCorrect = correctMatches === correctKeys.length;
          }
        }
      }

      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += pointsEarned;
      }

      return {
        user_id: session.user.id,
        question_id: userAnswer.question_id,
        user_answer: userAnswer.user_answer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
      };
    }).filter(Boolean);

    if (answersToInsert.length > 0) {
      await db.insert(answers).values(answersToInsert);
    }

    await db
      .update(examAttempts)
      .set({
        completed_at: new Date(),
        total_score: totalScore,
        is_completed: true,
      })
      .where(eq(examAttempts.id, attempt.id));

    return NextResponse.json({
      message: "Exam submitted successfully",
      attemptId: attempt.id,
      totalScore,
      totalQuestions: examQuestions.length,
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}