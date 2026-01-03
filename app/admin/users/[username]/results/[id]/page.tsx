import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import { examAttempts, exams, answers, questions, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Clock, User } from "lucide-react";

export default async function AdminUserResultDetailPage({ 
  params 
}: { 
  params: Promise<{ username: string; id: string }> 
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { username, id } = await params;
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, cleanUsername));

  if (!targetUser) {
    redirect("/admin/users");
  }

  const [attempt] = await db
    .select()
    .from(examAttempts)
    .where(
      and(
        eq(examAttempts.id, id),
        eq(examAttempts.user_id, targetUser.id)
      )
    );

  if (!attempt) {
    redirect(`/admin/users/${cleanUsername}`);
  }

  const [exam] = await db
    .select()
    .from(exams)
    .where(eq(exams.id, attempt.exam_id));

  const examQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.exam_id, attempt.exam_id))
    .orderBy(questions.order);

  const userAnswers = await db
    .select()
    .from(answers)
    .where(
      and(
        eq(answers.user_id, targetUser.id),
        eq(answers.attempt_id, attempt.id)
      )
    );

  const questionsWithAnswers = examQuestions.map((question) => {
    const answer = userAnswers.find((a) => a.question_id === question.id);
    return {
      ...question,
      userAnswer: answer,
    };
  });

  const totalPoints = examQuestions.reduce((sum, q) => sum + q.points, 0);
  const percentage = totalPoints > 0 ? Math.round((attempt.total_score! / totalPoints) * 100) : 0;
  const correctAnswers = questionsWithAnswers.filter((q) => q.userAnswer?.is_correct).length;

  const startTime = new Date(attempt.started_at);
  const endTime = attempt.completed_at ? new Date(attempt.completed_at) : new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationSeconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/admin/users/${cleanUsername}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Results
            </Link>
          </Button>
        </div>

        <Card className="mb-6 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Viewing results for:</p>
                <p className="text-sm text-muted-foreground">
                  @{targetUser.username} ({targetUser.email})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">{exam.title}</CardTitle>
            <CardDescription>Exam Results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Percentage</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{attempt.total_score}/{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{correctAnswers}/{examQuestions.length}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{durationMinutes}:{durationSeconds.toString().padStart(2, '0')}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Detailed answers and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questionsWithAnswers.map((question, index) => {
              const isCorrect = question.userAnswer?.is_correct;
              
              let correctAnswer: any;
              if (typeof question.correct_answer === 'string') {
                try {
                  correctAnswer = JSON.parse(question.correct_answer);
                } catch (e) {
                  correctAnswer = question.correct_answer;
                }
              } else {
                correctAnswer = question.correct_answer;
              }

              let options: any = null;
              if (question.options) {
                if (typeof question.options === 'string') {
                  try {
                    options = JSON.parse(question.options);
                  } catch (e) {
                    options = question.options;
                  }
                } else {
                  options = question.options;
                }
              }

              return (
                <div key={question.id}>
                  {index > 0 && <Separator className="mb-6" />}
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Question {index + 1}</span>
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            {question.userAnswer?.points_earned || 0}/{question.points} pts
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{question.question_text}</p>
                      </div>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-1">User's Answer:</p>
                        <p className="text-sm">
                          {question.userAnswer?.user_answer 
                            ? typeof question.userAnswer.user_answer === 'object'
                              ? JSON.stringify(question.userAnswer.user_answer)
                              : String(question.userAnswer.user_answer)
                            : <span className="text-muted-foreground italic">No answer provided</span>
                          }
                        </p>
                      </div>

                      {!isCorrect && (
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">Correct Answer:</p>
                          <p className="text-sm text-green-600">
                            {typeof correctAnswer === 'object'
                              ? JSON.stringify(correctAnswer)
                              : String(correctAnswer)
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${cleanUsername}`}>Back to User</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">Back to All Users</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}