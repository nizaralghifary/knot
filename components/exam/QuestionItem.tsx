import { Question } from "@/types/question";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { QuestionFields } from "./QuestionFields";

interface QuestionItemProps {
  question: Question;
  index: number;
  totalQuestions: number;
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

export function QuestionItem({
  question,
  index,
  totalQuestions,
  onQuestionChange,
  onOptionChange,
  onMatchingPairChange,
  onAddMatchingPair,
  onRemoveMatchingPair,
  onShortAnswerChange,
  onQuestionTypeChange,
  onMoveQuestion,
  onRemoveQuestion,
}: QuestionItemProps) {
  return (
    <Card key={question.id} className="border">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">Question {question.order}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMoveQuestion(question.id, "up")}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMoveQuestion(question.id, "down")}
                disabled={index === totalQuestions - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveQuestion(question.id)}
              disabled={totalQuestions <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <QuestionTypeSelector
          question={question}
          onQuestionTypeChange={onQuestionTypeChange}
        />
        
        <QuestionFields
          question={question}
          onQuestionChange={onQuestionChange}
          onOptionChange={onOptionChange}
          onMatchingPairChange={onMatchingPairChange}
          onAddMatchingPair={onAddMatchingPair}
          onRemoveMatchingPair={onRemoveMatchingPair}
          onShortAnswerChange={onShortAnswerChange}
        />
      </CardContent>
    </Card>
  );
}