import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { examAttempts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

    const { id: examId } = await context.params;

    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.exam_id, examId),
          eq(examAttempts.user_id, session.user.id),
          eq(examAttempts.is_completed, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      completed: !!attempt,
      attemptId: attempt?.id || null,
    });
  } catch (error) {
    console.error("Error checking attempt:", error);
    return NextResponse.json(
      { error: "Failed to check attempt" },
      { status: 500 }
    );
  }
}