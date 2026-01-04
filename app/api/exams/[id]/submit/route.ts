import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { answers, examAttempts, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

function parseCorrectAnswer(raw: any): any {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return raw;
  if (raw.trim() === '') return null;
  
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function cleanString(str: string): string {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

function validateMultipleChoice(userAnswer: any, correctAnswer: any): boolean {
  const userAns = cleanString(String(userAnswer || '')).toLowerCase();
  const parsedCorrect = parseCorrectAnswer(correctAnswer);
  
  let correctStr = '';
  
  if (Array.isArray(parsedCorrect)) {
    correctStr = cleanString(String(parsedCorrect[0] || '')).toLowerCase();
  } else {
    correctStr = cleanString(String(parsedCorrect || '')).toLowerCase();
  }
  
  return userAns === correctStr;
}

function validateShortAnswer(userAnswer: any, correctAnswer: any): boolean {
  const userAns = cleanString(String(userAnswer || '')).toLowerCase();
  
  const parsedCorrect = parseCorrectAnswer(correctAnswer);
  
  let correctAnswers: string[] = [];
  
  if (Array.isArray(parsedCorrect)) {
    correctAnswers = parsedCorrect
      .map(item => cleanString(String(item || '')).toLowerCase())
      .filter(item => item !== '');
  } else {
    const singleAnswer = cleanString(String(parsedCorrect || '')).toLowerCase();
    if (singleAnswer !== '') {
      correctAnswers = [singleAnswer];
    }
  }
  
  return correctAnswers.includes(userAns);
}

function validateMatching(userAnswer: any, correctAnswer: any): boolean {
  try {
    let userPairs: Record<string, string> = {};
    
    if (typeof userAnswer === 'string') {
      try {
        userPairs = JSON.parse(userAnswer);
      } catch {
        return false;
      }
    } else if (typeof userAnswer === 'object' && userAnswer !== null) {
      userPairs = userAnswer;
    } else {
      return false;
    }
    
    const parsedCorrect = parseCorrectAnswer(correctAnswer);
    let correctPairs: Array<{ left: string; right: string }> = [];
    
    if (Array.isArray(parsedCorrect)) {
      correctPairs = parsedCorrect
        .filter(pair => 
          pair && 
          typeof pair === 'object' && 
          'left' in pair && 
          'right' in pair
        )
        .map(pair => ({
          left: cleanString(String(pair.left)),
          right: cleanString(String(pair.right))
        }));
    }
    
    if (correctPairs.length === 0) return false;
    
    for (const correctPair of correctPairs) {
      const userValue = cleanString(String(userPairs[correctPair.left] || ''));
      if (userValue !== correctPair.right) {
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
}

function validateAnswer(
  questionType: string,
  userAnswer: any,
  correctAnswer: any
): { isCorrect: boolean } {
  try {
    let isCorrect = false;
    
    switch (questionType) {
      case 'multiple_choice':
        isCorrect = validateMultipleChoice(userAnswer, correctAnswer);
        break;
        
      case 'short_answer':
        isCorrect = validateShortAnswer(userAnswer, correctAnswer);
        break;
        
      case 'matching':
        isCorrect = validateMatching(userAnswer, correctAnswer);
        break;
        
      default:
        isCorrect = false;
    }
    
    return { isCorrect };
    
  } catch (error) {
    return { isCorrect: false };
  }
}

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
    const answersToInsert = [];

    for (const userAnswer of userAnswers) {
      const question = examQuestions.find((q) => q.id === userAnswer.question_id);
      
      if (!question) continue;

      const validation = validateAnswer(
        question.question_type,
        userAnswer.user_answer,
        question.correct_answer
      );

      const isCorrect = validation.isCorrect;
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      let userAnswerToStore = userAnswer.user_answer;
      
      if (userAnswerToStore && typeof userAnswerToStore === 'object') {
        try {
          userAnswerToStore = JSON.stringify(userAnswerToStore);
        } catch (error) {
          userAnswerToStore = String(userAnswerToStore);
        }
      }

      answersToInsert.push({
        user_id: session.user.id,
        attempt_id: attempt.id,
        question_id: userAnswer.question_id,
        user_answer: userAnswerToStore,
        is_correct: isCorrect,
        points_earned: pointsEarned,
      });
    }

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
      success: true,
      message: "Exam submitted successfully",
      attemptId: attempt.id,
      totalScore,
      totalQuestions: examQuestions.length,
    });

  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { 
        error: "Failed to submit exam"
      },
      { status: 500 }
    );
  }
}