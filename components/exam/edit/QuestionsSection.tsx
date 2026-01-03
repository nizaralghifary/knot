import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { QuestionsSectionProps } from "./types";

export function QuestionsSection({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onMoveQuestion
}: QuestionsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Update exam questions</CardDescription>
          </div>
          <Button type="button" onClick={onAddQuestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            questionsCount={questions.length}
            onUpdateQuestion={onUpdateQuestion}
            onRemoveQuestion={onRemoveQuestion}
            onMoveQuestion={onMoveQuestion}
          />
        ))}
      </CardContent>
    </Card>
  );
}