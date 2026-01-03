import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShortAnswerQuestion as SAQType } from "./types";

interface ShortAnswerQuestionProps {
  question: SAQType;
  onUpdate: (updates: Partial<SAQType>) => void;
}

export function ShortAnswerQuestion({ question, onUpdate }: ShortAnswerQuestionProps) {
  return (
    <div className="space-y-3">
      <Label className="mb-2">Correct Answer *</Label>
      <Textarea
        value={question.correct_answer}
        onChange={(e) => onUpdate({ correct_answer: e.target.value })}
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