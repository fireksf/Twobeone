import { MessageCircle, Sun, Heart, Scale, Church, Plane, Shield, Handshake, Baby, DollarSign, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface CategorySelectionProps {
  onSelectCategory: (categoryId: string) => void;
  onBack?: () => void;
}

export function CategorySelection({ onSelectCategory, onBack }: CategorySelectionProps) {
  const { t } = useLanguage();
  const categories = [
    { 
      id: 'daily-life', 
      label: 'Daily Life & Habits', 
      icon: Sun,
      color: 'from-warning-500 to-warning-500',
      bgColor: 'bg-gradient-to-br from-warning-50 to-warning-50',
      borderColor: 'border-warning-500/30',
      textColor: 'text-warning-700',
      description: 'Explore daily routines and habits'
    },
    { 
      id: 'intimacy', 
      label: 'Intimacy & Lifestyle', 
      icon: Heart,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      description: 'Deepen connection and understanding'
    },
    { 
      id: 'love-balance', 
      label: 'Love & Balance', 
      icon: Scale,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      description: 'Finding harmony in relationships'
    },
    { 
      id: 'dream-wedding', 
      label: 'Dream Wedding / Dream Home', 
      icon: Church,
      color: 'from-sky-500 to-primary-500',
      bgColor: 'bg-gradient-to-br from-sky-50 to-primary-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-700',
      description: 'Plan your future together'
    },
    { 
      id: 'travel', 
      label: 'Travel & Adventure', 
      icon: Plane,
      color: 'from-sky-500 to-sky-500',
      bgColor: 'bg-gradient-to-br from-sky-50 to-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-700',
      description: 'Explore the world together'
    },
    { 
      id: 'boundaries', 
      label: 'Relationship Boundaries', 
      icon: Shield,
      color: 'from-success-500 to-sky-500',
      bgColor: 'bg-gradient-to-br from-success-50 to-sky-50',
      borderColor: 'border-success-500/30',
      textColor: 'text-success-700',
      description: 'Establish healthy boundaries'
    },
    { 
      id: 'trust', 
      label: 'Trust & Truth', 
      icon: Handshake,
      color: 'from-sky-500 to-sky-500',
      bgColor: 'bg-gradient-to-br from-sky-50 to-sky-100',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-700',
      description: 'Build trust and transparency'
    },
    { 
      id: 'kids-future', 
      label: 'Kids & Future', 
      icon: Baby,
      color: 'from-primary-500 to-primary-500',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-50',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      description: 'Discuss family planning'
    },
    { 
      id: 'finance', 
      label: 'Finance & Goals', 
      icon: DollarSign,
      color: 'from-success-500 to-success-700',
      bgColor: 'bg-gradient-to-br from-success-50 to-success-50',
      borderColor: 'border-success-500/30',
      textColor: 'text-success-700',
      description: 'Plan your financial future'
    },
    { 
      id: 'family', 
      label: 'Family Relations', 
      icon: Users,
      color: 'from-warning-500 to-warning-500',
      bgColor: 'bg-gradient-to-br from-warning-50 to-warning-50',
      borderColor: 'border-warning-500/30',
      textColor: 'text-warning-700',
      description: 'Navigate family dynamics'
    },
    { 
      id: 'bible', 
      label: 'Bible Convictions', 
      icon: BookOpen,
      color: 'from-primary-500 to-primary-500',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-50',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      description: 'Discuss faith and beliefs'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Back Icon Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-3 rounded-full bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border border-primary-200 hover:border-primary-400 group"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary-600 group-hover:text-primary-700" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {t.questions.selectCategory}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t.questions.knowEachOther} meaningful questions and deepen your relationship
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className={`${category.bgColor} ${category.borderColor} cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2`}
                onClick={() => onSelectCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className={`font-semibold text-lg ${category.textColor}`}>
                        {category.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* All Categories Option */}
        <Card
          className="bg-gradient-to-br from-primary-50 to-sky-50 border-primary-200 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2"
          onClick={() => onSelectCategory('all')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-primary-700">
                    All Questions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all available questions across every category
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                →
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            size="lg"
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}