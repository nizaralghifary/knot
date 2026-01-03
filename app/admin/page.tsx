import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import { users, exams, examAttempts, questions } from "@/lib/db/schema";
import { count, desc, sql } from "drizzle-orm";
import AdminPanel from "@/components/exam/admin/adminPanel";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session?.user.role !== "admin") {
    redirect("/");
  }

  const [totalUsers, totalExams, totalAttempts, recentExams] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(exams),
    db.select({ count: count() }).from(examAttempts),
    db.select({
      id: exams.id,
      title: exams.title,
      is_published: exams.is_published,
      duration: exams.duration,
      created_at: exams.created_at,
      question_count: sql<number>`COUNT(${questions.id})`.as("question_count")
    })
      .from(exams)
      .leftJoin(questions, sql`${exams.id} = ${questions.exam_id}`)
      .groupBy(exams.id)
      .orderBy(desc(exams.created_at))
      .limit(5)
  ]);

  return (
    <AdminPanel
      totalUsers={totalUsers[0]?.count || 0}
      totalExams={totalExams[0]?.count || 0}
      totalAttempts={totalAttempts[0]?.count || 0}
      recentExams={recentExams.map(exam => ({
        ...exam,
        created_at: new Date(exam.created_at)
      }))}
    />
  );
}