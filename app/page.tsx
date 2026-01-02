import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Atom, Sigma, ChevronRightIcon, Settings, NotebookPen, CheckCircle2 } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import { db } from "@/lib/db/drizzle";
import { exams, examAttempts } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

const examIcons: Record<string, any> = {
  math: Sigma,
  physics: Atom,
  default: NotebookPen,
};

export default async function Exams() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const publishedExams = await db
    .select()
    .from(exams)
    .where(eq(exams.is_published, true))
    .orderBy(asc(exams.created_at));

  const userAttempts = await db
    .select()
    .from(examAttempts)
    .where(
      and(
        eq(examAttempts.user_id, session?.user?.id),
        eq(examAttempts.is_completed, true)
      )
    );

  const completedExamIds = new Set(userAttempts.map(attempt => attempt.exam_id));

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-x-2">
          <h1 className="font-semibold text-2xl">KnotExam</h1>
        </Link>

        <div className="flex items-center">
          <Link href="/settings" className="p-2">
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </div>

      <div className="text-center mb-10">
        <p className="text-xl lg:text-2xl font-medium">
          Hi @{session?.user?.username || "Guest"} 👋🏻
        </p>
        <p className="text-muted-foreground mt-2">
          Ready to take a test?
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {publishedExams.length === 0 ? (
          <div className="text-center py-12">
            <NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exams available at the moment</p>
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-semibold mb-4">Available Exams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {publishedExams.map((exam) => {
                const IconComponent = examIcons.default;
                const isCompleted = completedExamIds.has(exam.id);
                const attempt = userAttempts.find(a => a.exam_id === exam.id);
                
                return (
                  <Item key={exam.id} variant="outline" asChild>
                    <Link href={isCompleted ? `/result/${attempt?.id}` : `/test/${exam.id}`}>
                      <ItemMedia variant="icon">
                        {isCompleted ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <IconComponent className="size-5" />
                        )}
                      </ItemMedia>
                      <ItemContent>
                        <div className="flex items-center gap-2">
                          <ItemTitle>{exam.title}</ItemTitle>
                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <ItemDescription>
                          {isCompleted 
                            ? `Score: ${attempt?.total_score || 0} points`
                            : exam.description || "Take this exam"
                          }
                        </ItemDescription>
                        {!isCompleted && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Duration: {exam.duration} minutes
                          </div>
                        )}
                      </ItemContent>
                      <ItemActions>
                        <ChevronRightIcon className="size-4" />
                      </ItemActions>
                    </Link>
                  </Item>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}