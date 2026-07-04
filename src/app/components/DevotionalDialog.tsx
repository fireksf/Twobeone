import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { BookOpen, Heart, CheckCircle2, Music, Play, Pause } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { PrayerTogetherChat } from './PrayerTogetherChat';
import { useState, useRef, useEffect } from 'react';

interface Devotional {
  id?: string;
  title: string;
  verse: string;
  reference: string;
  reflection: string;
  prayer: string;
  audioUrl?: string;
  language?: string;
}

interface DevotionalDialogProps {
  devotional: Devotional;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
  accessToken?: string;
  projectId?: string;
  currentUserId?: string;
  currentUserName?: string;
  partnerName?: string;
}

export function DevotionalDialog({ 
  devotional, 
  isOpen, 
  onClose, 
  onComplete,
  isCompleted,
  accessToken,
  projectId,
  currentUserId,
  currentUserName,
  partnerName
}: DevotionalDialogProps) {
  const { t } = useLanguage();
  console.log('[DevotionalDialog] Render with:', { 
    isCompleted, 
    hasOnComplete: !!onComplete,
    showButton: !isCompleted && !!onComplete,
    devotionalTitle: devotional.title,
    hasAudio: !!devotional.audioUrl
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset audio when dialog opens/closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioError(false);
    }
  }, [isOpen]);

  // Add audio error handler when audio element is created
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !devotional.audioUrl || devotional.audioUrl.trim() === '') return;

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const error = target.error;
      
      if (error) {
        // Silently log audio errors - audio is optional and failures are expected
        console.log(`Audio unavailable for devotional (Error code: ${error.code})`);
      }
      
      setAudioError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [devotional.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Failed to play audio:', err);
            setIsPlaying(false);
            
            if (err.name === 'NotSupportedError') {
              setAudioError(true);
            } else if (err.name !== 'AbortError') {
              // Only show error for non-abort errors
              setAudioError(true);
            }
          });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0"
        aria-describedby="devotional-description"
        lang={devotional.language === 'am' || devotional.language === 'om' ? devotional.language : undefined}
      >
        {/* Fixed Header - 8dp spacing system */}
        <DialogHeader className="px-4 pt-4 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-100)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <DialogTitle className="text-xl text-foreground">{devotional.title}</DialogTitle>
                <DialogDescription id="devotional-description" className="text-sm text-muted-foreground mt-1">
                  {t.devotionals.description}, reflection, and prayer guidance
                </DialogDescription>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ color: 'var(--success-700)', background: 'var(--success-50)' }}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">{t.devotionals.completed}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Content Area - flexible height */}
        <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
          <div className="space-y-6 max-w-2xl mx-auto">{/* 24dp spacing between sections */}
            {/* Scripture */}
            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--primary-700)' }}>
                <BookOpen className="w-5 h-5" />
                <h3 className="font-semibold">{t.devotionals.todaysScripture}</h3>
              </div>
              <div className="rounded-2xl p-6" style={{ background: 'var(--primary-50)' }}>
                <p className="text-lg italic leading-relaxed mb-4 text-foreground">
                  "{devotional.verse}"
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — {devotional.reference}
                </p>
              </div>
            </section>

            {/* Reflection */}
            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--secondary-700)' }}>
                <Heart className="w-5 h-5" />
                <h3 className="font-semibold">{t.devotionals.reflection}</h3>
              </div>
              <div className="prose max-w-none">
                <p className="leading-relaxed whitespace-pre-line text-foreground">
                  {devotional.reflection}
                </p>
              </div>
            </section>

            {/* Prayer */}
            {devotional.prayer && (
              <section>
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--primary-700)' }}>
                  <Heart className="w-5 h-5" style={{ fill: 'var(--primary-700)' }} />
                  <h3 className="font-semibold">Prayer</h3>
                </div>
                <div className="rounded-2xl p-6" style={{ background: 'var(--secondary-50)' }}>
                  <p className="leading-relaxed whitespace-pre-line italic text-foreground">
                    {devotional.prayer}
                  </p>
                </div>
              </section>
            )}

            {/* Prayer Together Chat */}
            <section>
              {accessToken && projectId && currentUserId && currentUserName && devotional.id && (
                <>
                  <div className="flex items-center gap-2 mb-3 mt-6" style={{ color: 'var(--primary-700)' }}>
                    <Heart className="w-5 h-5" style={{ fill: 'var(--primary-700)' }} />
                    <h3 className="font-semibold">{t.devotionals.prayerTogetherChat}</h3>
                  </div>
                  <PrayerTogetherChat
                    devotionId={devotional.id}
                    accessToken={accessToken}
                    projectId={projectId}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    partnerName={partnerName}
                  />
                </>
              )}
            </section>

            {/* Audio Player Section */}
            {devotional.audioUrl && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-3 mt-6" style={{ color: 'var(--primary-700)' }}>
                  <Music className="w-5 h-5" style={{ fill: 'var(--primary-700)' }} />
                  <h3 className="font-semibold">{t.devotionals.audioReading}</h3>
                </div>
                <div className="rounded-2xl p-6" style={{ background: 'var(--secondary-50)' }}>
                  {audioError ? (
                    <div className="text-center py-8">
                      <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">{t.devotionals.unableToLoadAudio}</p>
                      <p className="text-xs text-muted-foreground">The audio format may not be supported by your browser</p>
                    </div>
                  ) : (
                    <>
                      <audio
                        ref={audioRef}
                        src={devotional.audioUrl || ''}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedMetadata={() => {
                          console.log('Audio loaded successfully:', devotional.audioUrl);
                        }}
                        onError={() => {
                          setAudioError(true);
                          setIsPlaying(false);
                        }}
                        preload="metadata"
                      />

                      <div className="flex items-center gap-4">
                        {/* Play/Pause Button */}
                        <button
                          onClick={togglePlay}
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                          style={{ background: 'var(--primary-600)', color: 'var(--primary-foreground)' }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </button>

                        {/* Progress Bar */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = parseFloat(e.target.value);
                                setCurrentTime(parseFloat(e.target.value));
                              }
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, var(--primary-600) ${(currentTime / duration) * 100}%, var(--primary-200) ${(currentTime / duration) * 100}%)`
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        🎧 {t.devotionals.audioReading}
                      </p>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div
          style={{
            padding: 'var(--spacing-4) var(--spacing-6)',
            borderTop: '1px solid var(--border)',
            background: 'var(--neutral-50)',
            display: 'flex',
            gap: 'var(--spacing-3)',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Close
          </Button>

          {/* Always visible — changes to completed state after marking */}
          {onComplete && (
            <button
              disabled={!!isCompleted}
              onClick={async () => {
                if (isCompleted) return;
                await onComplete();
                onClose();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-2)',
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: 'var(--text-callout)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: isCompleted ? 'not-allowed' : 'pointer',
                transition: 'background 200ms, color 200ms',
                background: isCompleted ? 'var(--neutral-200)' : 'var(--primary-600)',
                color: isCompleted ? 'var(--neutral-500)' : 'var(--primary-foreground)',
              }}
            >
              <CheckCircle2
                style={{
                  width: 'var(--icon-xs)',
                  height: 'var(--icon-xs)',
                  flexShrink: 0,
                  color: isCompleted ? 'var(--success-700)' : 'inherit',
                }}
              />
              {isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}