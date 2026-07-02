import { memo } from 'react';
import { Home, BookOpen, HandHeart, Users, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = memo(function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useLanguage();
  
  const tabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'devotions', label: t.nav.devotions, icon: BookOpen },
    { id: 'prayer', label: t.nav.prayer, icon: HandHeart },
    { id: 'community', label: t.nav.community, icon: Users },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card  border-t border-border  z-50">
      {/* Safe area compliance: 34dp iOS bottom + 16dp content padding */}
      {/* Total height: 64dp content + 34dp safe area = 98dp (~25rem) */}
      <div className="pb-9">
        {/* 16dp horizontal padding, 64dp height (48dp min touch target + spacing) */}
        <div className="flex justify-around items-center h-16 max-w-6xl mx-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex flex-col items-center justify-center flex-1 
                  min-h-[48px] min-w-[48px]
                  gap-1 transition-colors
                  ${isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground'
                  }
                `}
              >
                {/* 24dp icon size (standard mobile) */}
                <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs truncate max-w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});