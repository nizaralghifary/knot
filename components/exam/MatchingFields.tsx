import { Question } from "@/types/question";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";

interface MatchingFieldsProps {
  question: Question;
  onMatchingPairChange: (questionId: string, pairIndex: number, field: "left" | "right", value: string) => void;
  onAddMatchingPair: (questionId: string) => void;
  onRemoveMatchingPair: (questionId: string, pairIndex: number) => void;
}

export function MatchingFields({
  question,
  onMatchingPairChange,
  onAddMatchingPair,
  onRemoveMatchingPair,
}: MatchingFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="mb-2">Matching Pairs *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddMatchingPair(question.id)}
          className="gap-1"
        >
          <PlusCircle className="h-3 w-3" />
          Add Pair
        </Button>
      </div>

      {question.matching_pairs && question.matching_pairs.length > 0 ? (
        <div className="space-y-3">
          {question.matching_pairs.map((pair, pairIndex) => (
            <div key={pairIndex} className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Left Item</Label>
                <Input
                  value={pair.left}
                  onChange={(e) => onMatchingPairChange(question.id, pairIndex, "left", e.target.value)}
                  placeholder="e.g., Capital of France"
                  required
                />
              </div>

              <div className="flex-1 space-y-1">
                <Label className="text-xs">Right Item</Label>
                <Input
                  value={pair.right}
                  onChange={(e) => onMatchingPairChange(question.id, pairIndex, "right", e.target.value)}
                  placeholder="e.g., Paris"
                  required
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMatchingPair(question.id, pairIndex)}
                disabled={question.matching_pairs!.length <= 1}
                className="mt-5"
              >
                <MinusCircle className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground border rounded-lg">
          No matching pairs added yet. Click "Add Pair" to add.
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Students will need to match left items with right items
      </p>
    </div>
  );
}