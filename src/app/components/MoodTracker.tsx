import { Smile } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { moods as moodsApi } from '../utils/api';
import { toast } from 'sonner';

interface MoodTrackerProps {
  onMoodSelect: (mood: string) => void;
  userMood?: string;
  partnerMood?: string;
}

export function MoodTracker({ onMoodSelect, userMood, partnerMood }: MoodTrackerProps) {
  const { t } = useLanguage();
  const moods = [
    { emoji: '😊', value: 'great', label: t.mood.great },
    { emoji: '😐', value: 'okay', label: t.mood.okay },
    { emoji: '😔', value: 'sad', label: t.mood.sad },
  ];
  const [selectedMood, setSelectedMood] = useState<string | null>(userMood || null);
  const [isSaving, setIsSaving] = useState(false);

  const handleMoodClick = async (moodValue: string) => {
    setSelectedMood(moodValue);
    onMoodSelect(moodValue);
    
    // Save to backend
    setIsSaving(true);
    try {
      await moodsApi.save(moodValue as 'great' | 'good' | 'okay' | 'sad');
      toast.success(t.mood.moodSaved);
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error(t.mood.failedToSaveMood);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white rounded-2xl p-6">
      <div className="flex items-center gap-2 text-rose-600 mb-4">
        <Smile className="w-5 h-5" />
        <h3 className="font-medium">{t.mood.howAreWeToday}</h3>
      </div>
      
      <div className="space-y-4">
        {/* You */}
        <div>
          <p className="text-sm text-gray-600 mb-2">{t.mood.you}</p>
          <div className="flex gap-3">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodClick(mood.value)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                  selectedMood === mood.value
                    ? 'bg-orange-100 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Partner */}
        <div>
          <p className="text-sm text-gray-600 mb-2">{t.mood.partner}</p>
          <div className="flex gap-3">
            {moods.map((mood) => (
              <div
                key={mood.value}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  partnerMood === mood.value
                    ? 'bg-blue-100'
                    : 'bg-gray-100 opacity-40'
                }`}
              >
                {mood.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}