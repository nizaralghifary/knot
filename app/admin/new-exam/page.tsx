"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Question = {
    id: string;
    question_text: string;
    question_type: "multiple_choice" | "short_answer" | "matching";
    options?: string[];
    correct_answer: string | string[];
    points: number;
    order: number;
}

export default function NewExamPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const [examData, setExamData] = useState({
        title: "",
        description: "",
        duration: 60,
        is_published: false,
    })

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: "1",
            question_text: "",
            question_type: "multiple_choice",
            options: ["", "", "", ""],
            correct_answer: "",
            points: 1,
            order: 1,
        }
    ])

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: (questions.length + 1).toString(),
            question_text: "",
            question_type: "multiple_choice",
            options: ["", "", "", ""],
            correct_answer: "",
            points: 1,
            order: questions.length + 1,
        }
        setQuestions([...questions, newQuestion]);
    }

    const handleRemoveQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id).map((q, idx) => ({
                ...q,
                order: idx + 1,
            })));
        }
    }

    const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => 
            q.id === id ? { ...q, [field]: value } : q
        ));
    }

    const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    }

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
                
        // swap questions
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

        // update order
        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: idx + 1,
        }));

        setQuestions(updatedQuestions);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
                }
            }

            const response = await fetch("/api/admin/exams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    exam: examData,
                    questions: questions.map(q => ({
                        ...q,
                        options: q.question_type === "multiple_choice" ? q.options : undefined,
                        correct_answer: q.correct_answer,
                    }))
                })
            })

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create exam");
            }

            toast.success("Exam created successfully!");
            router.push("/admin");
            router.refresh();
        } catch (error: any) {
            toast.error("Error creating exam", {
                description: error.message,
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl text-center font-semibold">Create New Exam</h1>
                    <div className="w-20"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Exam Details</CardTitle>
                            <CardDescription>Enter basic information about the exam</CardDescription>
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
                                            // kalo input kosong, set ke 0 atau null
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
                                    <CardDescription>Add and configure exam questions</CardDescription>
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
                                                    handleQuestionChange(question.id, "question_type", value)
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

                                        {/* options for multiple choice */}
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

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="mb-2">Points *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={question.points || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const numValue = Number(value);
                                                        if (value === '') {
                                                            handleQuestionChange(question.id, "points", 0);
                                                        } else if (!isNaN(numValue)) {
                                                            handleQuestionChange(question.id, "points", Math.max(1, numValue));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (question.points < 1) {
                                                            handleQuestionChange(question.id, "points", 1);
                                                        }
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Exam"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    )
}