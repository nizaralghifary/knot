"use client";

import { Question } from "@/types/question";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MultipleChoiceFieldsProps {
  question: Question;
  onOptionChange: (questionId: string, optionIndex: number, value: string) => void;
  onQuestionChange: (id: string, field: keyof Question, value: any) => void;
}

export function MultipleChoiceFields({ 
  question, 
  onOptionChange, 
  onQuestionChange 
}: MultipleChoiceFieldsProps) {
  if (!Array.isArray(question.options) || (question.options.length > 0 && typeof question.options[0] !== 'string')) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">
          Invalid options format for multiple choice question
        </p>
      </div>
    );
  }

  const options = question.options as string[] || ["", "", "", ""];
  
  const getSelectedOptionIndex = (): string => {
    const correctAnswer = question.correct_answer as string;
    
    if (!correctAnswer || typeof correctAnswer !== 'string' || correctAnswer.trim() === "") {
      return "";
    }
    
    const index = options.findIndex(opt => opt === correctAnswer);
    
    if (index === -1) {
      return "";
    }
    
    return index.toString();
  };

  const handleRadioChange = (selectedIndex: string) => {
    const index = parseInt(selectedIndex);
    const selectedOptionText = options[index] || "";
    
    if (typeof selectedOptionText === 'string' && selectedOptionText.trim()) {
      onQuestionChange(question.id, "correct_answer", selectedOptionText);
    }
  };

  const handleOptionInputChange = (optIndex: number, value: string) => {
    onOptionChange(question.id, optIndex, value);
    
    const currentCorrectAnswer = question.correct_answer as string;
    if (currentCorrectAnswer === options[optIndex]) {
      onQuestionChange(question.id, "correct_answer", value);
    }
  };

  const selectedIndex = getSelectedOptionIndex();
  const selectedOptionText = selectedIndex ? options[parseInt(selectedIndex)] : "";

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2">Options *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Enter options below and select the correct one
        </p>
      </div>
      
      <RadioGroup
        value={selectedIndex}
        onValueChange={handleRadioChange}
        className="space-y-4"
      >
        {options.map((option, optIndex) => (
          <div key={optIndex} className="space-y-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem 
                value={optIndex.toString()} 
                id={`q${question.id}-opt${optIndex}`}
                disabled={!option || typeof option !== 'string' || !option.trim()}
              />
              <Label 
                htmlFor={`q${question.id}-opt${optIndex}`}
                className={`font-normal flex-1 ${(!option || typeof option !== 'string' || !option.trim()) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="text-sm">Option {String.fromCharCode(65 + optIndex)}</span>
                  {(!option || typeof option !== 'string' || !option.trim()) && (
                    <span className="text-xs text-red-500">(empty)</span>
                  )}
                </div>
              </Label>
            </div>
            
            <div className="ml-9">
              <Input
                value={typeof option === 'string' ? option : ''}
                onChange={(e) => handleOptionInputChange(optIndex, e.target.value)}
                placeholder={`Enter text for option ${String.fromCharCode(65 + optIndex)}...`}
                className="w-full"
                required
              />
              
              {selectedIndex === optIndex.toString() && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  This is the correct answer
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {selectedIndex && selectedOptionText && typeof selectedOptionText === 'string' && selectedOptionText.trim() && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Selected answer:</span> "
            {selectedOptionText}
            " (Option {String.fromCharCode(65 + parseInt(selectedIndex))})
          </p>
        </div>
      )}
    </div>
  );
}