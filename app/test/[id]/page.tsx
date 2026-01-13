"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, AlertCircle, Shuffle, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

interface MatchingPair {
  left: string;
  right: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  matching_pairs?: MatchingPair[];
  right_options?: string[];
  points: number;
  order: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  
  const [selectedLeft, setSelectedLeft] = useState<Record<string, string>>({});
  const [selectedRight, setSelectedRight] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAttemptAndFetchExam();
  }, []);

  useEffect(() => {
    if (!exam || alreadyCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, alreadyCompleted]);

  const checkAttemptAndFetchExam = async () => {
    try {
      const attemptResponse = await fetch(`/api/exams/${params.id}/check-attempt`);
      if (!attemptResponse.ok) {
        throw new Error("Failed to check attempt");
      }
      const attemptData = await attemptResponse.json();

      if (attemptData.completed) {
        setAlreadyCompleted(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/exams/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch exam");
      }
      
      const data = await response.json();
      setExam(data);
      setTimeRemaining(data.duration * 60);
    } catch (error: any) {
      toast.error(error.message || "Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleMatchingSelect = (questionId: string, side: 'left' | 'right', value: string) => {
    if (side === 'left') {
      setSelectedLeft(prev => ({ ...prev, [questionId]: value }));
    } else {
      setSelectedRight(prev => ({ ...prev, [questionId]: value }));
      
      const leftValue = selectedLeft[questionId];
      if (leftValue) {
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {}),
            [leftValue]: value
          }
        }));
        
        setSelectedLeft(prev => ({ ...prev, [questionId]: '' }));
        setSelectedRight(prev => ({ ...prev, [questionId]: '' }));
      }
    }
  };

  const removeMatch = (questionId: string, leftItem: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (newAnswers[questionId]) {
        const { [leftItem]: removed, ...rest } = newAnswers[questionId];
        newAnswers[questionId] = rest;
      }
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unansweredQuestions = exam?.questions.filter(
      (q) => {
        if (q.question_type === "matching") {
          const matchingAnswer = answers[q.id];
          if (!matchingAnswer) return true;
          const leftItems = q.matching_pairs?.map(pair => pair.left) || [];
          return leftItems.some(left => !matchingAnswer[left]);
        }
        return !answers[q.id];
      }
    ).length || 0;

    if (unansweredQuestions > 0) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = exam?.questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id] || null,
      })) || [];

      const response = await fetch(`/api/exams/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit exam");
      }

      const result = await response.json();
      toast.success("Exam submitted successfully!");
      router.push(`/result/${result.attemptId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Already Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have already completed this exam. You can only take each exam once.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Exam not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back
            </Link>
          </Button>

          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-semibold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            {exam.description && (
              <CardDescription>{exam.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {exam.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({question.points} {question.points === 1 ? "point" : "points"})
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {question.question_type.replace("_", " ")}
                  </Badge>
                </CardTitle>
                <CardDescription>{question.question_text}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Multiple Choice */}
                {question.question_type === "multiple_choice" && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, value)
                    }
                    className="space-y-3"
                  >
                    {question.options?.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${idx}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${idx}`}
                          className="cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Short Answer */}
                {question.question_type === "short_answer" && (
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${question.id}`}>Your Answer:</Label>
                    <Input
                      id={`answer-${question.id}`}
                      placeholder="Type your answer here..."
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Matching */}
                {question.question_type === "matching" && question.matching_pairs && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shuffle className="h-3 w-3" />
                        <span>Items randomized</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-center mb-4 pb-2 border-b">
                            Left Items
                          </div>
                          <RadioGroup
                            value={selectedLeft[question.id] || ""}
                            onValueChange={(value) => 
                              handleMatchingSelect(question.id, 'left', value)
                            }
                            className="space-y-3"
                          >
                            {question.matching_pairs.map((pair, idx) => {
                              const isMatched = answers[question.id]?.[pair.left];
                              const isSelected = selectedLeft[question.id] === pair.left;
                              
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "relative flex items-center space-x-3 p-4 border-2 rounded-lg transition-all",
                                    isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-950",
                                    isMatched && "border-green-500 bg-green-50 dark:bg-green-950",
                                    !isSelected && !isMatched && "hover:bg-muted/50 border-gray-200"
                                  )}
                                  id={`left-${question.id}-${idx}`}
                                >
                                  <RadioGroupItem
                                    value={pair.left}
                                    id={`left-radio-${question.id}-${idx}`}
                                    disabled={!!isMatched}
                                  />
                                  <Label
                                    htmlFor={`left-radio-${question.id}-${idx}`}
                                    className={cn(
                                      "cursor-pointer flex-1 font-medium",
                                      isMatched && "cursor-not-allowed opacity-70"
                                    )}
                                  >
                                    {pair.left}
                                  </Label>
                                  {isMatched && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        → {isMatched}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => removeMatch(question.id, pair.left)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-center mb-4 pb-2 border-b">
                            Right Items
                          </div>
                          <RadioGroup
                            value={selectedRight[question.id] || ""}
                            onValueChange={(value) => 
                              handleMatchingSelect(question.id, 'right', value)
                            }
                            className="space-y-3"
                          >
                            {question.right_options?.map((option, idx) => {
                              const isMatched = Object.values(answers[question.id] || {}).includes(option);
                              const isSelected = selectedRight[question.id] === option;
                              
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex items-center space-x-3 p-4 border-2 rounded-lg transition-all",
                                    isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-950",
                                    isMatched && "border-green-500 bg-green-50 dark:bg-green-950",
                                    !isSelected && !isMatched && "hover:bg-muted/50 border-gray-200"
                                  )}
                                  id={`right-${question.id}-${idx}`}
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`right-radio-${question.id}-${idx}`}
                                    disabled={!!isMatched || !selectedLeft[question.id]}
                                  />
                                  <Label
                                    htmlFor={`right-radio-${question.id}-${idx}`}
                                    className={cn(
                                      "cursor-pointer flex-1 font-medium",
                                      (isMatched || !selectedLeft[question.id]) && "cursor-not-allowed opacity-70"
                                    )}
                                  >
                                    {option}
                                  </Label>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </div>
                      </div>

                      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                        {Object.entries(answers[question.id] || {}).map(([left, right], idx) => {
                          const leftIdx = question.matching_pairs?.findIndex(p => p.left === left);
                          const rightIdx = question.right_options?.findIndex(o => o === right);
                          
                          if (leftIdx === undefined || leftIdx === -1 || rightIdx === undefined || rightIdx === -1) {
                            return null;
                          }
                          
                          const leftY = 80 + (leftIdx * 76) + 38;
                          const rightY = 80 + (rightIdx * 76) + 38;
                          
                          return (
                            <line
                              key={idx}
                              x1="48%"
                              y1={leftY}
                              x2="52%"
                              y2={rightY}
                              stroke="#22c55e"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              opacity="0.6"
                            />
                          );
                        })}
                      </svg>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>How to match:</strong>
                        <br />
                        1. Click a radio button on the left to select an item
                        <br />
                        2. Then click the corresponding match on the right
                        <br />
                        3. A green arrow will point to your choice
                        <br />
                        4. Click the X button to remove a match if needed
                      </p>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Matched: {Object.keys(answers[question.id] || {}).length} / {question.matching_pairs.length}
                    </div>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Spinner className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Exam
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}