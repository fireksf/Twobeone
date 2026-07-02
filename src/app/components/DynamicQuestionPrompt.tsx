import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, HeartCrack, Check } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';

type QuestionType = 'text' | 'multiple_choice' | 'multiple_select' | 'like_dislike' | 'love_hate' | 'scale' | 'yes_no';

interface QuestionPrompt {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  scaleMax?: number;
}

interface DynamicQuestionPromptProps {
  prompt: QuestionPrompt;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number) => void;
  disabled?: boolean; // Add disabled prop
}

export function DynamicQuestionPrompt({ prompt, value, onChange, disabled = false }: DynamicQuestionPromptProps) {
  const handleChange = (newValue: string | string[] | number) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  // Multiple Choice
  if (prompt.type === 'multiple_choice' && prompt.options) {
    return (
      <div className="space-y-3">
        <label className="text-lg font-bold text-foreground block leading-snug">{prompt.text}</label>
        <div className="space-y-2">
          {prompt.options.map((option, index) => {
            const isSelected = value === option;
            return (
              <button
                key={`${prompt.id}-option-${index}`}
                onClick={() => handleChange(option)}
                disabled={disabled}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-success-500 bg-success-50'
                    : 'border-border bg-card hover:border-border'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={isSelected ? 'text-foreground font-semibold text-base' : 'text-foreground text-base'}>{option}</span>
                  {isSelected && (
                    <svg
                      className="w-6 h-6 text-success-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const renderPromptInput = () => {
    switch (prompt.type) {
      case 'text':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            disabled={disabled}
            className="w-full"
          />
        );

      case 'multiple_select':
        const selectedOptions = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {(prompt.options || []).map((option, index) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <Card
                  key={`${prompt.id}-multi-${index}`}
                  onClick={() => {
                    if (disabled) return;
                    const newValue = isSelected
                      ? selectedOptions.filter(o => o !== option)
                      : [...selectedOptions, option];
                    onChange(newValue);
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : 'hover:bg-muted border-2 border-transparent'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary-600 bg-primary-600' : 'border-border'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case 'like_dislike':
        return (
          <div className="flex gap-4 justify-center py-4">
            <Card
              onClick={() => !disabled && onChange('like')}
              className={`p-6 cursor-pointer transition-all ${
                value === 'like'
                  ? 'bg-success-50 border-2 border-success-700'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <ThumbsUp className={`w-12 h-12 ${value === 'like' ? 'text-success-700' : 'text-muted-foreground'}`} />
                <span className="font-medium">Like</span>
              </div>
            </Card>
            <Card
              onClick={() => !disabled && onChange('dislike')}
              className={`p-6 cursor-pointer transition-all ${
                value === 'dislike'
                  ? 'bg-error-50 border-2 border-error-500'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <ThumbsDown className={`w-12 h-12 ${value === 'dislike' ? 'text-error-500' : 'text-muted-foreground'}`} />
                <span className="font-medium">Dislike</span>
              </div>
            </Card>
          </div>
        );

      case 'love_hate':
        return (
          <div className="flex gap-4 justify-center py-4">
            <Card
              onClick={() => !disabled && onChange('love')}
              className={`p-6 cursor-pointer transition-all ${
                value === 'love'
                  ? 'bg-primary-100 border-2 border-primary-600'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Heart className={`w-12 h-12 ${value === 'love' ? 'text-primary-600 fill-primary-600' : 'text-muted-foreground'}`} />
                <span className="font-medium">Love</span>
              </div>
            </Card>
            <Card
              onClick={() => !disabled && onChange('hate')}
              className={`p-6 cursor-pointer transition-all ${
                value === 'hate'
                  ? 'bg-muted border-2 border-neutral-600'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <HeartCrack className={`w-12 h-12 ${value === 'hate' ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                <span className="font-medium">Hate</span>
              </div>
            </Card>
          </div>
        );

      case 'scale':
        const scaleMax = prompt.scaleMax || 5;
        const currentValue = (value as number) || 0;
        return (
          <div className="py-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">1</span>
              <span className="text-sm text-muted-foreground">{scaleMax}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: scaleMax }, (_, i) => i + 1).map((num) => (
                <Card
                  key={num}
                  onClick={() => !disabled && onChange(num)}
                  className={`w-14 h-14 flex items-center justify-center cursor-pointer transition-all ${
                    currentValue === num
                      ? 'bg-primary-600 text-white border-2 border-primary-600'
                      : 'hover:bg-muted'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg font-semibold">{num}</span>
                </Card>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4 justify-center py-4">
            <Card
              onClick={() => !disabled && onChange('yes')}
              className={`p-6 cursor-pointer transition-all flex-1 max-w-xs ${
                value === 'yes'
                  ? 'bg-success-50 border-2 border-success-700'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Check className={`w-10 h-10 ${value === 'yes' ? 'text-success-700' : 'text-muted-foreground'}`} />
                <span className="font-medium text-lg">Yes</span>
              </div>
            </Card>
            <Card
              onClick={() => !disabled && onChange('no')}
              className={`p-6 cursor-pointer transition-all flex-1 max-w-xs ${
                value === 'no'
                  ? 'bg-error-50 border-2 border-error-500'
                  : 'hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                  value === 'no' ? 'text-error-500' : 'text-muted-foreground'
                }`}>
                  ×
                </div>
                <span className="font-medium text-lg">No</span>
              </div>
            </Card>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unsupported question type</p>;
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-lg font-bold text-foreground block leading-snug">{prompt.text}</Label>
      {renderPromptInput()}
    </div>
  );
}