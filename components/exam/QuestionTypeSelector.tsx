import { Question } from "@/types/question";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionTypeSelectorProps {
  question: Question;
  onQuestionTypeChange: (questionId: string, type: "multiple_choice" | "short_answer" | "matching") => void;
}

export function QuestionTypeSelector({ question, onQuestionTypeChange }: QuestionTypeSelectorProps) {
  return (
    <div>
      <Label className="mb-2">Question Type</Label>
      <Select
        value={question.question_type}
        onValueChange={(value: "multiple_choice" | "short_answer" | "matching") =>
          onQuestionTypeChange(question.id, value)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select question type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
          <SelectItem value="short_answer">Short Answer</SelectItem>
          <SelectItem value="matching">Matching</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}