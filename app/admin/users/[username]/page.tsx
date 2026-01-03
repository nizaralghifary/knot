import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import { examAttempts, exams, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, Clock, Award } from "lucide-react";

export default async function AdminUserResultsPage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { username } = await params;
  const cleanUsername = username;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, cleanUsername));

  if (!targetUser) {
    redirect("/admin/users");
  }

  const userAttempts = await db
    .select({
      attempt: examAttempts,
      exam: exams,
    })
    .from(examAttempts)
    .innerJoin(exams, eq(examAttempts.exam_id, exams.id))
    .where(eq(examAttempts.user_id, targetUser.id))
    .orderBy(desc(examAttempts.completed_at));

  const totalAttempts = userAttempts.length;
  const completedAttempts = userAttempts.filter(ua => ua.attempt.completed_at).length;
  const averageScore = completedAttempts > 0
    ? userAttempts
        .filter(ua => ua.attempt.completed_at)
        .reduce((sum, ua) => sum + (ua.attempt.total_score || 0), 0) / completedAttempts
    : 0;

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{targetUser.username}</CardTitle>
                <CardDescription>{targetUser.email}</CardDescription>
              </div>
              <Badge variant={targetUser.role === "admin" ? "default" : "secondary"}>
                {targetUser.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{totalAttempts}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{completedAttempts}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam History</CardTitle>
            <CardDescription>
              All exam attempts by this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAttempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exam attempts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userAttempts.map(({ attempt, exam }) => {
                  const startTime = new Date(attempt.started_at);
                  const endTime = attempt.completed_at 
                    ? new Date(attempt.completed_at) 
                    : new Date();
                  const durationMs = endTime.getTime() - startTime.getTime();
                  const durationMinutes = Math.floor(durationMs / 60000);
                  const durationSeconds = Math.floor((durationMs % 60000) / 1000);

                  return (
                    <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{exam.title}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(attempt.started_at).toLocaleDateString('en-US', {
                                    timeZone: 'Asia/Jakarta',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{durationMinutes}:{durationSeconds.toString().padStart(2, '0')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge 
                                variant={attempt.completed_at ? "default" : "secondary"}
                                className="mb-2"
                              >
                                {attempt.completed_at ? "Completed" : "In Progress"}
                              </Badge>
                              {attempt.completed_at && (
                                <p className="text-2xl font-bold">
                                  {attempt.total_score} pts
                                </p>
                              )}
                            </div>
                            
                            {attempt.completed_at && (
                              <Button asChild>
                                <Link href={`/admin/users/${targetUser.username}/results/${attempt.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}