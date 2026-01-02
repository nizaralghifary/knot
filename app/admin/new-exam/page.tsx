"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExamDetails } from "@/components/exam/ExamDetails";
import { QuestionsList } from "@/components/exam/QuestionsList";
import { ExamData, Question } from "@/types/question";

const initialExamData: ExamData = {
  title: "",
  description: "",
  duration: 60,
  is_published: false,
};

const initialQuestion: Question = {
  id: "1",
  question_text: "",
  question_type: "multiple_choice",
  options: ["", "", "", ""],
  correct_answer: "",
  points: 1,
  order: 1,
};

export default function NewExamPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [examData, setExamData] = useState<ExamData>(initialExamData);
  const [questions, setQuestions] = useState<Question[]>([initialQuestion]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: (questions.length + 1).toString(),
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      points: 1,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(
        questions
          .filter((q) => q.id !== id)
          .map((q, idx) => ({
            ...q,
            order: idx + 1,
          }))
      );
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleAddMatchingPair = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newPairs = q.matching_pairs || [];
          return {
            ...q,
            matching_pairs: [...newPairs, { left: "", right: "" }],
          };
        }
        return q;
      })
    );
  };

  const handleRemoveMatchingPair = (questionId: string, pairIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.matching_pairs) {
          const newPairs = q.matching_pairs.filter((_, idx) => idx !== pairIndex);
          return {
            ...q,
            matching_pairs: newPairs,
            correct_answer: newPairs,
          };
        }
        return q;
      })
    );
  };

  const handleMatchingPairChange = (
    questionId: string,
    pairIndex: number,
    field: "left" | "right",
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.matching_pairs) {
          const newPairs = [...q.matching_pairs];
          newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };

          return {
            ...q,
            matching_pairs: newPairs,
            correct_answer: newPairs,
          };
        }
        return q;
      })
    );
  };

  const handleShortAnswerChange = (questionId: string, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              correct_answer: value,
              options: undefined,
              matching_pairs: undefined,
            }
          : q
      )
    );
  }

  const handleQuestionTypeChange = (
    questionId: string,
    type: "multiple_choice" | "short_answer" | "matching"
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if (type === "multiple_choice") {
            return {
              ...q,
              question_type: type,
              options: ["", "", "", ""],
              correct_answer: "",
              matching_pairs: undefined,
            };
          } else if (type === "short_answer") {
            return {
              ...q,
              question_type: type,
              options: undefined,
              correct_answer: "",
              matching_pairs: undefined,
            };
          } else if (type === "matching") {
            return {
              ...q,
              question_type: type,
              options: undefined,
              matching_pairs: [{ left: "", right: "" }],
              correct_answer: [{ left: "", right: "" }],
            };
          }
        }
        return q;
      })
    );
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];

    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));

    setQuestions(updatedQuestions);
  };

  const validateExamData = () => {
    if (!examData.title.trim()) {
      throw new Error("Exam title is required");
    }

    if (examData.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }

    for (const q of questions) {
      if (!q.question_text.trim()) {
        throw new Error(`Question ${q.order} text is required`);
      }

      if (q.points <= 0) {
        throw new Error(`Question ${q.order} points must be greater than 0`);
      }

      if (q.question_type === "multiple_choice") {
        if (!q.options || q.options.some((opt) => !opt.trim())) {
          throw new Error(`Question ${q.order}: All options must be filled`);
        }
        if (!q.correct_answer) {
          throw new Error(`Question ${q.order}: Correct answer is required`);
        }
      } else if (q.question_type === "short_answer") {
        if (
          !q.correct_answer ||
          (typeof q.correct_answer === "string" && !q.correct_answer.trim())
        ) {
          throw new Error(
            `Question ${q.order}: Correct answer is required for short answer`
          );
        }
      } else if (q.question_type === "matching") {
        if (!q.matching_pairs || q.matching_pairs.length === 0) {
          throw new Error(`Question ${q.order}: At least one matching pair is required`);
        }
        if (q.matching_pairs.some((pair) => !pair.left.trim() || !pair.right.trim())) {
          throw new Error(
            `Question ${q.order}: All matching pairs must have both left and right values`
          );
        }
      }
    }
  };

  const formatQuestionsForAPI = () => {
    return questions.map((q) => {
      const baseQuestion = {
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order: q.order,
      };

      if (q.question_type === "multiple_choice") {
        return {
          ...baseQuestion,
          options: q.options,
          correct_answer: q.correct_answer,
        };
      } else if (q.question_type === "short_answer") {
        return {
          ...baseQuestion,
          correct_answer: q.correct_answer,
        };
      } else if (q.question_type === "matching") {
        return {
          ...baseQuestion,
          options: undefined,
          correct_answer: q.matching_pairs,
        };
      }
      return baseQuestion;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateExamData();

      const formattedQuestions = formatQuestionsForAPI();

      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam: examData,
          questions: formattedQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create exam");
      }

      toast.success("Exam created successfully!");
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      toast.error("Error creating exam", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl">Create New Exam</h1>
          <div className="w-20"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <ExamDetails examData={examData} onExamDataChange={setExamData} />

          <QuestionsList
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onQuestionChange={handleQuestionChange}
            onOptionChange={handleOptionChange}
            onMatchingPairChange={handleMatchingPairChange}
            onAddMatchingPair={handleAddMatchingPair}
            onRemoveMatchingPair={handleRemoveMatchingPair}
            onShortAnswerChange={handleShortAnswerChange}
            onQuestionTypeChange={handleQuestionTypeChange}
            onMoveQuestion={moveQuestion}
            onRemoveQuestion={handleRemoveQuestion}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}