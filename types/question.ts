export type MatchingPair = {
    left: string;
    right: string;
};

export type Question = {
    id: string;
    question_text: string;
    question_type: "multiple_choice" | "short_answer" | "matching";
    options?: string[] | MatchingPair[];
    matching_pairs?: MatchingPair[];
    correct_answer?: string | string[] | MatchingPair[];
    points: number;
    order: number;
};

export type ExamData = {
    title: string;
    description: string;
    duration: number;
    is_published: boolean;          
};