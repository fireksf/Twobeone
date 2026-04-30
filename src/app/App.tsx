import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { SplashScreen } from './components/SplashScreen';
import { AuthPage } from './components/AuthPage';
import { CoupleDashboard } from './components/CoupleDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { QuizzesHub } from './components/QuizzesHub';
import { PreMarriageHub } from './components/PreMarriageHub';
import { LessonScreen } from './components/LessonScreen';
import { DailyDevotionsFeed } from './components/DailyDevotionsFeed';
import { EnhancedJournal } from './components/EnhancedJournal';
import { PrayerBoard } from './components/PrayerBoard';
import { CommunityGroups } from './components/CommunityGroups';
import { GroupDetailScreen } from './components/GroupDetailScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { QuestionsSection } from './components/QuestionsSection';
import { ProgressSection } from './components/ProgressSection';
import { BottomNavigation } from './components/BottomNavigation';
import { FloatingActionButtons } from './components/FloatingActionButtons';
import { DevotionalDialog } from './components/DevotionalDialog';
import { RelationshipTimeline } from './components/RelationshipTimeline';
import { AdminPanel } from './components/AdminPanel';
import { CategorySelection } from './components/CategorySelection';
import { QADiscussionHub } from './components/QADiscussionHub';
import { DebugQuestions } from './components/DebugQuestions';
import { DebugResponses } from './components/DebugResponses';
import { TestingDashboard } from './components/TestingDashboard';
import { ScriptureMemory } from './components/ScriptureMemory';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { PWADebugInfo } from './components/PWADebugInfo';
import { IconsMissingNotice } from './components/IconsMissingNotice';
import { Button } from './components/ui/button';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { DailyQuestion } from './components/DailyQuestion';
import { createClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { sendNotification } from './utils/notifications';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import api from './utils/api';
import { registerServiceWorker } from './utils/pwa';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAWelcome } from './components/PWAWelcome';
import { PWAUpdateAvailable } from './components/PWAUpdateAvailable';
import { LegalFooter } from './components/LegalFooter';
import { LandingPage } from './components/LandingPage';
import type { JournalEntry, PrayerRequest, Progress, QuestionResponse, User as UserType } from './types';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedScreen, setSelectedScreen] = useState<string | null>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [partner, setPartner] = useState<UserType | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ user: QuestionResponse[], partner: QuestionResponse[] }>({ user: [], partner: [] });
  const [devotionalStreak, setDevotionalStreak] = useState(0);
  const [isDevotionalCompletedToday, setIsDevotionalCompletedToday] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // New state for initial auth check
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedDevotionalId, setSelectedDevotionalId] = useState<string | null>(null);
  const [isDevotionalOpen, setIsDevotionalOpen] = useState(false);
  const [selectedQACategory, setSelectedQACategory] = useState<string | null>(null);
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [todaysDevotional, setTodaysDevotional] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // TEMPORARILY DISABLED - devotional system being migrated to API
  // const devotional = getTodaysDevotional();

  // Register service worker for PWA functionality (only in production)
  useEffect(() => {
    // Only attempt to register service worker if not in preview/development
    const isProduction = window.location.hostname !== 'localhost' && 
                        !window.location.hostname.includes('figma');
    
    if (isProduction) {
      registerServiceWorker().catch(err => {
        console.warn('[PWA] Service Worker not available in this environment');
      });
    } else {
      console.log('[PWA] Skipping service worker registration in preview environment');
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = createClient();
        
        // Try to get existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsInitializing(false);
          return;
        }

        if (session?.access_token) {
          console.log('Found existing session, access token length:', session.access_token.length);
          setUser(session.user);
          setAccessToken(session.access_token);
          setShowLanding(false); // Hide landing page if user has session
          setIsInitializing(false); // Stop initializing, user is authenticated
          await loadUserData(session.access_token);
        } else {
          console.log('No existing session found');
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Init auth error:', error);
        setLoadError('Failed to initialize authentication');
        setIsInitializing(false);
      }
    };

    // Initialize auth
    initAuth();

    // Set up token refresh listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state changed:', event, 'Session exists:', !!session);
      
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        console.log('[App] Token refreshed, updating access token');
        setUser(session.user);
        setAccessToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out');
        setUser(null);
        setAccessToken(null);
      } else if (event === 'SIGNED_IN' && session?.access_token) {
        console.log('[App] User signed in');
        setUser(session.user);
        setAccessToken(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      loadUserData();
    }
  }, [user, accessToken]);

  // Poll for notifications to show real-time toasts
  // Use refs to avoid re-creating polling functions on every render
  const lastNotificationCheckRef = useRef(new Date().toISOString());
  const lastProfileCheckRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!user || !accessToken) return;
    
    const checkForNewNotifications = async () => {
      try {
        // Use centralized API utility instead of direct fetch
        const { notifications } = await api.notifications.list();
          
        // Find new unread notifications since last check
        const newNotifications = notifications.filter((n: any) => 
          !n.read && 
          new Date(n.createdAt) > new Date(lastNotificationCheckRef.current)
        );

          // Show toast for each new notification
          newNotifications.forEach((notification: any) => {
            if (notification.type === 'verse_shared') {
              toast.success(
                `${notification.data?.sharedBy || 'Your partner'} shared a verse with you!`,
                {
                  description: notification.data?.reference,
                  duration: 5000
                }
              );
            } else if (notification.type === 'profile_update' && notification.data?.relationshipStart) {
              // Handle relationship start date notification
              const date = new Date(notification.data.relationshipStart).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              });
              toast.success(
                '💕 Relationship Date Set!',
                {
                  description: `Your partner set your relationship start date to ${date}`,
                  duration: 6000
                }
              );
            } else if (notification.type === 'mood_report') {
              // Handle weekly mood report notification
              toast.success(
                notification.title,
                {
                  description: `${notification.data?.period || 'Your weekly mood report is ready!'}`,
                  duration: 8000
                }
              );
            } else {
              toast.info(notification.title, {
                description: notification.message.substring(0, 100),
                duration: 4000
              });
            }
          });

        // Update last check time
        if (newNotifications.length > 0) {
          lastNotificationCheckRef.current = new Date().toISOString();
        }
      } catch (err: any) {
        // Silently fail for common expected errors
        if (err.message?.includes('timeout') || 
            err.message?.includes('Failed to fetch') || 
            err.message?.includes('Unauthorized')) {
          // Don't show error toast, just log it
          console.log('[App] Notification check skipped:', err.message);
        } else {
          // For unexpected errors, still log but don't show to user
          console.error('[App] Failed to check notifications:', err);
        }
      }
    };

    const checkForProfileUpdates = async () => {
      try {
        // Use centralized API utility instead of direct fetch
        const { profile: updatedProfile } = await api.profile.get();
        
        // Check if profile.updatedAt has changed (indicating a profile update)
        if (updatedProfile?.updatedAt) {
          if (lastProfileCheckRef.current && lastProfileCheckRef.current !== updatedProfile.updatedAt) {
              console.log('[App] Profile updated detected, reloading data...');
              
              // Check if relationshipStart specifically changed
              const oldRelationshipStart = profile?.relationshipStart;
              const newRelationshipStart = updatedProfile.relationshipStart;
              
              if (oldRelationshipStart !== newRelationshipStart && newRelationshipStart) {
                console.log('[App] 💕 Relationship start date changed!', {
                  old: oldRelationshipStart,
                  new: newRelationshipStart
                });
              }
              
            // Reload all user data to get the latest profile including relationshipStart
            await loadUserData();
          }
          lastProfileCheckRef.current = updatedProfile.updatedAt;
        }
      } catch (err: any) {
        // Silently fail - this is background polling
        if (err.message !== 'Failed to fetch' && err.message !== 'Unauthorized') {
          console.error('[App] Failed to check profile updates:', err);
        }
      }
    };

    // Check immediately
    checkForNewNotifications();
    checkForProfileUpdates();

    // Poll every 15 seconds
    const interval = setInterval(() => {
      checkForNewNotifications();
      checkForProfileUpdates();
    }, 15000);
    return () => clearInterval(interval);
  }, [user, accessToken]);

  const loadUserData = async (token?: string) => {
    const authToken = token || accessToken;
    
    if (!authToken || !user) {
      console.log('[App] No access token or user available, skipping data load');
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log('[App] Loading user data with new API service...');
      
      // Load profile using API service (now has automatic retry logic built-in)
      let profileData;
      try {
        profileData = await api.profile.get();
        console.log('[App] Profile data loaded successfully:', profileData);
        setProfile(profileData.profile || null);
        setPartner(profileData.partner || null);
        setLoadError(null);
        
        // Check if user is admin
        try {
          const adminCheckResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/check`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (adminCheckResponse.ok) {
            const adminData = await adminCheckResponse.json();
            setIsAdmin(adminData.isAdmin || false);
          }
        } catch (adminErr) {
          console.warn('[App] Admin check failed (non-critical):', adminErr);
          setIsAdmin(false);
        }
      } catch (profileErr: any) {
        console.error('[App] Profile load failed:', profileErr);
        // Provide more specific error message based on error type
        if (profileErr.message?.includes('timeout') || profileErr.message?.includes('taking too long')) {
          throw new Error('Loading is taking longer than usual. Please check your connection and try again.');
        }
        throw new Error('Unable to load your profile. Please refresh the page or try again later.');
      }

      // Load journal entries (has automatic retry logic built-in)
      try {
        console.log('[App] Loading journal entries...');
        const journalData = await api.journal.list();
        console.log('[App] Journal data received:', journalData);
        setJournalEntries(journalData.entries || []);
      } catch (err: any) {
        console.error('[App] Failed to load journal:', err);
        // Don't block the app, just log the error
        toast.error(`Failed to load journal entries. Some data may not be available.`);
        // Don't throw - continue loading other data
      }

      // Load prayers (non-blocking, silent errors)
      // Prayers are loaded in background and won't block app startup
      api.prayer.list()
        .then((prayerData) => {
          setPrayers(prayerData.prayers || []);
          console.log('[App] Prayers loaded successfully:', prayerData.prayers?.length || 0);
        })
        .catch((err: any) => {
          console.warn('[App] Prayers load failed (non-critical):', err.message);
          setPrayers([]);
          // Silently fail - prayers are not critical for app functionality
        });

      // Load milestones (non-blocking, silent errors)
      // Milestones are loaded in background and won't block app startup
      api.milestones.list()
        .then((milestonesData) => {
          setMilestones(milestonesData.milestones || []);
          if (milestonesData.error) {
            console.warn('[App] Milestones loaded with warning:', milestonesData.error);
          }
          console.log('[App] Milestones loaded successfully:', milestonesData.milestones?.length || 0);
        })
        .catch((err: any) => {
          console.warn('[App] Milestones load failed (non-critical):', err.message);
          setMilestones([]);
          // Silently fail - milestones are not critical for app functionality
        });

      // Load question responses
      try {
        const responsesData = await api.questions.getResponses();
        setResponses({
          user: responsesData.userResponses || [],
          partner: responsesData.partnerResponses || []
        });
      } catch (err: any) {
        // Silently handle timeout errors for responses - they're non-critical
        if (err?.message?.includes('timeout') || err?.message?.includes('taking too long')) {
          console.log('[App] Responses loading timed out (non-critical) - will retry on next refresh');
        } else {
          console.warn('[App] Failed to load responses (non-critical):', err?.message || err);
        }
        // Set empty responses and continue - this is non-critical for app functionality
        setResponses({
          user: [],
          partner: []
        });
        // Don't show error toast - responses are not critical for initial load
      }

      // Load devotionals from backend
      try {
        const devotionsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/devotions`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (devotionsResponse.ok) {
          const { devotions } = await devotionsResponse.json();
          console.log('[App] Devotionals loaded:', devotions?.length || 0);
          setDevotionals(devotions || []);
        } else {
          console.log('[App] Devotionals response not ok:', devotionsResponse.status);
          setDevotionals([]); // Set empty array if no devotionals
        }
      } catch (err) {
        console.log('[App] Failed to load devotionals (this is normal if no devotionals exist yet):', err);
        setDevotionals([]); // Set empty array on error
        // Don't throw - continue loading other data
      }

      // Load devotional streak
      try {
        const streaksResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/streaks`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        if (streaksResponse.ok) {
          const { streaks } = await streaksResponse.json();
          console.log('[App] Streaks loaded:', streaks);
          const devotionalStreakData = streaks?.find((s: any) => s.streak_type === 'devotional');
          console.log('[App] Devotional streak data:', devotionalStreakData);
          const streakValue = devotionalStreakData?.current_streak || 0;
          console.log('[App] Setting devotional streak to:', streakValue);
          setDevotionalStreak(streakValue);
        }
      } catch (err) {
        console.error('[App] Failed to load streaks:', err);
        // Don't throw - continue loading other data
      }

      // Check if today's devotional is completed
      // TEMPORARILY DISABLED - awaiting full devotional API migration
      /*
      try {
        const completionsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/devotional-completions`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        console.log('[App] Devotional completions response status:', completionsResponse.status);
        
        if (completionsResponse.ok) {
          const { completions } = await completionsResponse.json();
          console.log('[App] Devotional completions loaded:', completions);
          console.log('[App] Current devotional ID:', devotional.id);
          
          const today = new Date().toISOString().split('T')[0];
          console.log('[App] Today date:', today);
          
          // Check if there's a completion for today with any devotional
          // The key format is now: completion:${userId}:${today}:${devotion_id}
          const todayCompletion = completions?.find((c: any) => {
            if (!c.completedAt) return false;
            try {
              const completionDate = new Date(c.completedAt).toISOString().split('T')[0];
              const matchesDate = completionDate === today;
              const matchesDevotional = c.devotionId === devotional.id;
              console.log('[App] Checking completion:', { 
                devotionId: c.devotionId, 
                completionDate, 
                matchesDate,
                matchesDevotional,
                matches: matchesDate && matchesDevotional
              });
              return matchesDate && matchesDevotional;
            } catch (err) {
              console.error('[App] Invalid completion date:', c.completedAt);
              return false;
            }
          });
          
          console.log('[App] Today completion found:', !!todayCompletion);
          console.log('[App] Setting isDevotionalCompletedToday to:', !!todayCompletion);
          setIsDevotionalCompletedToday(!!todayCompletion);
        } else {
          console.error('[App] Completions fetch failed with status:', completionsResponse.status);
          // On error, default to false (not completed)
          setIsDevotionalCompletedToday(false);
        }
      } catch (err) {
        console.error('[App] Failed to load devotional completions:', err);
        // On error, default to false (not completed)
        setIsDevotionalCompletedToday(false);
      }
      */

      // Note: Progress and user groups routes don't exist yet in backend
      // We'll add them later or use mock data for now
      
    } catch (error: any) {
      console.error('[App] Failed to load user data:', error);
      const errorMsg = error.message || 'Failed to load user data';
      setLoadError(errorMsg);
      
      // Don't show error toast for auth errors - these are expected during initial load
      if (!errorMsg.includes('401') && !errorMsg.includes('Unauthorized')) {
        // Provide helpful error message
        if (errorMsg.includes('timeout')) {
          toast.error('The server is taking longer than usual. Please check your internet connection and try again.');
        } else {
          toast.error(errorMsg);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setProfile(null);
      setPartner(null);
      setJournalEntries([]);
      setPrayers([]);
      setProgress(null);
      setResponses({ user: [], partner: [] });
      setShowAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
      setLoadError(`Sign out error: ${error}`);
      toast.error(`Sign out error: ${error}`);
    }
  }, []);

  const handleAddJournalEntry = async (entry: { title: string; content: string; isShared: boolean }) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(entry)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Journal entry creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to add journal entry');
      }

      const { entry: newEntry } = await response.json();
      
      // Add the new entry to local state immediately for instant UI feedback
      setJournalEntries(prev => [newEntry, ...prev]);
      
      // Refetch only journal entries (not all data) for consistency
      try {
        const journalData = await api.journal.list();
        setJournalEntries(journalData.entries || []);
      } catch (err) {
        console.error('[App] Failed to refetch journal entries:', err);
      }
      
      // Update progress
      if (progress) {
        await updateProgress({ journalEntries: progress.journalEntries + 1 });
      }

      // Notify partner if entry is shared
      if (entry.isShared && profile?.partnerId && accessToken) {
        await sendNotification({
          recipientId: profile.partnerId,
          type: 'journal',
          title: `${profile.name} added a new journal entry`,
          message: `"${entry.title}" - Check it out in the Journal tab!`,
          data: { entryTitle: entry.title },
          accessToken,
          projectId
        });
      }
    } catch (error) {
      console.error('Failed to add journal entry:', error);
      throw error;
    }
  };

  const handleUpdateJournalEntry = async (id: string, updates: any) => {
    try {
      console.log('[App] Updating journal entry:', id, updates);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[App] Journal update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update journal entry');
      }

      const { entry: updatedEntry } = await response.json();
      console.log('[App] Journal entry updated successfully:', updatedEntry);
      
      // Update local state immediately
      setJournalEntries(prev => 
        prev.map(e => e.id === id ? updatedEntry : e)
      );

      // Refetch only journal entries for consistency
      try {
        const journalData = await api.journal.list();
        setJournalEntries(journalData.entries || []);
      } catch (err) {
        console.error('[App] Failed to refetch journal entries:', err);
      }
    } catch (error: any) {
      console.error('[App] Failed to update journal entry:', error);
      toast.error(error.message || 'Failed to update journal entry');
      throw error;
    }
  };

  const handleDeleteJournalEntry = async (id: string) => {
    try {
      console.log('[App] Starting delete for entry:', id);
      console.log('[App] Current entries before delete:', journalEntries.length);
      
      // Check if this is a partner's entry
      const entryToDelete = journalEntries.find(e => e.id === id);
      if (entryToDelete && (entryToDelete as any).isPartner) {
        console.error('[App] Cannot delete partner entry');
        toast.error("You can't delete your partner's entries");
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const result = await response.json();
      console.log('[App] Delete response:', { ok: response.ok, status: response.status, result });

      if (!response.ok) {
        console.error('[App] Delete failed:', result);
        
        // Show user-friendly error message
        if (result.error === 'Entry not found') {
          toast.error("This entry cannot be deleted. It may belong to your partner.");
        } else {
          toast.error(result.error || 'Failed to delete journal entry');
        }
        return;
      }

      console.log('[App] Delete successful, updating local state...');

      // Immediately remove from local state for instant feedback
      setJournalEntries(prev => {
        const filtered = prev.filter(entry => entry.id !== id);
        console.log('[App] Filtered entries:', filtered.length, 'removed:', prev.length - filtered.length);
        return filtered;
      });
      
      toast.success('Entry deleted!');
      
      // Wait a bit before refetching to ensure backend is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then refetch to ensure consistency
      console.log('[App] Refetching journal entries...');
      try {
        const journalData = await api.journal.list();
        console.log('[App] Refetched entries:', journalData.entries?.length || 0);
        
        // Double check the deleted entry is not in the refetched data
        const stillExists = journalData.entries?.find((e: any) => e.id === id);
        if (stillExists) {
          console.error('[App] ⚠️ WARNING: Deleted entry still exists in refetched data!', stillExists);
        } else {
          console.log('[App] ✅ Confirmed: Entry successfully deleted');
        }
        
        setJournalEntries(journalData.entries || []);
      } catch (err) {
        console.error('[App] Failed to refetch journal entries after delete:', err);
        // Don't update state if refetch fails - keep the optimistic update
      }
    } catch (error: any) {
      console.error('[App] Failed to delete journal entry:', error);
      toast.error(error.message || 'Failed to delete journal entry');
      // Refetch to restore correct state
      try {
        const journalData = await api.journal.list();
        setJournalEntries(journalData.entries || []);
      } catch (err) {
        console.error('[App] Failed to restore state after delete error:', err);
      }
    }
  };

  const handleAddPrayer = async (prayer: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(prayer)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add prayer');
      }

      await loadUserData();
      
      // Update progress
      if (progress) {
        await updateProgress({ prayerRequests: progress.prayerRequests + 1 });
      }

      // Notify partner
      if (profile?.partnerId && accessToken) {
        await sendNotification({
          recipientId: profile.partnerId,
          type: 'prayer',
          title: `${profile.name} added a prayer request`,
          message: `"${prayer.title}" - Join them in prayer!`,
          data: { prayerTitle: prayer.title },
          accessToken,
          projectId
        });
      }
    } catch (error) {
      console.error('Failed to add prayer:', error);
      throw error;
    }
  };

  const handleUpdatePrayer = async (id: string, updates: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update prayer error response:', errorData);
        throw new Error(errorData.error || 'Failed to update prayer');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to update prayer:', error);
      throw error;
    }
  };

  const handleDeletePrayer = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete prayer');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to delete prayer:', error);
      throw error;
    }
  };

  const handleMarkPrayed = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}/pray`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark prayer as prayed');
      }

      await loadUserData();
      toast.success('Marked as prayed! 🙏');
    } catch (error) {
      console.error('Failed to mark prayer as prayed:', error);
      toast.error('Failed to mark as prayed');
      throw error;
    }
  };

  const handleAddMilestone = async (milestone: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(milestone)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add milestone');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to add milestone:', error);
      throw error;
    }
  };

  const handleUpdateMilestone = async (id: string, updates: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to update milestone:', error);
      throw error;
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      throw error;
    }
  };

  const handleSaveQuestionResponse = async (questionId: string, answers: Record<string, string | string[] | number>) => {
    try {
      console.log('[App] Saving question response:', { questionId, answers });
      
      const responseData = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/questions/${questionId}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ answers })
        }
      );

      console.log('[App] Question response save status:', responseData.status);

      if (!responseData.ok) {
        const errorText = await responseData.text();
        console.error('[App] Failed to save response - Status:', responseData.status);
        console.error('[App] Failed to save response - Error:', errorText);
        throw new Error(`Failed to save response (${responseData.status}): ${errorText}`);
      }

      const result = await responseData.json();
      console.log('[App] Question response saved successfully:', result);
      toast.success('Answer saved successfully!');
    } catch (error: any) {
      console.error('[App] Failed to save response:', error);
      toast.error('Failed to save answer');
      throw error;
    }
  };

  const handleCompleteDevotional = async () => {
    // TEMPORARILY DISABLED - devotional completion tracking needs API migration
    toast.info('Devotional completion tracking is being updated. Check back soon!');
    return;
    /*
    try {
      console.log('[App] Marking devotional as complete:', devotional.id);
      console.log('[App] Current streak before completion:', devotionalStreak);
      console.log('[App] Current isDevotionalCompletedToday:', isDevotionalCompletedToday);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/devotional-completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            devotion_id: devotional.id,
            notes: null
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[App] Failed to mark complete - Status:', response.status);
        console.error('[App] Failed to mark complete - Error:', errorText);
        throw new Error('Failed to mark devotional as complete');
      }

      const result = await response.json();
      console.log('[App] Devotional marked complete:', result);

      // Immediately update completion status
      setIsDevotionalCompletedToday(true);

      // Wait a moment for the backend to update the streak
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the updated streak directly
      try {
        const streaksResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/streaks`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (streaksResponse.ok) {
          const { streaks } = await streaksResponse.json();
          console.log('[App] Updated streaks loaded:', streaks);
          const devotionalStreakData = streaks?.find((s: any) => s.streak_type === 'devotional');
          console.log('[App] Updated devotional streak data:', devotionalStreakData);
          const streakValue = devotionalStreakData?.current_streak || 0;
          console.log('[App] Setting devotional streak to:', streakValue);
          setDevotionalStreak(streakValue);
        }
      } catch (err) {
        console.error('[App] Failed to reload streak:', err);
      }

      // Reload all user data
      console.log('[App] Reloading user data to get updated streak...');
      await loadUserData();
      
      console.log('[App] After reload - new streak:', devotionalStreak);
      
      toast.success('Devotional completed! 🎉');
    } catch (error) {
      console.error('[App] Failed to complete devotional:', error);
      toast.error('Failed to mark as complete');
    }
    */
  };

  const updateProgress = async (updates: Partial<Progress>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      await loadUserData();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Only show splash during initial auth check if no user is found yet
  if (isInitializing) {
    return (
      <LanguageProvider>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  // Show landing page for first-time visitors
  if (showLanding && !user) {
    return (
      <LanguageProvider>
        <Toaster />
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      </LanguageProvider>
    );
  }

  if (!user) {
    return (
      <LanguageProvider>
        <AuthPage onAuthSuccess={(token) => {
          setUser(token);
          setShowSplash(true);
        }} />
      </LanguageProvider>
    );
  }

  const isDevotionalCompleted = progress && progress.lastActiveDate && 
    new Date(progress.lastActiveDate).toDateString() === new Date().toDateString();

  // Sample data for new components
  const guidanceModules = [
    { id: '1', title: "God's Design for Marriage", subtitle: 'Biblical Foundations', progress: 85 },
    { id: '2', title: 'Communication & Conflict', subtitle: 'Active Listening', progress: 60 },
    { id: '3', title: 'Roles & Responsibility', subtitle: 'Partnership in Christ', progress: 25 },
  ];

  const reflectionPrompts = [
    "What is one way you can show Christ's love to your partner today?",
    "How has God been working in your relationship this week?",
    "What are you most grateful for about your partner?",
  ];

  const todaysPrompt = reflectionPrompts[new Date().getDate() % reflectionPrompts.length];

  const handleMoodSelect = (mood: string) => {
    console.log('Mood selected:', mood);
    toast.success('Mood recorded!');
  };

  // Admin status is now checked from backend via loadUserData
  // No need to check email here - isAdmin state is set from API

  // Testing Dashboard - accessible via URL parameter or settings
  if (selectedScreen === 'testing') {
    return (
      <LanguageProvider>
        <TestingDashboard onBack={() => setSelectedScreen('home')} />
      </LanguageProvider>
    );
  }

  // If user is admin and navigating to admin panel
  if (isAdmin && selectedScreen === 'admin') {
    return (
      <LanguageProvider>
        <AdminPanel 
          onSignOut={handleSignOut} 
          accessToken={accessToken || undefined}
          onBackToHome={() => setSelectedScreen('dashboard')}
        />
      </LanguageProvider>
    );
  }

  // Debug screen for troubleshooting questions
  if (selectedScreen === 'debug-questions') {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="pt-11 pb-28">
            <div className="max-w-6xl mx-auto px-4">
              <Button
                onClick={() => setSelectedScreen('dashboard')}
                variant="outline"
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
              <DebugQuestions />
            </div>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  // Debug screen for troubleshooting responses
  if (selectedScreen === 'debug-responses') {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="pt-11 pb-28">
            <div className="max-w-6xl mx-auto px-4">
              <Button
                onClick={() => setSelectedScreen('dashboard')}
                variant="outline"
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
              <DebugResponses />
            </div>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Safe area top: 44px iOS / 32px Android */}
        <div className="pt-11 pb-28">
          {/* Max content width 90% with 16dp horizontal padding */}
          <div className="max-w-6xl mx-auto px-4">
            <Toaster />
          
          {/* PWA Welcome Screen */}
          <PWAWelcome />
          
          {/* Offline Indicator */}
          <OfflineIndicator />
          
          {/* PWA Install Prompt */}
          <InstallPrompt />
          
          {/* PWA Update Available */}
          <PWAUpdateAvailable />
          
          {/* Icons Missing Notice */}
          <IconsMissingNotice />
          
          {/* PWA Install Prompt (old) */}
          <PWAInstallPrompt />
          
          {/* iOS Install Prompt (old) */}
          <IOSInstallPrompt />
          
          {/* PWA Update Notification */}
          <PWAUpdateNotification />
          
          {/* PWA Debug Info (tap top-right corner 5 times to show) */}
          <PWADebugInfo />

          {/* Language Selector & Notification Center - Fixed position */}
          <div className="fixed top-4 right-4 z-50 flex items-start gap-2">
            <LanguageSelector 
              variant="dropdown" 
              showLabel={false}
              accessToken={accessToken || undefined}
              userId={profile?.id}
            />
            {user && (
              <NotificationCenter
                accessToken={accessToken}
                projectId={projectId}
                publicAnonKey={publicAnonKey}
                onNotificationClick={(notification) => {
                  // Handle notification clicks - navigate to relevant screen
                  if (notification.type === 'devotional') {
                    // If it's a prayer chat notification, open the specific devotional
                    if (notification.data?.devotionId) {
                      setActiveTab('devotions');
                      // Small delay to ensure tab is switched before opening devotional
                      setTimeout(() => {
                        setIsDevotionalOpen(true);
                      }, 100);
                    } else {
                      setActiveTab('devotions');
                    }
                  } else if (notification.type === 'journal') {
                    setActiveTab('journal');
                  } else if (notification.type === 'prayer') {
                    setActiveTab('prayer');
                  } else if (notification.type === 'question' || notification.type === 'question_answered') {
                    setActiveTab('home');
                    setSelectedScreen('qa-hub');
                  } else if (notification.type === 'mood_report') {
                    setActiveTab('home');
                    setSelectedScreen('mood-analytics');
                  }
                }}
              />
            )}
          </div>

          {/* Error Banner */}
          {loadError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-3">
              <div className="container mx-auto max-w-6xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm text-red-900">Error Loading Profile</h3>
                    <p className="text-xs text-red-700 mt-1">{loadError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs" 
                      onClick={() => loadUserData()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
            {activeTab === 'home' && selectedScreen === 'dashboard' && (
              <CoupleDashboard 
                profile={profile || undefined}
                partner={partner || undefined}
                journalEntries={journalEntries}
                prayers={prayers}
                progress={progress || undefined}
                responses={responses}
                onNavigate={setActiveTab}
                onScreenNavigate={setSelectedScreen}
                accessToken={accessToken || undefined}
                devotionalStreak={devotionalStreak}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'qa-hub' && (
              <DailyQuestion 
                accessToken={accessToken || ''}
                projectId={projectId}
                userProfile={profile}
                partner={partner}
                onPrayTogether={async () => {
                  try {
                    // Switch to prayer tab
                    setActiveTab('prayer');
                    setSelectedScreen('dashboard');
                    
                    toast.success('Opening Prayer Together...');
                  } catch (error) {
                    console.error('Failed to open prayer:', error);
                    toast.error('Failed to open prayer');
                  }
                }}
                onBack={() => setSelectedScreen('dashboard')}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'quizzes' && user && profile && (
              <QuizzesHub 
                profile={profile}
                partner={partner || undefined}
                accessToken={accessToken}
                onBack={() => setSelectedScreen('dashboard')}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'guidance' && (
              <PreMarriageHub 
                onModuleClick={(id) => {
                  setSelectedModuleId(id);
                  setSelectedLessonId('1');
                  setSelectedScreen('lesson');
                }}
                accessToken={accessToken}
                onBack={() => setSelectedScreen('dashboard')}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'lesson' && selectedModuleId && selectedLessonId && (
              <LessonScreen 
                moduleId={selectedModuleId}
                lessonId={selectedLessonId}
                onBack={() => setSelectedScreen('guidance')}
                accessToken={accessToken}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'milestones' && (
              <RelationshipTimeline
                milestones={milestones}
                onAddMilestone={handleAddMilestone}
                onUpdateMilestone={handleUpdateMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                userName={profile?.name}
                partnerName={partner?.name}
              />
            )}

            {/* Scripture Memory Screen */}
            {activeTab === 'home' && selectedScreen === 'scripture-memory' && (
              <ScriptureMemory
                onBack={() => setSelectedScreen('dashboard')}
                accessToken={accessToken || undefined}
                userName={profile?.name}
                partnerName={partner?.name}
              />
            )}

            {/* Mood Analytics Screen */}
            {activeTab === 'home' && selectedScreen === 'mood-analytics' && (
              <MoodAnalytics
                profile={profile || undefined}
                partner={partner || undefined}
                onClose={() => setSelectedScreen('dashboard')}
              />
            )}

            {activeTab === 'home' && selectedScreen === 'daily-question' && user && profile && (
              <DailyQuestion
                accessToken={accessToken}
                projectId={projectId}
                userProfile={profile}
                partner={partner || undefined}
                onPrayTogether={async () => {
                  // Add to prayer list
                  setActiveTab('prayer');
                  toast.success('Prayer time! 🙏');
                }}
                onBack={() => setSelectedScreen('dashboard')}
              />
            )}

            {/* Category Selection Screen */}
            {activeTab === 'home' && selectedScreen === 'category-selection' && (
              <CategorySelection
                onSelectCategory={(categoryId) => {
                  setSelectedQACategory(categoryId);
                  setSelectedScreen('qa-discussion');
                }}
                onBack={() => setSelectedScreen('dashboard')}
              />
            )}

            {/* Q&A Discussion Hub */}
            {activeTab === 'home' && selectedScreen === 'qa-discussion' && selectedQACategory && (
              <QADiscussionHub
                selectedCategory={selectedQACategory}
                onSaveAnswer={handleSaveQuestionResponse}
                onPrayTogether={async (question) => {
                  try {
                    // Switch to prayer tab
                    setActiveTab('prayer');
                    toast.success('Opening Prayer Together...');
                  } catch (error) {
                    console.error('Failed to open prayer:', error);
                    toast.error('Failed to open prayer');
                  }
                }}
                onBack={() => {
                  setSelectedScreen('category-selection');
                  setSelectedQACategory(null);
                }}
                userName={profile?.name}
                partnerName={partner?.name}
              />
            )}

            {activeTab === 'devotions' && (
              <DailyDevotionsFeed 
                onDevotionalClick={(id) => {
                  setSelectedDevotionalId(id);
                  setIsDevotionalOpen(true);
                }}
                accessToken={accessToken || undefined}
                projectId={projectId}
                onBackToHome={() => {
                  setActiveTab('home');
                  setSelectedScreen('dashboard');
                }}
              />
            )}

            {activeTab === 'journal' && (
              <EnhancedJournal 
                entries={journalEntries}
                onAddEntry={handleAddJournalEntry}
                onUpdateEntry={handleUpdateJournalEntry}
                onDeleteEntry={handleDeleteJournalEntry}
                userName={profile?.name}
                partnerName={partner?.name}
                userAvatar={profile?.profilePicture}
                partnerAvatar={partner?.profilePicture}
                accessToken={accessToken!}
                onBackToHome={() => {
                  setActiveTab('home');
                  setSelectedScreen('dashboard');
                }}
              />
            )}

            {activeTab === 'prayer' && (
              <PrayerBoard 
                prayers={prayers}
                onAddPrayer={handleAddPrayer}
                onUpdatePrayer={handleUpdatePrayer}
                onDeletePrayer={handleDeletePrayer}
                onMarkPrayed={handleMarkPrayed}
                onBackToHome={() => {
                  setActiveTab('home');
                  setSelectedScreen('dashboard');
                }}
              />
            )}

            {activeTab === 'community' && !selectedGroupId && (
              <CommunityGroups />
            )}

            {activeTab === 'community' && selectedGroupId && (
              <GroupDetailScreen 
                groupId={selectedGroupId}
                onBack={() => setSelectedGroupId(null)}
              />
            )}

            {activeTab === 'profile' && (
              <SettingsScreen
                profile={profile || undefined}
                partner={partner || undefined}
                onSignOut={handleSignOut}
                onUpdateProfile={async (data) => {
                  try {
                    console.log('[App] Updating profile with data:', data);
                    
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/profile`,
                      {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(data)
                      }
                    );

                    console.log('[App] Profile update response status:', response.status);

                    if (!response.ok) {
                      const errorData = await response.json();
                      console.error('[App] Profile update failed:', errorData);
                      throw new Error(errorData.error || 'Failed to update profile');
                    }

                    const result = await response.json();
                    console.log('[App] Profile update result:', result);

                    // Immediately reload to get the latest data
                    await loadUserData();
                    
                    // Show special message if relationshipStart was updated and user has a partner
                    if (data.relationshipStart && partner) {
                      toast.success('Profile updated! Your partner\'s relationship start date has been synced too. 💕');
                      console.log('[App] Relationship start date synced to partner:', data.relationshipStart);
                    } else {
                      toast.success('Profile updated successfully!');
                    }
                  } catch (error: any) {
                    console.error('Update profile error:', error);
                    toast.error(error.message || 'Failed to update profile');
                    throw error;
                  }
                }}
                accessToken={accessToken || ''}
                onRefresh={loadUserData}
                onNavigateToAdmin={isAdmin ? () => setSelectedScreen('admin') : undefined}
                onNavigateToDebug={() => setSelectedScreen('debug-questions')}
                onNavigateToDebugResponses={() => setSelectedScreen('debug-responses')}
                onNavigateToTesting={() => setSelectedScreen('testing')}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsSection
                responses={responses}
                onSaveResponse={handleSaveQuestionResponse}
              />
            )}

            {activeTab === 'progress' && progress && (
              <ProgressSection progress={progress} />
            )}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Floating Action Buttons */}
          <FloatingActionButtons 
            onPrayClick={() => setActiveTab('prayer')}
          />

          {/* Devotional Dialog */}
          <DevotionalDialog
            devotional={(() => {
              // Find the selected devotional from the loaded devotionals
              if (selectedDevotionalId && devotionals.length > 0) {
                const found = devotionals.find(d => d.id === selectedDevotionalId);
                if (found) {
                  return {
                    id: found.id,
                    title: found.title || 'Daily Devotion',
                    verse: found.verse || '',
                    reference: found.reference || found.verseReference || '',
                    reflection: found.reflection || found.content || '',
                    prayer: found.prayerPrompt || '',
                    audioUrl: found.audioUrl
                  };
                }
              }
              // Fallback if no devotional found
              return {
                title: 'Daily Devotion',
                verse: '',
                reference: '',
                reflection: '',
                prayer: ''
              };
            })()}
            isOpen={isDevotionalOpen}
            onClose={() => setIsDevotionalOpen(false)}
            onComplete={handleCompleteDevotional}
            isCompleted={isDevotionalCompletedToday}
            accessToken={accessToken || undefined}
            projectId={projectId}
            currentUserId={profile?.id}
            currentUserName={profile?.name}
            partnerName={partner?.name}
          />

          {/* Legal Footer */}
          <LegalFooter language={profile?.language as 'en' | 'am' || 'en'} />
        </div>
      </div>
    </div>
    </LanguageProvider>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { BookOpen, HandHeart, MessageCircleHeart, TrendingUp } from 'lucide-react';
import { CoupleProfile } from './components/CoupleProfile';
import { CoupleHeader } from './components/CoupleHeader';
import { DailyVerseCard } from './components/DailyVerseCard';
import { TodaysReflection } from './components/TodaysReflection';
import { RecentMilestones } from './components/RecentMilestones';
import { PreMarriageGuidance } from './components/PreMarriageGuidance';
import { MoodTracker } from './components/MoodTracker';
import { MoodAnalytics } from './components/MoodAnalytics';