import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultipleChoiceQuestion as MCQType } from "./types";

interface MultipleChoiceQuestionProps {
  question: MCQType;
  onUpdate: (updates: Partial<MCQType>) => void;
}

export function MultipleChoiceQuestion({ question, onUpdate }: MultipleChoiceQuestionProps) {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleCorrectAnswerChange = (value: string) => {
    onUpdate({ correct_answer: value });
  };

  return (
    <div className="space-y-3">
      <Label className="mb-2">Options *</Label>
      <RadioGroup
        value={question.correct_answer}
        onValueChange={handleCorrectAnswerChange}
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={`option${index}`} 
              id={`q${question.id}-opt${index}`} 
            />
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1"
              required
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}