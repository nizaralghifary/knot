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
  
  const getSelectedOptionIndex = (): string => {
    const correctAnswer = question.correct_answer as string;
    
    if (!correctAnswer || correctAnswer.trim() === "") {
      return "";
    }
    
    const index = question.options?.findIndex(opt => opt === correctAnswer);
    
    if (index !== undefined && index >= 0) {
      return index.toString();
    }
    
    return "";
  };

  const handleRadioChange = (selectedIndex: string) => {
    const index = parseInt(selectedIndex);
    const selectedOptionText = question.options?.[index] || "";
    
    onQuestionChange(question.id, "correct_answer", selectedOptionText);
  };

  const handleOptionInputChange = (optIndex: number, value: string) => {
    onOptionChange(question.id, optIndex, value);
    
    const currentSelectedIndex = getSelectedOptionIndex();
    if (currentSelectedIndex === optIndex.toString()) {
      onQuestionChange(question.id, "correct_answer", value);
    }
  };

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
                disabled={!option.trim()}
              />
              <Label 
                htmlFor={`q${question.id}-opt${optIndex}`}
                className={`font-normal flex-1 ${!option.trim() ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="text-sm">Option {String.fromCharCode(65 + optIndex)}</span>
                  {!option.trim() && (
                    <span className="text-xs text-red-500">(empty)</span>
                  )}
                </div>
              </Label>
            </div>
            
            <div className="ml-9">
              <Input
                value={option}
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
      
      {selectedIndex && selectedOptionText.trim() && (
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