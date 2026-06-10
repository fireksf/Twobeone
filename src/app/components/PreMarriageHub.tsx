/* MARKER-MAKE-KIT-DISCOVERY-READ */
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Globe,
  BookOpen,
  Heart,
  MessageCircle,
  DollarSign,
  Home,
  Users,
  Lock,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/* ─────────────────────────────────────────────
   STATIC MODULE DEFINITIONS
   These 5 modules are always rendered.
   The API is only used to overlay progress %.
───────────────────────────────────────────── */
const DEFAULT_MODULES = [
  {
    id: 'module-1',
    title: "God's Design for Marriage",
    subtitle: 'Biblical Foundations of Covenant',
    description:
      'Explore the divine blueprint for marriage — from Genesis to Ephesians. Discover why God created marriage as a sacred covenant and how a Christ-centered union reflects His relationship with the Church.',
    scripture:
      '"Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh."',
    scriptureRef: 'Genesis 2:24',
    lessons: [
      { id: '1a', title: 'Marriage as Covenant, Not Contract', duration: '20 min' },
      { id: '1b', title: "The Trinity's Reflection in Marriage", duration: '25 min' },
      { id: '1c', title: 'Leaving & Cleaving: Prioritizing Your Spouse', duration: '20 min' },
      { id: '1d', title: 'Marriage as a Gospel Picture', duration: '30 min' },
    ],
    iconKey: 'book',
    accentColor: 'var(--primary-600)',
    accentBg: 'var(--primary-50)',
    accentBorder: 'var(--primary-200)',
    duration: '1h 35m',
    isLocked: false,
  },
  {
    id: 'module-2',
    title: 'Communication & Conflict',
    subtitle: 'Speaking Truth in Love',
    description:
      'Learn the art of Christ-like communication. Discover how to listen deeply, express vulnerably, and resolve conflict in ways that strengthen your bond rather than erode it.',
    scripture:
      '"Be quick to hear, slow to speak, slow to anger; for the anger of man does not produce the righteousness of God."',
    scriptureRef: 'James 1:19–20',
    lessons: [
      { id: '2a', title: 'The Listening Heart', duration: '25 min' },
      { id: '2b', title: 'Expressing Needs Without Contempt', duration: '20 min' },
      { id: '2c', title: 'Biblical Conflict Resolution', duration: '30 min' },
      { id: '2d', title: 'Forgiveness as a Daily Practice', duration: '25 min' },
    ],
    iconKey: 'message',
    accentColor: 'var(--secondary-600)',
    accentBg: 'var(--secondary-50)',
    accentBorder: 'var(--secondary-200)',
    duration: '1h 40m',
    isLocked: false,
  },
  {
    id: 'module-3',
    title: 'Roles & Servant Leadership',
    subtitle: 'Partnership Rooted in Christ',
    description:
      'Discover what Scripture truly teaches about roles in marriage — not hierarchy for dominance, but servant leadership and mutual submission that mirrors Christ\'s love for the Church.',
    scripture:
      '"Submit to one another out of reverence for Christ… Husbands, love your wives, as Christ loved the church."',
    scriptureRef: 'Ephesians 5:21, 25',
    lessons: [
      { id: '3a', title: 'Mutual Submission in Christ', duration: '25 min' },
      { id: '3b', title: 'The Husband as Servant-Leader', duration: '25 min' },
      { id: '3c', title: "The Wife's Strength and Wisdom", duration: '20 min' },
      { id: '3d', title: 'Decision-Making as a Team', duration: '25 min' },
    ],
    iconKey: 'heart',
    accentColor: 'var(--success-700)',
    accentBg: 'var(--success-50)',
    accentBorder: 'var(--success-200, #bbf7d0)',
    duration: '1h 35m',
    isLocked: false,
  },
  {
    id: 'module-4',
    title: 'Finances & Stewardship',
    subtitle: 'Managing Money with Biblical Wisdom',
    description:
      'Money is one of the top sources of marital conflict. Build a biblical framework for managing finances together — budgeting, giving, debt, and trusting God as your ultimate provider.',
    scripture:
      '"Bring the full tithe into the storehouse… and thereby put me to the test, says the LORD of hosts."',
    scriptureRef: 'Malachi 3:10',
    lessons: [
      { id: '4a', title: 'God as Owner; We Are Stewards', duration: '20 min' },
      { id: '4b', title: 'Building a Budget as a Team', duration: '25 min' },
      { id: '4c', title: 'Debt, Saving & Financial Goals', duration: '30 min' },
      { id: '4d', title: 'Generosity & Tithing Together', duration: '20 min' },
    ],
    iconKey: 'dollar',
    accentColor: 'var(--warning-700)',
    accentBg: 'var(--warning-50)',
    accentBorder: 'var(--warning-200, #fde68a)',
    duration: '1h 35m',
    isLocked: false,
  },
  {
    id: 'module-5',
    title: 'Building Your Future Together',
    subtitle: 'Family, Calling & Community',
    description:
      'Envision and plan your life together — children, extended family, calling, church community, and the legacies you will build. Align your God-given purposes and plant roots that last.',
    scripture:
      '"Unless the LORD builds the house, those who build it labor in vain."',
    scriptureRef: 'Psalm 127:1',
    lessons: [
      { id: '5a', title: 'Navigating In-Laws & Healthy Boundaries', duration: '25 min' },
      { id: '5b', title: 'Children & Parenting Philosophy', duration: '30 min' },
      { id: '5c', title: 'Your Shared Calling & Vocation', duration: '25 min' },
      { id: '5d', title: 'Planting Roots in a Church Home', duration: '20 min' },
    ],
    iconKey: 'home',
    accentColor: 'var(--neutral-700)',
    accentBg: 'var(--neutral-100)',
    accentBorder: 'var(--neutral-200)',
    duration: '1h 40m',
    isLocked: false,
  },
];

type DefaultModule = typeof DEFAULT_MODULES[number];

interface PreMarriageHubProps {
  onModuleClick: (moduleId: string) => void;
  accessToken?: string;
  onBack?: () => void;
}

/* ── tiny helpers ── */
function ModuleIcon({ iconKey, color }: { iconKey: string; color: string }) {
  const s = { color, width: 22, height: 22 } as React.CSSProperties;
  if (iconKey === 'message') return <MessageCircle style={s} />;
  if (iconKey === 'heart')   return <Heart style={s} />;
  if (iconKey === 'dollar')  return <DollarSign style={s} />;
  if (iconKey === 'home')    return <Home style={s} />;
  return <BookOpen style={s} />;
}

function ProgressRing({ value, color }: { value: number; color: string }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={18} cy={18} r={r} stroke="var(--neutral-200)" strokeWidth={3} fill="none" />
      <circle
        cx={18} cy={18} r={r}
        stroke={color} strokeWidth={3} fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

function LinearProgress({ value, color }: { value: number; color: string }) {
  return (
    <div style={{
      height: 6,
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--neutral-200)',
      overflow: 'hidden',
      width: '100%',
    }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        backgroundColor: color,
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

/* ── Module Card ── */
function ModuleCard({
  module,
  index,
  progress,
  onModuleClick,
}: {
  module: DefaultModule;
  index: number;
  progress: number;
  onModuleClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isComplete = progress === 100;
  const hasStarted = progress > 0 && !isComplete;

  const ctaLabel = isComplete ? 'Review' : hasStarted ? 'Continue' : 'Begin';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !module.isLocked && onModuleClick(module.id)}
      onKeyDown={(e) => e.key === 'Enter' && !module.isLocked && onModuleClick(module.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered && !module.isLocked ? module.accentBorder : 'var(--border)'}`,
        boxShadow: hovered && !module.isLocked ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: 'var(--spacing-4)',
        cursor: module.isLocked ? 'not-allowed' : 'pointer',
        opacity: module.isLocked ? 0.55 : 1,
        transform: hovered && !module.isLocked ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)',
      }}
    >
      {/* ── Row 1: icon + title + status ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
        {/* Icon badge */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 'var(--radius-md)',
          backgroundColor: isComplete ? 'var(--success-50)' : module.accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isComplete ? (
            <CheckCircle2 style={{ width: 24, height: 24, color: 'var(--success-500)' }} />
          ) : module.isLocked ? (
            <Lock style={{ width: 22, height: 22, color: 'var(--neutral-400)' }} />
          ) : (
            <ModuleIcon iconKey={module.iconKey} color={module.accentColor} />
          )}
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
            <p style={{
              fontSize: 'var(--text-heading)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--neutral-900)',
              margin: 0,
              lineHeight: 1.3,
            }}>
              {module.title}
            </p>
            {/* Step number pill */}
            <span style={{
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--font-weight-semibold)',
              color: module.accentColor,
              backgroundColor: module.accentBg,
              borderRadius: 'var(--radius-full)',
              padding: '2px 10px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <p style={{
            fontSize: 'var(--text-callout)',
            color: module.accentColor,
            fontWeight: 'var(--font-weight-medium)',
            margin: '2px 0 0 0',
          }}>
            {module.subtitle}
          </p>
        </div>
      </div>

      {/* ── Scripture pull-quote ── */}
      <div style={{
        padding: 'var(--spacing-3)',
        backgroundColor: module.accentBg,
        borderRadius: 'var(--radius-md)',
        borderLeft: `3px solid ${module.accentColor}`,
      }}>
        <p style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--neutral-700)',
          fontStyle: 'italic',
          margin: '0 0 var(--spacing-1) 0',
          lineHeight: 1.55,
        }}>
          {module.scripture}
        </p>
        <p style={{
          fontSize: 'var(--text-label)',
          color: module.accentColor,
          fontWeight: 'var(--font-weight-semibold)',
          margin: 0,
        }}>
          — {module.scriptureRef}
        </p>
      </div>

      {/* ── Description ── */}
      <p style={{
        fontSize: 'var(--text-callout)',
        color: 'var(--neutral-600)',
        lineHeight: 1.6,
        margin: 0,
      }}>
        {module.description}
      </p>

      {/* ── Lesson preview ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
        {module.lessons.slice(0, 3).map((lesson) => (
          <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <div style={{
              width: 5, height: 5, borderRadius: 'var(--radius-full)',
              backgroundColor: module.accentColor, flexShrink: 0,
            }} />
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--neutral-600)', flex: 1 }}>
              {lesson.title}
            </span>
            <span style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-400)', flexShrink: 0 }}>
              {lesson.duration}
            </span>
          </div>
        ))}
        {module.lessons.length > 3 && (
          <span style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-400)', paddingLeft: 13 }}>
            +{module.lessons.length - 3} more
          </span>
        )}
      </div>

      {/* ── Footer: meta + progress + CTA ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
            <span style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-500)' }}>
              {module.lessons.length} lessons · {module.duration}
            </span>
            <span style={{ fontSize: 'var(--text-label)', color: isComplete ? 'var(--success-500)' : 'var(--neutral-500)', fontWeight: 'var(--font-weight-medium)' }}>
              {isComplete ? '✓ Complete' : hasStarted ? `${progress}%` : 'Not started'}
            </span>
          </div>
          <LinearProgress value={progress} color={isComplete ? 'var(--success-500)' : module.accentColor} />
        </div>

        {!module.isLocked && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: module.accentColor,
            color: '#ffffff',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            fontSize: 'var(--text-caption)',
            fontWeight: 'var(--font-weight-semibold)',
            flexShrink: 0,
            minWidth: 90,
            justifyContent: 'center',
          }}>
            {ctaLabel}
            <ChevronRight style={{ width: 14, height: 14 }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main screen ── */
export function PreMarriageHub({ onModuleClick, accessToken, onBack }: PreMarriageHubProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'am'>(() => {
    try { return (localStorage.getItem('twobeone_language') === 'am' ? 'am' : 'en'); } catch { return 'en'; }
  });

  useEffect(() => {
    try { localStorage.setItem('twobeone_language', selectedLanguage); } catch {}
  }, [selectedLanguage]);

  /* Fetch progress from API only — modules are always the 5 defaults above */
  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoadingProgress(true);
      const map: Record<string, number> = {};
      await Promise.allSettled(
        DEFAULT_MODULES.map(async (m) => {
          try {
            const res = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/modules/${m.id}/progress`,
              { headers: { Authorization: `Bearer ${accessToken || publicAnonKey}` } }
            );
            if (res.ok) {
              const { progress } = await res.json();
              map[m.id] = typeof progress === 'number' ? progress : 0;
            }
          } catch {}
        })
      );
      setProgressMap(map);
      setIsLoadingProgress(false);
    };
    fetchProgress();
  }, [accessToken]);

  const modules = DEFAULT_MODULES; // always 5, no API override
  const completedCount = modules.filter((m) => (progressMap[m.id] || 0) === 100).length;
  const overallProgress = modules.length
    ? Math.round(modules.reduce((acc, m) => acc + (progressMap[m.id] || 0), 0) / modules.length)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', paddingBottom: 'var(--spacing-10)' }}>

      {/* Back */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)',
            fontSize: 'var(--text-body)', color: 'var(--neutral-600)',
            fontWeight: 'var(--font-weight-medium)', background: 'none',
            border: 'none', padding: 0, cursor: 'pointer', alignSelf: 'flex-start',
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
          Back
        </button>
      )}

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-700, #be123c) 0%, var(--primary-500) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-6)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen style={{ width: 24, height: 24, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-title)', fontWeight: 'var(--font-weight-bold)', color: '#fff', margin: 0, lineHeight: 1.25 }}>
              Pre-Marriage Guidance
            </h1>
            <p style={{ fontSize: 'var(--text-callout)', color: 'rgba(255,255,255,0.85)', margin: '2px 0 0 0' }}>
              Prepare for a Christ-centered marriage
            </p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
            <span style={{ fontSize: 'var(--text-callout)', color: 'rgba(255,255,255,0.9)', fontWeight: 'var(--font-weight-medium)' }}>
              Overall Progress
            </span>
            <span style={{ fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-bold)', color: '#fff' }}>
              {isLoadingProgress ? '–' : `${overallProgress}%`}
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${overallProgress}%`,
              backgroundColor: '#fff', borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: 'var(--text-label)', color: 'rgba(255,255,255,0.75)', margin: 'var(--spacing-2) 0 0 0' }}>
            {completedCount} of {modules.length} modules completed
            {completedCount === modules.length && ' · Certificate ready! 🎓'}
          </p>
        </div>
      </div>

      {/* ── Language toggle ── */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        {(['en', 'am'] as const).map((lang) => {
          const active = selectedLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${active ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                backgroundColor: active ? 'var(--primary-50)' : 'var(--card)',
                color: active ? 'var(--primary-600)' : 'var(--neutral-600)',
                fontSize: 'var(--text-callout)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Globe style={{ width: 14, height: 14 }} />
              {lang === 'en' ? 'English' : 'አማርኛ'}
            </button>
          );
        })}
      </div>

      {/* ── Section header ── */}
      <div>
        <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-800)', margin: '0 0 2px 0' }}>
          Your Learning Path
        </h2>
        <p style={{ fontSize: 'var(--text-callout)', color: 'var(--neutral-500)', margin: 0 }}>
          {modules.length} modules · Work through them in order
        </p>
      </div>

      {/* ── Module cards ── */}
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          index={index}
          progress={progressMap[module.id] || 0}
          onModuleClick={onModuleClick}
        />
      ))}

      {/* ── Certificate banner (only when all done) ── */}
      {completedCount === modules.length && modules.length > 0 && (
        <div style={{
          backgroundColor: 'var(--success-50)',
          border: '1px solid var(--success-500)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-700)', margin: '0 0 4px 0' }}>
            🎓 All Modules Complete!
          </p>
          <p style={{ fontSize: 'var(--text-callout)', color: 'var(--success-700)', margin: 0 }}>
            You've earned your Pre-Marriage Certificate. Well done!
          </p>
        </div>
      )}
    </div>
  );
}
