"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { ExamDetailsCard } from "./ExamDetailsCard";
import { QuestionsSection } from "./QuestionsSection";
import { Question, ExamData, QuestionFormData } from "./types";

interface EditExamFormProps {
  examId: string;
  initialExamData: ExamData;
  initialQuestions: Question[];
  onSubmit: (data: {
    exam: ExamData;
    questions: QuestionFormData[];
  }) => Promise<void>;
}

export function EditExamForm({
  examId,
  initialExamData,
  initialQuestions,
  onSubmit
}: EditExamFormProps) {
  const router = useRouter();
  const [examData, setExamData] = useState<ExamData>(initialExamData);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [submitting, setSubmitting] = useState(false);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
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
      const newQuestions = questions.filter(q => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 }));
      setQuestions(newQuestions);
    }
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } as Question : q
    ));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
                
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));

    setQuestions(updatedQuestions);
  };

  const formatQuestionsForSubmit = (): QuestionFormData[] => {
    return questions.map(q => {
      const baseQuestion: Omit<QuestionFormData, 'correct_answer'> = {
        id: q.id.startsWith('new-') ? undefined : q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order: q.order,
      };

      if (q.question_type === "multiple_choice") {
        return {
          ...baseQuestion,
          options: q.options,
          correct_answer: q.correct_answer
        } as QuestionFormData;
      } else if (q.question_type === "short_answer") {
        return {
          ...baseQuestion,
          correct_answer: q.correct_answer
        } as QuestionFormData;
      } else if (q.question_type === "matching") {
        return {
          ...baseQuestion,
          matching_pairs: q.matching_pairs,
          correct_answer: q.correct_answer
        } as QuestionFormData;
      }
      
      return {
        ...baseQuestion,
        correct_answer: ""
      } as QuestionFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
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
          if (!q.options || q.options.some(opt => !opt.trim())) {
            throw new Error(`Question ${q.order}: All options must be filled`);
          }
          if (!q.correct_answer) {
            throw new Error(`Question ${q.order}: Correct answer is required`);
          }
        } else if (q.question_type === "short_answer") {
          if (!q.correct_answer || !q.correct_answer.trim()) {
            throw new Error(`Question ${q.order}: Correct answer is required for short answer`);
          }
        } else if (q.question_type === "matching") {
          if (!q.matching_pairs || q.matching_pairs.length === 0) {
            throw new Error(`Question ${q.order}: At least one matching pair is required`);
          }
          if (q.matching_pairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
            throw new Error(`Question ${q.order}: All matching pairs must have both left and right values`);
          }
        }
      }

      const formattedQuestions = formatQuestionsForSubmit();
      
      await onSubmit({
        exam: examData,
        questions: formattedQuestions
      });
      
    } catch (error: any) {
      toast.error("Error updating exam", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ExamDetailsCard 
        examData={examData} 
        onExamDataChange={setExamData} 
      />

      <QuestionsSection
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onRemoveQuestion={handleRemoveQuestion}
        onMoveQuestion={moveQuestion}
      />

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            "Update Exam"
          )}
        </Button>
      </div>
    </form>
  );
}