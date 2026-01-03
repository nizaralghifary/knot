import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { MatchingQuestion as MatchQType } from "./types";

interface MatchingQuestionProps {
  question: MatchQType;
  onUpdate: (updates: Partial<MatchQType>) => void;
}

export function MatchingQuestion({ question, onUpdate }: MatchingQuestionProps) {
  const handleAddPair = () => {
    const newPairs = [...question.matching_pairs, { left: "", right: "" }];
    onUpdate({ 
      matching_pairs: newPairs,
      correct_answer: newPairs
    });
  };

  const handleRemovePair = (index: number) => {
    if (question.matching_pairs.length <= 1) return;
    
    const newPairs = question.matching_pairs.filter((_, i) => i !== index);
    onUpdate({ 
      matching_pairs: newPairs,
      correct_answer: newPairs
    });
  };

  const handlePairChange = (index: number, field: "left" | "right", value: string) => {
    const newPairs = [...question.matching_pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    
    onUpdate({ 
      matching_pairs: newPairs,
      correct_answer: newPairs
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="mb-2">Matching Pairs *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPair}
          className="gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add Pair
        </Button>
      </div>
      {question.matching_pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={pair.left}
            onChange={(e) => handlePairChange(index, "left", e.target.value)}
            placeholder="Left side"
            className="flex-1"
            required
          />
          <span>→</span>
          <Input
            value={pair.right}
            onChange={(e) => handlePairChange(index, "right", e.target.value)}
            placeholder="Right side"
            className="flex-1"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemovePair(index)}
            disabled={question.matching_pairs.length <= 1}
          >
            <MinusCircle className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}