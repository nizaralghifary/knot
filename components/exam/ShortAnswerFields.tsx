import { Question } from "@/types/question";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShortAnswerFieldsProps {
  question: Question;
  onShortAnswerChange: (questionId: string, value: string) => void;
}

export function ShortAnswerFields({ question, onShortAnswerChange }: ShortAnswerFieldsProps) {
  return (
    <div className="space-y-3">
      <Label className="mb-2">Correct Answer *</Label>
      <Textarea
        value={typeof question.correct_answer === "string" ? question.correct_answer : ""}
        onChange={(e) => onShortAnswerChange(question.id, e.target.value)}
        placeholder="Enter the correct answer..."
        rows={2}
        required
      />
      <p className="text-sm text-muted-foreground">
        Students must type exactly this answer (case-sensitive)
      </p>
    </div>
  );
}