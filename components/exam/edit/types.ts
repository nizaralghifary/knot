export type MatchingPair = {
  left: string;
  right: string;
};

export type QuestionBase = {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer" | "matching";
  points: number;
  order: number;
};

export type MultipleChoiceQuestion = QuestionBase & {
  question_type: "multiple_choice";
  options: string[];
  correct_answer: string;
  matching_pairs?: never;
};

export type ShortAnswerQuestion = QuestionBase & {
  question_type: "short_answer";
  correct_answer: string;
  options?: never;
  matching_pairs?: never;
};

export type MatchingQuestion = QuestionBase & {
  question_type: "matching";
  matching_pairs: MatchingPair[];
  correct_answer: MatchingPair[];
  options?: never;
};

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | MatchingQuestion;

export type ExamData = {
  title: string;
  description: string;
  duration: number;
  is_published: boolean;
};

export type QuestionFormData = {
  id?: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer" | "matching";
  points: number;
  order: number;
  options?: string[];
  matching_pairs?: MatchingPair[];
  correct_answer: string | string[] | MatchingPair[];
};

export interface QuestionCardProps {
  question: Question;
  index: number;
  questionsCount: number;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onRemoveQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: "up" | "down") => void;
}

export interface ExamDetailsCardProps {
  examData: ExamData;
  onExamDataChange: (data: ExamData) => void;
}

export interface QuestionsSectionProps {
  questions: Question[];
  onAddQuestion: () => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onRemoveQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: "up" | "down") => void;
}