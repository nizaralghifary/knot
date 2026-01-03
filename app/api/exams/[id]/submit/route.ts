import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { answers, examAttempts, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

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

      const safeParse = (data: any): any => {
        if (!data) return null;
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch {
            return data;
          }
        }
        return data;
      };

      const correctAnswer = safeParse(question.correct_answer);

      if (question.question_type === "multiple_choice") {
        const userAns = String(userAnswer.user_answer || "").trim();
        
        let correctAns = "";
        if (typeof correctAnswer === 'string') {
          correctAns = correctAnswer.trim();
        } else if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
          correctAns = String(correctAnswer[0]).trim();
        }
        
        isCorrect = userAns === correctAns;
        
      } else if (question.question_type === "short_answer") {
        const userAns = String(userAnswer.user_answer || "").toLowerCase().trim();
        
        if (Array.isArray(correctAnswer)) {
          const correctAnswers = correctAnswer.map((ans: any) => 
            String(ans).toLowerCase().trim()
          );
          isCorrect = correctAnswers.includes(userAns);
        } else if (typeof correctAnswer === 'string') {
          const correctAns = correctAnswer.toLowerCase().trim();
          isCorrect = userAns === correctAns;
        }
        
      } else if (question.question_type === "matching") {
        const userAns = userAnswer.user_answer;
        
        if (!userAns || typeof userAns !== 'object') {
          isCorrect = false;
        } else if (!correctAnswer || !Array.isArray(correctAnswer)) {
          isCorrect = false;
        } else {  
          const userAnsObj = userAns;
          const correctPairs = correctAnswer;
          
          let correctMatches = 0;
          let totalPairs = 0;
          
          for (const pair of correctPairs) {
            if (pair && pair.left && pair.right) {
              totalPairs++;
              const left = String(pair.left).trim();
              const correctRight = String(pair.right).trim();
              const userRight = String(userAnsObj[left] || "").trim();
              
              if (userRight === correctRight) {
                correctMatches++;
              }
            }
          }
          
          isCorrect = totalPairs > 0 && correctMatches === totalPairs;
        }
      }

      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += pointsEarned;
      }

      let userAnswerToStore = userAnswer.user_answer;
      
      if (userAnswerToStore && typeof userAnswerToStore === 'object') {
        userAnswerToStore = JSON.stringify(userAnswerToStore);
      }

      return {
        user_id: session.user.id,
        attempt_id: attempt.id,
        question_id: userAnswer.question_id,
        user_answer: userAnswerToStore,
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