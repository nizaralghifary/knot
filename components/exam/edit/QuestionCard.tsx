"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { QuestionCardProps, Question, MultipleChoiceQuestion as MCQType, ShortAnswerQuestion as SAQType, MatchingQuestion as MatchQType } from "./types";

export function QuestionCard({
  question,
  index,
  questionsCount,
  onUpdateQuestion,
  onRemoveQuestion,
  onMoveQuestion
}: QuestionCardProps) {
  const handleQuestionTypeChange = (type: "multiple_choice" | "short_answer" | "matching") => {
    if (type === question.question_type) return;

    if (type === "multiple_choice") {
      const newQuestion: MCQType = {
        ...question,
        question_type: "multiple_choice",
        options: ["", "", "", ""],
        correct_answer: "",
        matching_pairs: undefined
      } as MCQType;
      onUpdateQuestion(question.id, newQuestion);
    } else if (type === "short_answer") {
      const newQuestion: SAQType = {
        ...question,
        question_type: "short_answer",
        correct_answer: "",
        options: undefined,
        matching_pairs: undefined
      } as SAQType;
      onUpdateQuestion(question.id, newQuestion);
    } else if (type === "matching") {
      const newQuestion: MatchQType = {
        ...question,
        question_type: "matching",
        matching_pairs: [{ left: "", right: "" }],
        correct_answer: [{ left: "", right: "" }],
        options: undefined
      } as MatchQType;
      onUpdateQuestion(question.id, newQuestion);
    }
  };

  const handleTextChange = (text: string) => {
    onUpdateQuestion(question.id, { question_text: text });
  };

  const handlePointsChange = (points: number) => {
    onUpdateQuestion(question.id, { points });
  };

  return (
    <Card className="border">
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
                disabled={index === questionsCount - 1}
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
              disabled={questionsCount <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <Label className="mb-2">Question Type</Label>
          <Select
            value={question.question_type}
            onValueChange={handleQuestionTypeChange}
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

        <div>
          <Label className="mb-2">Question Text *</Label>
          <Textarea
            value={question.question_text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter the question..."
            rows={2}
            required
          />
        </div>

        {question.question_type === "multiple_choice" && (
          <MultipleChoiceQuestion
            question={question}
            onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
          />
        )}

        {question.question_type === "short_answer" && (
          <ShortAnswerQuestion
            question={question}
            onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
          />
        )}

        {question.question_type === "matching" && (
          <MatchingQuestion
            question={question}
            onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
          />
        )}

        <div>
          <Label htmlFor={`points-${question.id}`} className="mb-2">Points *</Label>
          <Input
            id={`points-${question.id}`}
            type="number"
            min="1"
            value={question.points || ''}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = Number(value);
              if (value === '') {
                handlePointsChange(0);
              } else if (!isNaN(numValue)) {
                handlePointsChange(numValue);
              }
            }}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
}