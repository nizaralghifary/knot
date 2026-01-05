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
import { MatchingDisplay } from "@/components/matching-display";

interface PageProps {
  params: {
    id: string;
  };
}

function parseJsonSafely(data: any, fallback: any = null): any {
  if (data === null || data === undefined) return fallback;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

function formatMatchingData(data: any): any {
  const parsed = parseJsonSafely(data);
  if (Array.isArray(parsed)) {
    const result: Record<string, string> = {};
    parsed.forEach((pair: any) => {
      if (pair && pair.left !== undefined) {
        result[String(pair.left)] = String(pair.right || '');
      }
    });
    return result;
  }
  if (parsed && typeof parsed === 'object') {
    return parsed;
  }
  return {};
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
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{`${exam.duration} minutes`}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium">{`${examQuestions.length}`}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{exam.creator_username || "Unknown"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-muted">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">
                    {format(new Date(exam.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-semibold">
                  {examQuestions.reduce((sum, q) => sum + q.points, 0)}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Average Points</p>
                <p className="text-2xl font-semibold">
                  {examQuestions.length > 0
                    ? Math.round(
                        (examQuestions.reduce((sum, q) => sum + q.points, 0) /
                          examQuestions.length) *
                          10
                      ) / 10
                    : 0}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Question Types</p>
                <p className="text-2xl font-semibold">
                  {new Set(examQuestions.map((q) => q.question_type)).size}
                </p>
              </div>
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
              const options = parseJsonSafely(question.options, []);
              const correctAnswer = parseJsonSafely(question.correct_answer);
              
              let displayOptions: string[] = [];
              let displayCorrectAnswer: string | string[] = '';
              let matchingData: any = null;

              if (question.question_type === "multiple_choice") {
                displayOptions = Array.isArray(options) 
                  ? options.map(opt => String(opt))
                  : [];
                
                if (Array.isArray(correctAnswer)) {
                  displayCorrectAnswer = String(correctAnswer[0] || '');
                } else {
                  displayCorrectAnswer = String(correctAnswer || '');
                }
              } 
              else if (question.question_type === "short_answer") {
                if (Array.isArray(correctAnswer)) {
                  displayCorrectAnswer = correctAnswer.map(ans => String(ans));
                } else {
                  displayCorrectAnswer = [String(correctAnswer || '')];
                }
              } 
              else if (question.question_type === "matching") {
                matchingData = formatMatchingData(options);
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
                            {question.points} point{question.points > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-2">
                        {displayOptions.map((opt, i) => {
                          const isCorrect = opt === displayCorrectAnswer;
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded border ${
                                isCorrect
                                  ? "bg-green-100 dark:bg-green-900 border-green-300"
                                  : "bg-muted border-border"
                              }`}
                            >
                              <span className="font-semibold">
                                {String.fromCharCode(65 + i)}.
                              </span>{" "}
                              {opt}
                              {isCorrect && (
                                <Badge className="ml-2" variant="outline">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Correct Answer{displayCorrectAnswer.length > 1 ? 's' : ''}:
                        </p>
                        <div className="space-y-1">
                          {Array.isArray(displayCorrectAnswer) 
                            ? displayCorrectAnswer.map((ans, idx) => (
                                <div key={idx} className="p-3 bg-green-100 dark:bg-green-900 rounded border border-green-300">
                                  {ans}
                                </div>
                              ))
                            : <div className="p-3 bg-green-100 dark:bg-green-900 rounded border border-green-300">
                                {displayCorrectAnswer}
                              </div>
                          }
                        </div>
                      </div>
                    )}

                    {question.question_type === "matching" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Matching Pairs:
                        </p>
                        <MatchingDisplay 
                          data={matchingData}
                          variant="default"
                        />
                      </div>
                    )}
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