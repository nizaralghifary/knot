import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/drizzle";
import { exams, questions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Edit,
  Clock,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const [exam] = await db
    .select({
      id: exams.id,
      title: exams.title,
      description: exams.description,
      duration: exams.duration,
      is_published: exams.is_published,
      created_at: exams.created_at,
      created_by: exams.created_by,
      creator_username: users.username,
    })
    .from(exams)
    .leftJoin(users, eq(exams.created_by, users.id))
    .where(eq(exams.id, id));

  if (!exam) {
    redirect("/admin");
  }

  const examQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.exam_id, id))
    .orderBy(questions.order);

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <Badge variant={exam.is_published ? "default" : "secondary"}>
              {exam.is_published ? "Published" : "Draft"}
            </Badge>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/exams/${exam.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>
              {exam.description || "No description provided"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <InfoItem
                icon={<Clock className="h-5 w-5" />}
                label="Duration"
                value={`${exam.duration} minutes`}
              />
              <InfoItem
                icon={<FileText className="h-5 w-5" />}
                label="Questions"
                value={`${examQuestions.length}`}
              />
              <InfoItem
                icon={<User className="h-5 w-5" />}
                label="Created By"
                value={exam.creator_username || "Unknown"}
              />
              <InfoItem
                icon={<Calendar className="h-5 w-5" />}
                label="Created Date"
                value={format(new Date(exam.created_at), "MMM d, yyyy")}
              />
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryItem
                label="Total Points"
                value={`${examQuestions.reduce(
                  (sum, q) => sum + q.points,
                  0
                )}`}
              />
              <SummaryItem
                label="Average Points"
                value={
                  examQuestions.length > 0
                    ? `${Math.round(
                        (examQuestions.reduce(
                          (sum, q) => sum + q.points,
                          0
                        ) /
                          examQuestions.length) *
                          10
                      ) / 10}`
                    : "0"
                }
              />
              <SummaryItem
                label="Question Types"
                value={`${new Set(
                  examQuestions.map((q) => q.question_type)
                ).size}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({examQuestions.length})</CardTitle>
            <CardDescription>All questions in this exam</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {examQuestions.map((question, index) => {
              let options: string[] = [];
              let correctAnswer: number | string | null = null;
              let matchingPairs: { left: string; right: string }[] = [];

              try {
                if (question.options) {
                  const parsed = JSON.parse(question.options as string);
                  if (question.question_type === "multiple_choice") {
                    options = parsed as string[];
                  }
                  if (question.question_type === "matching") {
                    matchingPairs = parsed as {
                      left: string;
                      right: string;
                    }[];
                  }
                }

                if (question.correct_answer) {
                  correctAnswer = JSON.parse(
                    question.correct_answer as string
                  );
                }
              } catch (err) {
                console.error("Parse error:", err);
              }

              return (
                <Card key={question.id} className="border">
                  <CardHeader className="py-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {question.question_text}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {question.question_type.replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary">
                            {question.points} point
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {question.question_type === "multiple_choice" &&
                      options.map((opt, i) => {
                        const isCorrect = i === correctAnswer;
                        return (
                          <div
                            key={i}
                            className={`p-3 mb-2 rounded border ${
                              isCorrect
                                ? "bg-green-100 dark:bg-green-950 border-green-400"
                                : "bg-muted"
                            }`}
                          >
                            <strong>{String.fromCharCode(65 + i)}.</strong>{" "}
                            {opt}
                          </div>
                        );
                      })}

                    {question.question_type === "short_answer" && (
                      <div className="p-3 bg-muted rounded">
                        {correctAnswer !== null
                          ? String(correctAnswer)
                          : "—"}
                      </div>
                    )}

                    {question.question_type === "matching" &&
                      matchingPairs.map((pair, i) => (
                        <div
                          key={i}
                          className="flex justify-between p-3 bg-muted rounded mb-2"
                        >
                          <span>{pair.left}</span>
                          <span>→</span>
                          <span>{pair.right}</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-muted">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-muted rounded">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}