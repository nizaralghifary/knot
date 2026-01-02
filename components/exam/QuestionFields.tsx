import { Question } from "@/types/question";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MultipleChoiceFields } from "./MultipleChoiceFields";
import { ShortAnswerFields } from "./ShortAnswerFields";
import { MatchingFields } from "./MatchingFields";

interface QuestionFieldsProps {
  question: Question;
  onQuestionChange: (id: string, field: keyof Question, value: any) => void;
  onOptionChange: (questionId: string, optionIndex: number, value: string) => void;
  onMatchingPairChange: (questionId: string, pairIndex: number, field: "left" | "right", value: string) => void;
  onAddMatchingPair: (questionId: string) => void;
  onRemoveMatchingPair: (questionId: string, pairIndex: number) => void;
  onShortAnswerChange: (questionId: string, value: string) => void;
}

export function QuestionFields({
  question,
  onQuestionChange,
  onOptionChange,
  onMatchingPairChange,
  onAddMatchingPair,
  onRemoveMatchingPair,
  onShortAnswerChange,
}: QuestionFieldsProps) {
  return (
    <>
      <div>
        <Label className="mb-2">Question Text *</Label>
        <Textarea
          value={question.question_text}
          onChange={(e) => onQuestionChange(question.id, "question_text", e.target.value)}
          placeholder="Enter the question..."
          rows={2}
          required
        />
      </div>

      {question.question_type === "multiple_choice" && (
        <MultipleChoiceFields
          question={question}
          onOptionChange={onOptionChange}
          onQuestionChange={onQuestionChange}
        />
      )}

      {question.question_type === "short_answer" && (
        <ShortAnswerFields
          question={question}
          onShortAnswerChange={onShortAnswerChange}
        />
      )}

      {question.question_type === "matching" && (
        <MatchingFields
          question={question}
          onMatchingPairChange={onMatchingPairChange}
          onAddMatchingPair={onAddMatchingPair}
          onRemoveMatchingPair={onRemoveMatchingPair}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Points *</Label>
          <Input
            type="number"
            min="1"
            value={question.points || ""}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = Number(value);
              if (value === "") {
                onQuestionChange(question.id, "points", 0);
              } else if (!isNaN(numValue)) {
                onQuestionChange(question.id, "points", numValue);
              }
            }}
            required
          />
        </div>
      </div>
    </>
  );
}