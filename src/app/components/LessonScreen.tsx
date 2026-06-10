import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { getStaticModule, type StaticModule } from '../data/modules';

interface LessonScreenProps {
  moduleId: string;
  lessonId?: string;
  onBack: () => void;
  accessToken?: string;
}

export function LessonScreen({ moduleId, lessonId, onBack, accessToken }: LessonScreenProps) {
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [moduleProgress, setModuleProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const module: StaticModule | undefined = getStaticModule(moduleId);

  // Set initial lesson index from lessonId prop
  useEffect(() => {
    if (module && lessonId) {
      const idx = module.lessons.findIndex((l) => l.id === lessonId);
      if (idx >= 0) setCurrentLessonIndex(idx);
    }
  }, [moduleId, lessonId]);

  // Load progress overlay from API (non-blocking)
  useEffect(() => {
    loadModuleProgress();
  }, [moduleId]);

  // Load notes + completion status when lesson changes
  useEffect(() => {
    if (module && module.lessons[currentLessonIndex]) {
      const lesson = module.lessons[currentLessonIndex];
      setIsCompleted(completedLessonIds.has(lesson.id));
      loadLessonNotes(lesson.id);
    }
  }, [currentLessonIndex, module, completedLessonIds]);

  const authHeader = () => ({ Authorization: `Bearer ${accessToken || publicAnonKey}` });

  const loadModuleProgress = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/modules/${moduleId}/progress`,
        { headers: authHeader() }
      );
      if (res.ok) {
        const { progress, completions } = await res.json();
        setModuleProgress(typeof progress === 'number' ? progress : 0);
        if (Array.isArray(completions)) {
          setCompletedLessonIds(new Set(completions.map((c: any) => c.lessonId)));
        }
      }
    } catch (e) {
      // progress overlay is best-effort
    }
  };

  const loadLessonNotes = async (lId: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/modules/${moduleId}/lessons/${lId}/notes`,
        { headers: authHeader() }
      );
      if (res.ok) {
        const { note } = await res.json();
        setNotes(note?.notes ?? '');
      } else {
        setNotes('');
      }
    } catch {
      setNotes('');
    }
  };

  if (!module || module.lessons.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--neutral-600)', fontSize: 'var(--text-callout)',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} /> Back
        </button>
        <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-body)' }}>Module not found.</p>
      </div>
    );
  }

  const currentLesson = module.lessons[currentLessonIndex];
  const totalLessons = module.lessons.length;

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < totalLessons) {
      setCurrentLessonIndex(idx);
      setNotes('');
    }
  };

  const handleMarkComplete = async () => {
    setIsSaving(true);
    try {
      if (notes.trim()) {
        const nr = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/modules/${moduleId}/lessons/${currentLesson.id}/notes`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ notes: notes.trim() }),
          }
        );
        if (!nr.ok) {
          const err = await nr.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to save notes');
        }
      }

      const cr = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/modules/${moduleId}/lessons/${currentLesson.id}/complete`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      if (!cr.ok) {
        const err = await cr.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to mark complete');
      }

      setIsCompleted(true);
      setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));
      await loadModuleProgress();

      setTimeout(() => {
        if (currentLessonIndex < totalLessons - 1) {
          goTo(currentLessonIndex + 1);
          toast.success('Great work! Moving to the next lesson.');
        } else {
          toast.success('Module complete! Well done. 🎉');
        }
      }, 700);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  // accent colour for this module
  const accent = module.accentColor;
  const accentBg = module.accentBg;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', paddingBottom: 'var(--spacing-10)' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <button
          onClick={onBack}
          style={{
            width: 40, height: 40, borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)', backgroundColor: 'var(--card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18, color: 'var(--neutral-600)' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--text-label)', color: accent, fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            {module.title}
          </p>
          <p style={{
            fontSize: 'var(--text-callout)', fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--neutral-900)', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentLesson.title}
          </p>
        </div>
        <span style={{
          fontSize: 'var(--text-label)', color: 'var(--neutral-500)',
          flexShrink: 0, fontWeight: 'var(--font-weight-medium)',
        }}>
          {currentLessonIndex + 1}/{totalLessons}
        </span>
      </div>

      {/* ── Module progress bar ── */}
      <div style={{
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', padding: 'var(--spacing-3) var(--spacing-4)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
          <span style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-600)', fontWeight: 'var(--font-weight-medium)' }}>
            Module Progress
          </span>
          <span style={{ fontSize: 'var(--text-label)', color: accent, fontWeight: 'var(--font-weight-semibold)' }}>
            {moduleProgress}%
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--neutral-100)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${moduleProgress}%`,
            backgroundColor: accent, borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-500)', margin: 'var(--spacing-1) 0 0 0' }}>
          {completedLessonIds.size} of {totalLessons} lessons completed
        </p>
      </div>

      {/* ── Scripture banner ── */}
      <div style={{
        backgroundColor: accentBg,
        border: `1px solid ${module.accentBorder}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-4)',
        display: 'flex', gap: 'var(--spacing-3)',
      }}>
        <Quote style={{ width: 18, height: 18, color: accent, flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 'var(--text-callout)', color: 'var(--neutral-800)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            {module.scripture}
          </p>
          <p style={{ fontSize: 'var(--text-label)', color: accent, fontWeight: 'var(--font-weight-semibold)', margin: 'var(--spacing-1) 0 0 0' }}>
            {module.scriptureRef}
          </p>
        </div>
      </div>

      {/* ── Lesson navigation ── */}
      <div style={{
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', padding: 'var(--spacing-3) var(--spacing-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <button
          onClick={() => goTo(currentLessonIndex - 1)}
          disabled={currentLessonIndex === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
            background: 'none', border: 'none', cursor: currentLessonIndex === 0 ? 'not-allowed' : 'pointer',
            color: currentLessonIndex === 0 ? 'var(--neutral-300)' : 'var(--neutral-600)',
            fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)',
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Prev
        </button>

        <span style={{
          fontSize: 'var(--text-label)', color: 'var(--neutral-500)',
          fontWeight: 'var(--font-weight-medium)',
        }}>
          {currentLesson.duration}
        </span>

        <button
          onClick={() => goTo(currentLessonIndex + 1)}
          disabled={currentLessonIndex === totalLessons - 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
            background: 'none', border: 'none', cursor: currentLessonIndex === totalLessons - 1 ? 'not-allowed' : 'pointer',
            color: currentLessonIndex === totalLessons - 1 ? 'var(--neutral-300)' : 'var(--neutral-600)',
            fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)',
          }}
        >
          Next <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* ── Lesson content ── */}
      <div style={{
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: accentBg,
        }}>
          <BookOpen style={{ width: 18, height: 18, color: accent }} />
          <span style={{ fontSize: 'var(--text-callout)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-900)' }}>
            Lesson Content
          </span>
        </div>
        <div style={{ padding: 'var(--spacing-5)', maxHeight: 480, overflowY: 'auto' }}>
          <pre style={{
            fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontSize: 'var(--text-body)', color: 'var(--neutral-800)',
            lineHeight: 1.7, margin: 0,
          }}>
            {currentLesson.content}
          </pre>
        </div>
      </div>

      {/* ── Notes ── */}
      <div style={{
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border)',
        }}>
          <FileText style={{ width: 18, height: 18, color: 'var(--secondary-600)' }} />
          <span style={{ fontSize: 'var(--text-callout)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-900)' }}>
            Your Notes
          </span>
        </div>
        <div style={{ padding: 'var(--spacing-4)' }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reflect on what you've learned. How will you apply this together?"
            style={{
              width: '100%', minHeight: 120,
              fontSize: 'var(--text-body)', color: 'var(--neutral-800)',
              backgroundColor: 'var(--neutral-50)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-3)',
              resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
      </div>

      {/* ── Mark complete ── */}
      <button
        onClick={handleMarkComplete}
        disabled={isCompleted || isSaving}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)',
          width: '100%', padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius-md)',
          border: 'none', cursor: isCompleted || isSaving ? 'not-allowed' : 'pointer',
          backgroundColor: isCompleted ? 'var(--success-50)' : accent,
          color: isCompleted ? 'var(--success-700)' : '#fff',
          fontSize: 'var(--text-callout)', fontWeight: 'var(--font-weight-semibold)',
          transition: 'opacity 0.15s ease',
          opacity: isSaving ? 0.7 : 1,
        }}
      >
        <CheckCircle2 style={{ width: 18, height: 18 }} />
        {isSaving ? 'Saving…' : isCompleted ? 'Lesson Completed ✓' : 'Mark as Complete'}
      </button>

      {/* ── All lessons list ── */}
      <div style={{
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 'var(--text-callout)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-900)' }}>
            All Lessons
          </span>
        </div>
        <div style={{ padding: 'var(--spacing-2) 0' }}>
          {module.lessons.map((lesson, idx) => {
            const done = completedLessonIds.has(lesson.id);
            const active = idx === currentLessonIndex;
            return (
              <button
                key={lesson.id}
                onClick={() => goTo(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
                  width: '100%', padding: 'var(--spacing-3) var(--spacing-4)',
                  background: active ? accentBg : 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* circle number */}
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  backgroundColor: done ? 'var(--success-500)' : active ? accent : 'var(--neutral-100)',
                  border: done || active ? 'none' : '2px solid var(--neutral-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {done
                    ? <CheckCircle2 style={{ width: 16, height: 16, color: '#fff' }} />
                    : <span style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)', color: active ? '#fff' : 'var(--neutral-500)' }}>{idx + 1}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 'var(--text-callout)', fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    color: done ? 'var(--success-700)' : active ? accent : 'var(--neutral-800)',
                    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {lesson.title}
                  </p>
                  <p style={{ fontSize: 'var(--text-label)', color: 'var(--neutral-400)', margin: 0 }}>
                    {lesson.duration}
                  </p>
                </div>

                {done && (
                  <span style={{ fontSize: 'var(--text-label)', color: 'var(--success-600)', fontWeight: 'var(--font-weight-semibold)', flexShrink: 0 }}>
                    Done ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
