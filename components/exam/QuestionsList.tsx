import { Question } from "@/types/question";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionItem } from "./QuestionItem";

interface QuestionsListProps {
  questions: Question[];
  onAddQuestion: () => void;
  onQuestionChange: (id: string, field: keyof Question, value: any) => void;
  onOptionChange: (questionId: string, optionIndex: number, value: string) => void;
  onMatchingPairChange: (questionId: string, pairIndex: number, field: "left" | "right", value: string) => void;
  onAddMatchingPair: (questionId: string) => void;
  onRemoveMatchingPair: (questionId: string, pairIndex: number) => void;
  onShortAnswerChange: (questionId: string, value: string) => void;
  onQuestionTypeChange: (questionId: string, type: "multiple_choice" | "short_answer" | "matching") => void;
  onMoveQuestion: (id: string, direction: "up" | "down") => void;
  onRemoveQuestion: (id: string) => void;
}

export function QuestionsList({
  questions,
  onAddQuestion,
  onQuestionChange,
  onOptionChange,
  onMatchingPairChange,
  onAddMatchingPair,
  onRemoveMatchingPair,
  onShortAnswerChange,
  onQuestionTypeChange,
  onMoveQuestion,
  onRemoveQuestion,
}: QuestionsListProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Add and configure exam questions</CardDescription>
          </div>
          <Button type="button" onClick={onAddQuestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            totalQuestions={questions.length}
            onQuestionChange={onQuestionChange}
            onOptionChange={onOptionChange}
            onMatchingPairChange={onMatchingPairChange}
            onAddMatchingPair={onAddMatchingPair}
            onRemoveMatchingPair={onRemoveMatchingPair}
            onShortAnswerChange={onShortAnswerChange}
            onQuestionTypeChange={onQuestionTypeChange}
            onMoveQuestion={onMoveQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
        ))}
      </CardContent>
    </Card>
  );
}