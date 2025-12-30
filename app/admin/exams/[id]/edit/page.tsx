"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";

type MatchingPair = {
  left: string;
  right: string;
};

type Question = {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer" | "matching";
  options?: string[];
  matching_pairs?: MatchingPair[];
  correct_answer: string | string[] | MatchingPair[];
  points: number;
  order: number;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditExamPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    }
  });

  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration: 60,
    is_published: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [examId, setExamId] = useState<string>("");
  
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setExamId(resolvedParams.id);
    };
    unwrapParams();
  }, [params])


  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (session?.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!examId) return;

    const fetchExamData = async () => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch exam data");
        }

        const data = await response.json();

        setExamData({
          title: data.title,
          description: data.description || "",
          duration: data.duration,
          is_published: data.is_published,
        });

        const safeParse = (str: string) => {
          try {
            return JSON.parse(str);
          } catch {
            return str;
          }
        };

        const parsedQuestions = data.questions.map((q: any) => {
          let options: string[] | undefined;
          let matching_pairs: MatchingPair[] | undefined;
          let correct_answer: string | string[] | MatchingPair[];

          try {
            if (q.question_type === "multiple_choice") {
              options = safeParse(q.options);
              correct_answer = safeParse(q.correct_answer);
            } else if (q.question_type === "short_answer") {
              correct_answer = safeParse(q.correct_answer);
            } else if (q.question_type === "matching") {
              matching_pairs = safeParse(q.options);
              correct_answer = safeParse(q.correct_answer);
            } else {
              correct_answer = "";
            }
          } catch (err) {
            console.error("Parse error:", err);
            correct_answer = "";
          }

          return {
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options,
            matching_pairs,
            correct_answer,
            points: q.points,
            order: q.order,
          };
        });

        setQuestions(parsedQuestions);
      } catch (error: any) {
        toast.error("Error loading exam", {
          description: error.message,
        });
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-semibold">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      points: 1,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id).map((q, idx) => ({
        ...q,
        order: idx + 1,
      })));
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddMatchingPair = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newPairs = q.matching_pairs || [];
        return {
          ...q,
          matching_pairs: [...newPairs, { left: "", right: "" }]
        };
      }
      return q;
    }));
  };

  const handleRemoveMatchingPair = (questionId: string, pairIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.matching_pairs) {
        const newPairs = q.matching_pairs.filter((_, idx) => idx !== pairIndex);
        return {
          ...q,
          matching_pairs: newPairs,
          correct_answer: newPairs
        };
      }
      return q;
    }));
  };

  const handleMatchingPairChange = (
    questionId: string, 
    pairIndex: number, 
    field: "left" | "right", 
    value: string
  ) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.matching_pairs) {
        const newPairs = [...q.matching_pairs];
        newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };
        
        return {
          ...q,
          matching_pairs: newPairs,
          correct_answer: newPairs
        };
      }
      return q;
    }));
  };

  const handleShortAnswerChange = (questionId: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { 
        ...q, 
        correct_answer: value,
        options: undefined,
        matching_pairs: undefined
      } : q
    ));
  };

  const handleQuestionTypeChange = (questionId: string, type: "multiple_choice" | "short_answer" | "matching") => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (type === "multiple_choice") {
          return {
            ...q,
            question_type: type,
            options: ["", "", "", ""],
            correct_answer: "",
            matching_pairs: undefined
          };
        } else if (type === "short_answer") {
          return {
            ...q,
            question_type: type,
            options: undefined,
            correct_answer: "",
            matching_pairs: undefined
          };
        } else if (type === "matching") {
          return {
            ...q,
            question_type: type,
            options: undefined,
            matching_pairs: [{ left: "", right: "" }],
            correct_answer: [{ left: "", right: "" }]
          };
        }
      }
      return q;
    }));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
                
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));

    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!examData.title.trim()) {
        throw new Error("Exam title is required");
      }

      if (examData.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
      
      for (const q of questions) {
        if (!q.question_text.trim()) {
          throw new Error(`Question ${q.order} text is required`);
        }

        if (q.points <= 0) {
          throw new Error(`Question ${q.order} points must be greater than 0`);
        }

        if (q.question_type === "multiple_choice") {
          if (!q.options || q.options.some(opt => !opt.trim())) {
            throw new Error(`Question ${q.order}: All options must be filled`);
          }
          if (!q.correct_answer) {
            throw new Error(`Question ${q.order}: Correct answer is required`);
          }
        } else if (q.question_type === "short_answer") {
          if (!q.correct_answer || (typeof q.correct_answer === "string" && !q.correct_answer.trim())) {
            throw new Error(`Question ${q.order}: Correct answer is required for short answer`);
          }
        } else if (q.question_type === "matching") {
          if (!q.matching_pairs || q.matching_pairs.length === 0) {
            throw new Error(`Question ${q.order}: At least one matching pair is required`);
          }
          if (q.matching_pairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
            throw new Error(`Question ${q.order}: All matching pairs must have both left and right values`);
          }
        }
      }

      const formattedQuestions = questions.map(q => {
        const baseQuestion = {
          id: q.id.startsWith('new-') ? undefined : q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          order: q.order,
        };

        if (q.question_type === "multiple_choice") {
          return {
            ...baseQuestion,
            options: q.options,
            correct_answer: q.correct_answer
          };
        } else if (q.question_type === "short_answer") {
          return {
            ...baseQuestion,
            correct_answer: q.correct_answer
          };
        } else if (q.question_type === "matching") {
          return {
            ...baseQuestion,
            options: undefined,
            correct_answer: q.matching_pairs
          };
        }
        return baseQuestion;
      });

      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam: examData,
          questions: formattedQuestions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update exam");
      }

      toast.success("Exam updated successfully!");
      router.push(`/admin/exams/${examId}`);
      router.refresh();
    } catch (error: any) {
      toast.error("Error updating exam", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl text-center font-semibold">Edit Exam</h1>
          <div className="w-20"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>Update basic information about the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2">Exam Title *</Label>
                <Input
                  id="title"
                  value={examData.title}
                  onChange={(e) => setExamData({...examData, title: e.target.value})}
                  placeholder="Mathematics Final Exam"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">Description</Label>
                <Textarea
                  id="description"
                  value={examData.description}
                  onChange={(e) => setExamData({...examData, description: e.target.value})}
                  placeholder="Describe what this exam covers..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="mb-2">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={examData.duration || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setExamData({...examData, duration: 0});
                      } else {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue)) {
                          setExamData({...examData, duration: numValue});
                        }
                      }
                    }}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publish">Publish Exam</Label>
                    <p className="text-sm text-muted-foreground">
                      Make exam available to users
                    </p>
                  </div>
                  <Switch
                    id="publish"
                    checked={examData.is_published}
                    onCheckedChange={(checked) => setExamData({...examData, is_published: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Update exam questions</CardDescription>
                </div>
                <Button type="button" onClick={handleAddQuestion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id} className="border">
                  <CardHeader className="bg-muted/50 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Question {question.order}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "down")}
                            disabled={index === questions.length - 1}
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
                          onClick={() => handleRemoveQuestion(question.id)}
                          disabled={questions.length <= 1}
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
                        onValueChange={(value: "multiple_choice" | "short_answer" | "matching") =>
                          handleQuestionTypeChange(question.id, value)
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

                    <div>
                      <Label className="mb-2">Question Text *</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => handleQuestionChange(question.id, "question_text", e.target.value)}
                        placeholder="Enter the question..."
                        rows={2}
                        required
                      />
                    </div>

                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-3">
                        <Label className="mb-2">Options *</Label>
                        <RadioGroup
                          value={question.correct_answer as string}
                          onValueChange={(value) => handleQuestionChange(question.id, "correct_answer", value)}
                        >
                          {question.options!.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={`option${optIndex}`} id={`q${question.id}-opt${optIndex}`} />
                              <Input
                                value={option}
                                onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                className="flex-1"
                                required
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <div className="space-y-3">
                        <Label className="mb-2">Correct Answer *</Label>
                        <Textarea
                          value={typeof question.correct_answer === "string" ? question.correct_answer : ""}
                          onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                          placeholder="Enter the correct answer..."
                          rows={2}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Students must type exactly this answer (case-sensitive)
                        </p>
                      </div>
                    )}

                    {question.question_type === "matching" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="mb-2">Matching Pairs *</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddMatchingPair(question.id)}
                            className="gap-1"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Pair
                          </Button>
                        </div>
                        {question.matching_pairs && question.matching_pairs.map((pair, pairIndex) => (
                          <div key={pairIndex} className="flex items-center gap-2">
                            <Input
                              value={pair.left}
                              onChange={(e) => handleMatchingPairChange(question.id, pairIndex, "left", e.target.value)}
                              placeholder="Left side"
                              className="flex-1"
                              required
                            />
                            <span>→</span>
                            <Input
                              value={pair.right}
                              onChange={(e) => handleMatchingPairChange(question.id, pairIndex, "right", e.target.value)}
                              placeholder="Right side"
                              className="flex-1"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMatchingPair(question.id, pairIndex)}
                              disabled={(question.matching_pairs?.length || 0) <= 1}
                            >
                              <MinusCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                            handleQuestionChange(question.id, "points", 0);
                          } else if (!isNaN(numValue)) {
                            handleQuestionChange(question.id, "points", numValue);
                          }
                        }}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Exam"
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}