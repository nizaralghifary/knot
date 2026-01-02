"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { EditExamForm } from "@/components/exam/edit/EditExamForm";
import { Question, ExamData, QuestionFormData } from "@/components/exam/edit/types";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditExamPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    }
  });

  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    duration: 60,
    is_published: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [examId, setExamId] = useState<string>("");
  
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setExamId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (session?.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!examId) return;

    const fetchExamData = async () => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch exam data");
        }

        const data = await response.json();

        setExamData({
          title: data.title,
          description: data.description || "",
          duration: data.duration,
          is_published: data.is_published,
        });

        const safeParse = (str: string) => {
          try {
            return JSON.parse(str);
          } catch {
            return str;
          }
        };

        const parsedQuestions: Question[] = data.questions.map((q: any) => {
          try {
            if (q.question_type === "multiple_choice") {
              const options = safeParse(q.options || "[]");
              const correct_answer = safeParse(q.correct_answer || "");
              
              return {
                id: q.id,
                question_text: q.question_text,
                question_type: "multiple_choice" as const,
                options: Array.isArray(options) ? options : [],
                correct_answer: typeof correct_answer === "string" ? correct_answer : "",
                points: q.points,
                order: q.order,
              };
            } else if (q.question_type === "short_answer") {
              const correct_answer = safeParse(q.correct_answer || "");
              
              return {
                id: q.id,
                question_text: q.question_text,
                question_type: "short_answer" as const,
                correct_answer: typeof correct_answer === "string" ? correct_answer : "",
                points: q.points,
                order: q.order,
              };
            } else if (q.question_type === "matching") {
              const matching_pairs = safeParse(q.options || "[]");
              const correct_answer = safeParse(q.correct_answer || "[]");
              
              return {
                id: q.id,
                question_text: q.question_text,
                question_type: "matching" as const,
                matching_pairs: Array.isArray(matching_pairs) ? matching_pairs : [],
                correct_answer: Array.isArray(correct_answer) ? correct_answer : [],
                points: q.points,
                order: q.order,
              };
            }
            
            // Fallback
            return {
              id: q.id,
              question_text: q.question_text,
              question_type: "multiple_choice" as const,
              options: ["", "", "", ""],
              correct_answer: "",
              points: q.points,
              order: q.order,
            };
          } catch (err) {
            console.error("Parse error:", err);
            return {
              id: q.id,
              question_text: q.question_text,
              question_type: "multiple_choice" as const,
              options: ["", "", "", ""],
              correct_answer: "",
              points: q.points,
              order: q.order,
            };
          }
        });

        setQuestions(parsedQuestions);
      } catch (error: any) {
        toast.error("Error loading exam", {
          description: error.message,
        });
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, router]);

  const handleSubmit = async (data: { exam: ExamData; questions: QuestionFormData[] }) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update exam");
      }

      toast.success("Exam updated successfully!");
      router.push(`/admin/exams/${examId}`);
      router.refresh();
    } catch (error: any) {
      throw error;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-semibold">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl text-center font-semibold">Edit Exam</h1>
          <div className="w-20"></div>
        </div>

        <EditExamForm
          examId={examId}
          initialExamData={examData}
          initialQuestions={questions}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}