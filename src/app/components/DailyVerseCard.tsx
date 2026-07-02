import { BookOpen, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';

interface DailyVerseCardProps {
  verse: string;
  reference: string;
  onClick?: () => void;
}

export function DailyVerseCard({ verse, reference, onClick }: DailyVerseCardProps) {
  return (
    <Card 
      className="bg-gradient-to-br from-primary-50 to-sky-50 border-primary-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold">Daily Verse</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <p className="text-foreground italic mb-3 leading-relaxed">
        "{verse}"
      </p>
      
      <p className="text-sm text-primary-600 font-medium">
        {reference}
      </p>
    </Card>
  );
}