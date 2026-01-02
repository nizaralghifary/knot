import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { exams, questions, examAttempts, answers } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
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

    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.exam_id, id))
      .orderBy(questions.order);

    return NextResponse.json({
      ...exam,
      questions: examQuestions,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { exam: examData, questions: questionData } = body;

    await db
      .update(exams)
      .set({
        title: examData.title,
        description: examData.description,
        duration: examData.duration,
        is_published: examData.is_published,
      })
      .where(eq(exams.id, id));

    await db.delete(questions).where(eq(questions.exam_id, id));

    const questionsToInsert = questionData.map((q: any) => {
      let options = null;
      let correct_answer = null;

      if (q.question_type === "multiple_choice") {
        options = JSON.stringify(q.options);
        correct_answer = JSON.stringify(q.correct_answer);
      } else if (q.question_type === "short_answer") {
        correct_answer = JSON.stringify(q.correct_answer);
      } else if (q.question_type === "matching") {
        options = JSON.stringify(q.correct_answer);
        correct_answer = JSON.stringify(q.correct_answer);
      }

      return {
        exam_id: id,
        question_text: q.question_text,
        question_type: q.question_type,
        options,
        correct_answer,
        points: q.points,
        order: q.order,
      };
    });

    await db.insert(questions).values(questionsToInsert);

    return NextResponse.json({ message: "Exam updated successfully" });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, id));

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    await db.transaction(async (tx) => {
      const questionList = await tx
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.exam_id, id));

      const questionIds = questionList.map(q => q.id);

      if (questionIds.length > 0) {
        await tx.delete(answers)
          .where(inArray(answers.question_id, questionIds));
      }

      await tx.delete(examAttempts)
        .where(eq(examAttempts.exam_id, id));

      await tx.delete(questions)
        .where(eq(questions.exam_id, id));

      await tx.delete(exams)
        .where(eq(exams.id, id));
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam", details: error.message },
      { status: 500 }
    );
  }
}