import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { SEOHead } from "./components/SEOHead";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LanguageSelector } from "./components/LanguageSelector";
import { SplashScreen } from "./components/SplashScreen";
import { AuthPage } from "./components/AuthPage";
import { CoupleDashboard } from "./components/CoupleDashboard";
import { NotificationCenter } from "./components/NotificationCenter";
import { QuizzesHub } from "./components/QuizzesHub";
import { PreMarriageHub } from "./components/PreMarriageHub";
import { LessonScreen } from "./components/LessonScreen";
import { DailyDevotionsFeed } from "./components/DailyDevotionsFeed";
import { EnhancedJournal } from "./components/EnhancedJournal";
import { PrayerBoard } from "./components/PrayerBoard";
import { CommunityGroups } from "./components/CommunityGroups";
import { GroupDetailScreen } from "./components/GroupDetailScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { QuestionsSection } from "./components/QuestionsSection";
import { ProgressSection } from "./components/ProgressSection";
import { BottomNavigation } from "./components/BottomNavigation";
import { FloatingActionButtons } from "./components/FloatingActionButtons";
import { DevotionalDialog } from "./components/DevotionalDialog";
import { RelationshipTimeline } from "./components/RelationshipTimeline";
import { AdminPanel } from "./components/AdminPanel";
import { CategorySelection } from "./components/CategorySelection";
import { QADiscussionHub } from "./components/QADiscussionHub";
import { DebugQuestions } from "./components/DebugQuestions";
import { DebugResponses } from "./components/DebugResponses";
import { TestingDashboard } from "./components/TestingDashboard";
import { ScriptureMemory } from "./components/ScriptureMemory";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAUpdateNotification } from "./components/PWAUpdateNotification";
import { IOSInstallPrompt } from "./components/IOSInstallPrompt";
import { PWADebugInfo } from "./components/PWADebugInfo";
import { IconsMissingNotice } from "./components/IconsMissingNotice";
import { InstallBanner } from "./components/InstallBanner";
import { Button } from "./components/ui/button";
import {
  Heart,
  Loader2,
  AlertCircle,
  BookOpen,
  HandHeart,
  MessageCircleHeart,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { CoupleProfile } from "./components/CoupleProfile";
import { CoupleHeader } from "./components/CoupleHeader";
import { DailyVerseCard } from "./components/DailyVerseCard";
import { TodaysReflection } from "./components/TodaysReflection";
import { RecentMilestones } from "./components/RecentMilestones";
import { PreMarriageGuidance } from "./components/PreMarriageGuidance";
import { MoodTracker } from "./components/MoodTracker";
import { MoodAnalytics } from "./components/MoodAnalytics";
import { DailyQuestion } from "./components/DailyQuestion";
import { createClient } from "./utils/supabase/client";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";
import { sendNotification } from "./utils/notifications";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import api, {
  warmUpServer,
  admin as adminApi,
} from "./utils/api";
import { registerServiceWorker } from "./utils/pwa";
import { InstallPrompt } from "./components/InstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PWAWelcome } from "./components/PWAWelcome";
import { PWAUpdateAvailable } from "./components/PWAUpdateAvailable";
import { LegalFooter } from "./components/LegalFooter";
import { LandingPage } from "./components/LandingPage";
import type {
  JournalEntry,
  PrayerRequest,
  Progress,
  QuestionResponse,
  User as UserType,
} from "./types";

// Module-scope constants — defined once, never recreated on render
const QA_CATEGORY_LABELS: Record<string, string> = {
  "daily-life": "Daily Life & Habits",
  intimacy: "Intimacy & Lifestyle",
  "love-balance": "Love & Balance",
  "dream-wedding": "Dream Wedding / Dream Home",
  travel: "Travel & Adventure",
  boundaries: "Relationship Boundaries",
  trust: "Trust & Truth",
  "kids-future": "Kids & Future",
  finance: "Finance & Goals",
  family: "Family Relations",
  bible: "Bible Convictions",
} as const;

const GUIDANCE_MODULES = [
  {
    id: "1",
    title: "God's Design for Marriage",
    subtitle: "Biblical Foundations",
    progress: 85,
  },
  {
    id: "2",
    title: "Communication & Conflict",
    subtitle: "Active Listening",
    progress: 60,
  },
  {
    id: "3",
    title: "Roles & Responsibility",
    subtitle: "Partnership in Christ",
    progress: 25,
  },
] as const;

const REFLECTION_PROMPTS = [
  "What is one way you can show Christ's love to your partner today?",
  "How has God been working in your relationship this week?",
  "What are you most grateful for about your partner?",
] as const;

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedScreen, setSelectedScreen] = useState<
    string | null
  >("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [profile, setProfile] = useState<UserType | null>(null);
  const [partner, setPartner] = useState<UserType | null>(null);
  const [journalEntries, setJournalEntries] = useState<
    JournalEntry[]
  >([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [progress, setProgress] = useState<Progress | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<
    string | null
  >(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    null,
  );
  const [responses, setResponses] = useState<{
    user: QuestionResponse[];
    partner: QuestionResponse[];
  }>({ user: [], partner: [] });
  const [devotionalStreak, setDevotionalStreak] = useState(0);
  const [
    isDevotionalCompletedToday,
    setIsDevotionalCompletedToday,
  ] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // New state for initial auth check
  const [selectedModuleId, setSelectedModuleId] = useState<
    string | null
  >(null);
  const [selectedLessonId, setSelectedLessonId] = useState<
    string | null
  >(null);
  const [selectedDevotionalId, setSelectedDevotionalId] =
    useState<string | null>(null);
  const [isDevotionalOpen, setIsDevotionalOpen] =
    useState(false);
  const [selectedQACategory, setSelectedQACategory] = useState<
    string | null
  >(null);
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [todaysDevotional, setTodaysDevotional] = useState<
    any | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // TEMPORARILY DISABLED - devotional system being migrated to API
  // const devotional = getTodaysDevotional();

  // Register service worker for PWA / offline support.
  // Try to register directly — catch SecurityError (MIME mismatch in preview) silently.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((reg) => {
        console.log("[PWA] Service Worker registered:", reg.scope);
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (w) w.addEventListener("statechange", () => {
            if (w.state === "installed" && navigator.serviceWorker.controller)
              w.postMessage({ type: "SKIP_WAITING" });
          });
        });
      })
      .catch((err) => {
        // SecurityError = SW file served as HTML (preview env) — safe to ignore
        if (!String(err).includes("SecurityError"))
          console.warn("[PWA] Service Worker registration failed:", err);
      });
  }, []);

  // Proactively warm up the Edge Function the moment the app mounts —
  // before auth completes so the server is ready when the profile fetch fires.
  useEffect(() => { warmUpServer(); }, []);

  // Load Ethiopic font only when the app language requires it
  useEffect(() => {
    const lang = localStorage.getItem('twobeone_language');
    if (lang === 'am' || lang === 'om') {
      const id = 'ethiopic-font';
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wdth,wght@75..125,100..900&display=swap';
        document.head.appendChild(link);
      }
    }
  }, []);

  // Stable ref so the auth listener can always call the latest loadUserData
  // without the listener itself needing to be recreated on every render.
  const loadUserDataRef = useRef<
    ((token?: string) => Promise<void>) | null
  >(null);

  useEffect(() => {
    const supabase = createClient();

    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("[App] Session error:", error);
          setIsInitializing(false);
          return;
        }
        if (session?.access_token) {
          console.log("[App] Restoring existing session");
          setUser(session.user);
          setAccessToken(session.access_token);
          setShowLanding(false);
          // loadUserDataRef is populated after this effect mounts;
          // call via the ref so we use the fresh function, not a stale closure.
          await loadUserDataRef.current?.(session.access_token);
        } else {
          console.log("[App] No existing session");
        }
      } catch (err) {
        console.error("[App] Init auth error:", err);
        setLoadError("Failed to initialize authentication");
      } finally {
        setIsInitializing(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "[App] Auth state changed:",
          event,
          "has session:",
          !!session,
        );

        if (event === "SIGNED_IN" && session?.access_token) {
          setUser(session.user);
          setAccessToken(session.access_token);
          setShowLanding(false);
          // Only reload data on an explicit sign-in, not on every INITIAL_SESSION fire
        } else if (
          event === "TOKEN_REFRESHED" &&
          session?.access_token
        ) {
          // Only update the tokens — do NOT reload all user data on every refresh.
          // This was the main cause of repeated data-reload + transient null-user state.
          setUser(session.user);
          setAccessToken(session.access_token);
        } else if (event === "SIGNED_OUT") {
          // Before wiping state, verify the session is genuinely gone.
          // Supabase can fire SIGNED_OUT spuriously during tab-focus refresh races.
          const {
            data: { session: current },
          } = await supabase.auth.getSession();
          if (current?.access_token) {
            // False alarm — session is still valid, restore it silently.
            console.log(
              "[App] SIGNED_OUT was spurious, session still valid",
            );
            setUser(current.user);
            setAccessToken(current.access_token);
          } else {
            console.log(
              "[App] Session genuinely ended, clearing state",
            );
            setUser(null);
            setAccessToken(null);
          }
        }
      },
    );

    initAuth();
    return () => subscription.unsubscribe();
  }, []);

  // Keep the ref in sync with the latest loadUserData closure.
  // This lets the auth effect call it without needing to be in its dep array.
  useEffect(() => {
    loadUserDataRef.current = loadUserData;
  });

  // Load user data once when user + token first become available.
  // Does NOT re-run on TOKEN_REFRESHED (tokens update silently above).
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (user && accessToken && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadUserData();
    }
    if (!user) {
      hasLoadedRef.current = false; // reset on logout so next login reloads
    }
  }, [user, accessToken]);

  // Silently refresh the responses count whenever the user navigates to the questions tab
  useEffect(() => {
    if (activeTab === "questions" && accessToken) {
      api.questions
        .getResponses()
        .then((data) =>
          setResponses({
            user: data.userResponses || [],
            partner: data.partnerResponses || [],
          }),
        )
        .catch(() => {});
    }
  }, [activeTab]);

  // Poll for notifications to show real-time toasts
  // Use refs to avoid re-creating polling functions on every render
  const lastNotificationCheckRef = useRef(
    new Date().toISOString(),
  );
  const lastProfileCheckRef = useRef<string | null>(null);
  const lastPartnerCheckRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    const checkForNewNotifications = async () => {
      try {
        // Use centralized API utility instead of direct fetch
        const { notifications } =
          await api.notifications.list();

        // Find new unread notifications since last check
        const newNotifications = notifications.filter(
          (n: any) =>
            !n.read &&
            new Date(n.createdAt) >
              new Date(lastNotificationCheckRef.current),
        );

        // Show toast for each new notification
        newNotifications.forEach((notification: any) => {
          if (notification.type === "question_answered") {
            const categoryLabel =
              notification.data?.categoryLabel ?? "a question";
            const categoryId = notification.data?.categoryId;
            toast.success(
              notification.title || "💬 Your partner answered!",
              {
                description: `They answered in "${categoryLabel}". Tap to view.`,
                duration: 8000,
                action: categoryId
                  ? {
                      label: "Go there",
                      onClick: () => {
                        setActiveTab("home");
                        setSelectedQACategory(categoryId);
                        setSelectedScreen("qa-discussion");
                      },
                    }
                  : undefined,
              },
            );
          } else if (notification.type === "verse_shared") {
            toast.success(
              `${notification.data?.sharedBy || "Your partner"} shared a verse with you!`,
              {
                description: notification.data?.reference,
                duration: 5000,
              },
            );
          } else if (
            notification.type === "profile_update" &&
            notification.data?.relationshipStart
          ) {
            // Handle relationship start date notification
            const date = new Date(
              notification.data.relationshipStart,
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            toast.success("💕 Relationship Date Set!", {
              description: `Your partner set your relationship start date to ${date}`,
              duration: 6000,
            });
          } else if (notification.type === "mood_report") {
            // Handle weekly mood report notification
            toast.success(notification.title, {
              description: `${notification.data?.period || "Your weekly mood report is ready!"}`,
              duration: 8000,
            });
          } else {
            toast.info(notification.title, {
              description: notification.message.substring(
                0,
                100,
              ),
              duration: 4000,
            });
          }
        });

        // Update last check time
        if (newNotifications.length > 0) {
          lastNotificationCheckRef.current =
            new Date().toISOString();
        }
      } catch (err: any) {
        // Silently fail for all expected network/auth errors
        // Note: api.ts transforms "Failed to fetch" → "Unable to connect to server"
        if (
          err.message?.includes("timeout") ||
          err.message?.includes("Failed to fetch") ||
          err.message?.includes("Unable to connect") ||
          err.message?.includes("Unauthorized")
        ) {
          // Don't show error toast, just log at debug level
          console.log(
            "[App] Notification check skipped (network):",
            err.message,
          );
        } else {
          console.error(
            "[App] Failed to check notifications:",
            err,
          );
        }
      }
    };

    const checkForProfileUpdates = async () => {
      // Never trigger a data reload while the admin panel is open —
      // it would cause the admin screens to flash/re-render unexpectedly.
      if (selectedScreen === 'admin') return;

      try {
        const {
          profile: updatedProfile,
          partner: updatedPartner,
        } = await api.profile.get();

        let needsReload = false;

        // Detect own profile change
        if (updatedProfile?.updatedAt) {
          if (
            lastProfileCheckRef.current &&
            lastProfileCheckRef.current !==
              updatedProfile.updatedAt
          ) {
            console.log(
              "[App] Own profile change detected, reloading...",
            );
            needsReload = true;
          }
          lastProfileCheckRef.current =
            updatedProfile.updatedAt;
        }

        // Detect partner profile/data change — this is what was missing
        if (updatedPartner?.updatedAt) {
          if (
            lastPartnerCheckRef.current &&
            lastPartnerCheckRef.current !==
              updatedPartner.updatedAt
          ) {
            console.log(
              "[App] Partner data change detected, syncing...",
            );
            needsReload = true;
          }
          lastPartnerCheckRef.current =
            updatedPartner.updatedAt;
        }

        if (needsReload) {
          await loadUserData();
        }
      } catch (err: any) {
        const isNetworkErr =
          err.message?.includes("Failed to fetch") ||
          err.message?.includes("Unable to connect") ||
          err.message?.includes("Unauthorized") ||
          err.message?.includes("timeout");
        if (!isNetworkErr) {
          console.error(
            "[App] Failed to check for updates:",
            err,
          );
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
      console.log(
        "[App] No access token or user available, skipping data load",
      );
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    // warm-up already fired on mount — no need to repeat here

    try {
      // Profile must load first (partner sync depends on it)
      const profileData = await api.profile.get();
      setProfile(profileData.profile || null);
      setPartner(profileData.partner || null);
      setLoadError(null);

      // Non-blocking admin check — redirect admins to Admin Dashboard on first load
      adminApi
        .checkPrivileges()
        .then((d) => {
          const admin = d.isAdmin || false;
          setIsAdmin(admin);
          if (admin) setSelectedScreen('admin');
        })
        .catch(() => setIsAdmin(false));

      // All remaining data loads in parallel — no sequential waterfall
      const [
        journalResult,
        prayerResult,
        milestonesResult,
        responsesResult,
        devotionalsResult,
        streaksResult,
      ] = await Promise.allSettled([
        api.journal.list(),
        api.prayer.list(),
        api.milestones.list(),
        api.questions.getResponses(),
        api.devotionals.list(),
        api.streaks.get(),
      ]);

      if (journalResult.status === "fulfilled") {
        setJournalEntries(journalResult.value.entries || []);
      } else {
        console.warn(
          "[App] Journal load failed (non-critical):",
          journalResult.reason?.message,
        );
        setJournalEntries([]);
      }

      if (prayerResult.status === "fulfilled") {
        setPrayers(prayerResult.value.prayers || []);
      } else {
        console.warn(
          "[App] Prayer load failed (non-critical):",
          prayerResult.reason?.message,
        );
        setPrayers([]);
      }

      if (milestonesResult.status === "fulfilled") {
        setMilestones(milestonesResult.value.milestones || []);
      } else {
        console.warn(
          "[App] Milestones load failed (non-critical):",
          milestonesResult.reason?.message,
        );
        setMilestones([]);
      }

      if (responsesResult.status === "fulfilled") {
        setResponses({
          user: responsesResult.value.userResponses || [],
          partner: responsesResult.value.partnerResponses || [],
        });
      } else {
        console.warn(
          "[App] Responses load failed (non-critical):",
          responsesResult.reason?.message,
        );
        setResponses({ user: [], partner: [] });
      }

      if (devotionalsResult.status === "fulfilled") {
        setDevotionals(devotionalsResult.value.devotions || []);
      } else {
        console.warn(
          "[App] Devotionals load failed (non-critical):",
          devotionalsResult.reason?.message,
        );
        setDevotionals([]);
      }

      if (streaksResult.status === "fulfilled") {
        const devotionalStreakData =
          streaksResult.value.streaks?.find(
            (s: any) => s.streak_type === "devotional",
          );
        setDevotionalStreak(
          devotionalStreakData?.current_streak || 0,
        );
      } else {
        console.warn(
          "[App] Streaks load failed (non-critical):",
          streaksResult.reason?.message,
        );
      }
    } catch (error: any) {
      const errorMsg: string =
        error?.message || "Failed to load user data";
      console.error(
        "[App] Failed to load user data:",
        errorMsg,
      );

      const isBlockedByClient =
        errorMsg.includes("ERR_BLOCKED_BY_CLIENT") ||
        errorMsg.includes("BLOCKED_BY_CLIENT");

      const isNetworkError =
        errorMsg.includes("Unable to connect") ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("NetworkError") ||
        errorMsg.includes("internet connection");

      const isAuthError =
        errorMsg.includes("401") ||
        errorMsg.includes("Unauthorized");

      if (isAuthError) {
        // Auth errors are expected — don't show anything
      } else if (isBlockedByClient) {
        setLoadError(
          "Your ad blocker is blocking the app. Please disable it (or whitelist this site) and refresh.",
        );
      } else if (isNetworkError) {
        // Transient network issue — silently retry once after 4 seconds
        console.warn(
          "[App] Network error on load — will auto-retry in 4 s",
        );
        setTimeout(() => {
          if (user && accessToken) loadUserData();
        }, 4000);
      } else {
        // Genuine server error — surface to the user
        setLoadError(errorMsg);
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
      console.error("Sign out error:", error);
      setLoadError(`Sign out error: ${error}`);
      toast.error(`Sign out error: ${error}`);
    }
  }, []);

  const handleAddJournalEntry = useCallback(
    async (entry: {
      title: string;
      content: string;
      isShared: boolean;
    }) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(entry),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Journal entry creation failed:",
            errorData,
          );
          throw new Error(
            errorData.error || "Failed to add journal entry",
          );
        }

        const { entry: newEntry } = await response.json();

        // Add the new entry to local state immediately for instant UI feedback
        setJournalEntries((prev) => [newEntry, ...prev]);

        // Refetch only journal entries (not all data) for consistency
        try {
          const journalData = await api.journal.list();
          setJournalEntries(journalData.entries || []);
        } catch (err) {
          console.error(
            "[App] Failed to refetch journal entries:",
            err,
          );
        }

        // Update progress
        if (progress) {
          await updateProgress({
            journalEntries: progress.journalEntries + 1,
          });
        }

        // Notify partner if entry is shared
        if (
          entry.isShared &&
          profile?.partnerId &&
          accessToken
        ) {
          await sendNotification({
            recipientId: profile.partnerId,
            type: "journal",
            title: `${profile.name} added a new journal entry`,
            message: `"${entry.title}" - Check it out in the Journal tab!`,
            data: { entryTitle: entry.title },
            accessToken,
            projectId,
          });
        }
      } catch (error) {
        console.error("Failed to add journal entry:", error);
        throw error;
      }
    },
    [accessToken, profile, progress],
  );

  const handleUpdateJournalEntry = useCallback(
    async (id: string, updates: any) => {
      try {
        console.log(
          "[App] Updating journal entry:",
          id,
          updates,
        );

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "[App] Journal update failed:",
            errorData,
          );
          throw new Error(
            errorData.error || "Failed to update journal entry",
          );
        }

        const { entry: updatedEntry } = await response.json();
        console.log(
          "[App] Journal entry updated successfully:",
          updatedEntry,
        );

        // Update local state immediately
        setJournalEntries((prev) =>
          prev.map((e) => (e.id === id ? updatedEntry : e)),
        );

        // Refetch only journal entries for consistency
        try {
          const journalData = await api.journal.list();
          setJournalEntries(journalData.entries || []);
        } catch (err) {
          console.error(
            "[App] Failed to refetch journal entries:",
            err,
          );
        }
      } catch (error: any) {
        console.error(
          "[App] Failed to update journal entry:",
          error,
        );
        toast.error(
          error.message || "Failed to update journal entry",
        );
        throw error;
      }
    },
    [accessToken],
  );

  const handleDeleteJournalEntry = useCallback(
    async (id: string) => {
      try {
        console.log("[App] Starting delete for entry:", id);
        console.log(
          "[App] Current entries before delete:",
          journalEntries.length,
        );

        // Check if this is a partner's entry
        const entryToDelete = journalEntries.find(
          (e) => e.id === id,
        );
        if (entryToDelete && (entryToDelete as any).isPartner) {
          console.error("[App] Cannot delete partner entry");
          toast.error(
            "You can't delete your partner's entries",
          );
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/journal/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const result = await response.json();
        console.log("[App] Delete response:", {
          ok: response.ok,
          status: response.status,
          result,
        });

        if (!response.ok) {
          console.error("[App] Delete failed:", result);

          // Show user-friendly error message
          if (result.error === "Entry not found") {
            toast.error(
              "This entry cannot be deleted. It may belong to your partner.",
            );
          } else {
            toast.error(
              result.error || "Failed to delete journal entry",
            );
          }
          return;
        }

        console.log(
          "[App] Delete successful, updating local state...",
        );

        // Immediately remove from local state for instant feedback
        setJournalEntries((prev) => {
          const filtered = prev.filter(
            (entry) => entry.id !== id,
          );
          console.log(
            "[App] Filtered entries:",
            filtered.length,
            "removed:",
            prev.length - filtered.length,
          );
          return filtered;
        });

        toast.success("Entry deleted!");

        // Wait a bit before refetching to ensure backend is updated
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );

        // Then refetch to ensure consistency
        console.log("[App] Refetching journal entries...");
        try {
          const journalData = await api.journal.list();
          console.log(
            "[App] Refetched entries:",
            journalData.entries?.length || 0,
          );

          // Double check the deleted entry is not in the refetched data
          const stillExists = journalData.entries?.find(
            (e: any) => e.id === id,
          );
          if (stillExists) {
            console.error(
              "[App] ⚠️ WARNING: Deleted entry still exists in refetched data!",
              stillExists,
            );
          } else {
            console.log(
              "[App] ✅ Confirmed: Entry successfully deleted",
            );
          }

          setJournalEntries(journalData.entries || []);
        } catch (err) {
          console.error(
            "[App] Failed to refetch journal entries after delete:",
            err,
          );
          // Don't update state if refetch fails - keep the optimistic update
        }
      } catch (error: any) {
        console.error(
          "[App] Failed to delete journal entry:",
          error,
        );
        toast.error(
          error.message || "Failed to delete journal entry",
        );
        // Refetch to restore correct state
        try {
          const journalData = await api.journal.list();
          setJournalEntries(journalData.entries || []);
        } catch (err) {
          console.error(
            "[App] Failed to restore state after delete error:",
            err,
          );
        }
      }
    },
    [accessToken],
  );

  const handleAddPrayer = useCallback(
    async (prayer: any) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(prayer),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to add prayer");
        }

        await loadUserData();

        // Update progress
        if (progress) {
          await updateProgress({
            prayerRequests: progress.prayerRequests + 1,
          });
        }

        // Notify partner
        if (profile?.partnerId && accessToken) {
          await sendNotification({
            recipientId: profile.partnerId,
            type: "prayer",
            title: `${profile.name} added a prayer request`,
            message: `"${prayer.title}" - Join them in prayer!`,
            data: { prayerTitle: prayer.title },
            accessToken,
            projectId,
          });
        }
      } catch (error) {
        console.error("Failed to add prayer:", error);
        throw error;
      }
    },
    [accessToken, profile],
  );

  const handleUpdatePrayer = useCallback(
    async (id: string, updates: any) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Update prayer error response:",
            errorData,
          );
          throw new Error(
            errorData.error || "Failed to update prayer",
          );
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to update prayer:", error);
        throw error;
      }
    },
    [accessToken],
  );

  const handleDeletePrayer = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to delete prayer");
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to delete prayer:", error);
        throw error;
      }
    },
    [accessToken],
  );

  const handleMarkPrayed = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/prayer/${id}/pray`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to mark prayer as prayed");
        }

        await loadUserData();
        toast.success("Marked as prayed! 🙏");
      } catch (error) {
        console.error(
          "Failed to mark prayer as prayed:",
          error,
        );
        toast.error("Failed to mark as prayed");
        throw error;
      }
    },
    [accessToken],
  );

  const handleAddMilestone = useCallback(
    async (milestone: any) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(milestone),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to add milestone");
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to add milestone:", error);
        throw error;
      }
    },
    [accessToken],
  );

  const handleUpdateMilestone = useCallback(
    async (id: string, updates: any) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update milestone");
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to update milestone:", error);
        throw error;
      }
    },
    [accessToken],
  );

  const handleDeleteMilestone = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/milestone/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to delete milestone");
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to delete milestone:", error);
        throw error;
      }
    },
    [accessToken],
  );

  // QA_CATEGORY_LABELS is now a module-scope const (above App)

  const handleSaveQuestionResponse = useCallback(
    async (
      questionId: string,
      answers: Record<string, string | string[] | number>,
      categoryId?: string,
    ) => {
      try {
        console.log("[App] Saving question response:", {
          questionId,
          answers,
          categoryId,
        });

        const responseData = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/questions/${questionId}/responses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ answers }),
          },
        );

        console.log(
          "[App] Question response save status:",
          responseData.status,
        );

        if (!responseData.ok) {
          const errorText = await responseData.text();
          console.error(
            "[App] Failed to save response - Status:",
            responseData.status,
          );
          console.error(
            "[App] Failed to save response - Error:",
            errorText,
          );
          throw new Error(
            `Failed to save response (${responseData.status}): ${errorText}`,
          );
        }

        const result = await responseData.json();
        console.log(
          "[App] Question response saved successfully:",
          result,
        );
        toast.success("Answer saved!");

        // Refresh response counts so dashboard stats stay current
        api.questions
          .getResponses()
          .then((data) =>
            setResponses({
              user: data.userResponses || [],
              partner: data.partnerResponses || [],
            }),
          )
          .catch(() => {});

        // Notify partner — fire-and-forget so a slow notification doesn't block the user
        if (profile?.partnerId && accessToken && categoryId) {
          const categoryLabel =
            QA_CATEGORY_LABELS[categoryId] ?? categoryId;
          const senderName = profile?.name ?? "Your partner";
          sendNotification({
            recipientId: profile.partnerId,
            type: "question_answered",
            title: `💬 ${senderName} answered a question!`,
            message: `They answered in "${categoryLabel}". Tap to see their response.`,
            data: { categoryId, categoryLabel, questionId },
            accessToken,
            projectId,
          }).catch((err) =>
            console.warn(
              "[App] Partner notification failed (non-critical):",
              err,
            ),
          );
        }
      } catch (error: any) {
        console.error("[App] Failed to save response:", error);
        toast.error("Failed to save answer");
        throw error;
      }
    },
    [accessToken, profile],
  );

  // Fetch real completion status from backend whenever the devotional dialog opens.
  // This ensures the "Completed" label persists correctly across open/close cycles.
  useEffect(() => {
    if (
      !isDevotionalOpen ||
      !selectedDevotionalId ||
      !accessToken
    ) {
      if (!isDevotionalOpen)
        setIsDevotionalCompletedToday(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/devotional-completions`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.completions) return;
        const alreadyDone = data.completions.some((c: any) => {
          try {
            const completionDate = new Date(c.completedAt)
              .toISOString()
              .split("T")[0];
            return (
              completionDate === today &&
              (c.devotionId === selectedDevotionalId ||
                c.devotion_id === selectedDevotionalId)
            );
          } catch {
            return false;
          }
        });
        setIsDevotionalCompletedToday(alreadyDone);
      })
      .catch(() => {});
  }, [isDevotionalOpen, selectedDevotionalId, accessToken]);

  const handleCompleteDevotional = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/devotional-completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            devotion_id: selectedDevotionalId,
            notes: null,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "[App] Failed to mark complete - Status:",
          response.status,
          errorText,
        );
        throw new Error(
          "Failed to mark devotional as complete",
        );
      }

      // Immediately update completion status in UI
      setIsDevotionalCompletedToday(true);

      // Fetch updated streak
      try {
        const streaksResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/streaks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (streaksResponse.ok) {
          const { streaks } = await streaksResponse.json();
          const devotionalStreakData = streaks?.find(
            (s: any) => s.streak_type === "devotional",
          );
          setDevotionalStreak(
            devotionalStreakData?.current_streak || 0,
          );
        }
      } catch (err) {
        console.error("[App] Failed to reload streak:", err);
      }

      toast.success("Devotional completed! 🎉");
    } catch (error) {
      console.error(
        "[App] Failed to complete devotional:",
        error,
      );
      toast.error("Failed to mark as complete");
    }
  }, [accessToken, selectedDevotionalId]);

  const updateProgress = useCallback(
    async (updates: Partial<Progress>) => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/progress`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update progress");
        }

        await loadUserData();
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    [accessToken],
  );

  // These hooks must live before every early return so the hook count is always the same
  const handleMoodSelect = useCallback((mood: string) => {
    console.log("Mood selected:", mood);
    toast.success("Mood recorded!");
  }, []);

  const handlePrayClick = useCallback(
    () => setActiveTab("prayer"),
    [],
  );

  // Only show splash during initial auth check if no user is found yet
  if (isInitializing) {
    return (
      <LanguageProvider>
        <SEOHead />
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  // Show landing page for first-time visitors
  if (showLanding && !user) {
    return (
      <LanguageProvider>
        <SEOHead />
        <Toaster />
        <LandingPage
          onGetStarted={() => setShowLanding(false)}
        />
      </LanguageProvider>
    );
  }

  if (!user) {
    return (
      <LanguageProvider>
        <SEOHead />
        <AuthPage
          onAuthSuccess={(token, userObj) => {
            // Set both user + token immediately — no race with onAuthStateChange.
            setUser(userObj);
            setAccessToken(token);
            setShowLanding(false);
          }}
        />
      </LanguageProvider>
    );
  }

  const isDevotionalCompleted =
    progress &&
    progress.lastActiveDate &&
    new Date(progress.lastActiveDate).toDateString() ===
      new Date().toDateString();

  // GUIDANCE_MODULES and REFLECTION_PROMPTS are module-scope consts (above App)
  const todaysPrompt =
    REFLECTION_PROMPTS[
      new Date().getDate() % REFLECTION_PROMPTS.length
    ];

  // Admin status is now checked from backend via loadUserData
  // No need to check email here - isAdmin state is set from API

  // Testing Dashboard - accessible via URL parameter or settings
  if (selectedScreen === "testing") {
    return (
      <LanguageProvider>
        <TestingDashboard
          onBack={() => setSelectedScreen("home")}
        />
      </LanguageProvider>
    );
  }

  // If user is admin and navigating to admin panel
  if (isAdmin && selectedScreen === "admin") {
    return (
      <LanguageProvider>
        <AdminPanel
          onSignOut={handleSignOut}
          accessToken={accessToken || undefined}
          onBackToHome={() => setSelectedScreen("dashboard")}
        />
      </LanguageProvider>
    );
  }

  // Debug screen for troubleshooting questions
  if (selectedScreen === "debug-questions") {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <div className="pt-11 pb-28">
            <div className="max-w-6xl mx-auto px-4">
              <Button
                onClick={() => setSelectedScreen("dashboard")}
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
  if (selectedScreen === "debug-responses") {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <div className="pt-11 pb-28">
            <div className="max-w-6xl mx-auto px-4">
              <Button
                onClick={() => setSelectedScreen("dashboard")}
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
      <SEOHead />
      <div className="min-h-screen bg-background">
        {/* Safe area top: 44px iOS / 32px Android */}
        <div className="pt-11 pb-28">
          {/* Max content width 90% with 16dp horizontal padding */}
          <div className="max-w-6xl mx-auto px-4">
            <Toaster />

            {/* PWA Welcome Screen */}
            <PWAWelcome />

            {/* Modern Install Banner - Beautiful automatic installation prompt */}
            <InstallBanner />

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
                showLabel={true}
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
                    if (notification.type === "devotional") {
                      // If it's a prayer chat notification, open the specific devotional
                      if (notification.data?.devotionId) {
                        setActiveTab("devotions");
                        // Small delay to ensure tab is switched before opening devotional
                        setTimeout(() => {
                          setIsDevotionalOpen(true);
                        }, 100);
                      } else {
                        setActiveTab("devotions");
                      }
                    } else if (
                      notification.type === "journal"
                    ) {
                      setActiveTab("journal");
                    } else if (notification.type === "prayer") {
                      setActiveTab("prayer");
                    } else if (
                      notification.type === "question"
                    ) {
                      setActiveTab("home");
                      setSelectedScreen("category-selection");
                    } else if (
                      notification.type === "question_answered"
                    ) {
                      // Deep-link directly to the exact category the partner answered in
                      setActiveTab("home");
                      if (notification.data?.categoryId) {
                        setSelectedQACategory(
                          notification.data.categoryId,
                        );
                        setSelectedScreen("qa-discussion");
                      } else {
                        setSelectedScreen("category-selection");
                      }
                    } else if (
                      notification.type === "mood_report"
                    ) {
                      setActiveTab("home");
                      setSelectedScreen("mood-analytics");
                    }
                  }}
                />
              )}
            </div>

            {/* Error Banner */}
            {loadError && (
              <div
                style={{
                  background: "var(--error-50)",
                  borderBottom: "1px solid var(--error-500)",
                  padding: "var(--spacing-3) var(--spacing-4)",
                }}
              >
                <div className="container mx-auto max-w-6xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--error-500)" }}
                    />
                    <div className="flex-1">
                      <h3
                        className="text-sm"
                        style={{ color: "var(--error-700)" }}
                      >
                        Error Loading Profile
                      </h3>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--error-700)" }}
                      >
                        {loadError}
                      </p>
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

            {/* Main Content — pb matches fixed nav height: 64px bar + 36px safe area = 100px */}
            <main
              className="container mx-auto px-4 pt-6 max-w-2xl"
              style={{
                paddingBottom:
                  "calc(var(--spacing-16) + var(--safe-area-bottom-ios))",
              }}
            >
              {activeTab === "home" &&
                selectedScreen === "dashboard" && (
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

              {activeTab === "home" &&
                selectedScreen === "qa-hub" && (
                  <DailyQuestion
                    accessToken={accessToken || ""}
                    projectId={projectId}
                    userProfile={profile}
                    partner={partner}
                    onPrayTogether={async () => {
                      try {
                        // Switch to prayer tab
                        setActiveTab("prayer");
                        setSelectedScreen("dashboard");

                        toast.success(
                          "Opening Prayer Together...",
                        );
                      } catch (error) {
                        console.error(
                          "Failed to open prayer:",
                          error,
                        );
                        toast.error("Failed to open prayer");
                      }
                    }}
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {activeTab === "home" &&
                selectedScreen === "quizzes" &&
                user &&
                profile && (
                  <QuizzesHub
                    profile={profile}
                    partner={partner || undefined}
                    accessToken={accessToken}
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {activeTab === "home" &&
                selectedScreen === "guidance" && (
                  <PreMarriageHub
                    onModuleClick={(id) => {
                      setSelectedModuleId(id);
                      setSelectedLessonId(null); // LessonScreen defaults to first lesson
                      setSelectedScreen("lesson");
                    }}
                    accessToken={accessToken}
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {activeTab === "home" &&
                selectedScreen === "lesson" &&
                selectedModuleId && (
                  <LessonScreen
                    moduleId={selectedModuleId}
                    lessonId={selectedLessonId ?? undefined}
                    onBack={() => setSelectedScreen("guidance")}
                    accessToken={accessToken}
                  />
                )}

              {activeTab === "home" &&
                selectedScreen === "milestones" && (
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
              {activeTab === "home" &&
                selectedScreen === "scripture-memory" && (
                  <ScriptureMemory
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                    accessToken={accessToken || undefined}
                    userName={profile?.name}
                    partnerName={partner?.name}
                  />
                )}

              {/* Mood Analytics Screen */}
              {activeTab === "home" &&
                selectedScreen === "mood-analytics" && (
                  <MoodAnalytics
                    profile={profile || undefined}
                    partner={partner || undefined}
                    onClose={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {activeTab === "home" &&
                selectedScreen === "daily-question" &&
                user &&
                profile && (
                  <DailyQuestion
                    accessToken={accessToken}
                    projectId={projectId}
                    userProfile={profile}
                    partner={partner || undefined}
                    onPrayTogether={async () => {
                      // Add to prayer list
                      setActiveTab("prayer");
                      toast.success("Prayer time! 🙏");
                    }}
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {/* Category Selection Screen */}
              {activeTab === "home" &&
                selectedScreen === "category-selection" && (
                  <CategorySelection
                    onSelectCategory={(categoryId) => {
                      setSelectedQACategory(categoryId);
                      setSelectedScreen("qa-discussion");
                    }}
                    onBack={() =>
                      setSelectedScreen("dashboard")
                    }
                  />
                )}

              {/* Q&A Discussion Hub */}
              {activeTab === "home" &&
                selectedScreen === "qa-discussion" &&
                selectedQACategory && (
                  <QADiscussionHub
                    selectedCategory={selectedQACategory}
                    onSaveAnswer={handleSaveQuestionResponse}
                    onPrayTogether={async (question) => {
                      try {
                        // Switch to prayer tab
                        setActiveTab("prayer");
                        toast.success(
                          "Opening Prayer Together...",
                        );
                      } catch (error) {
                        console.error(
                          "Failed to open prayer:",
                          error,
                        );
                        toast.error("Failed to open prayer");
                      }
                    }}
                    onBack={() => {
                      setSelectedScreen("category-selection");
                      setSelectedQACategory(null);
                    }}
                    userName={profile?.name}
                    partnerName={partner?.name}
                  />
                )}

              {activeTab === "devotions" && (
                <DailyDevotionsFeed
                  onDevotionalClick={(id) => {
                    setSelectedDevotionalId(id);
                    setIsDevotionalOpen(true);
                  }}
                  accessToken={accessToken || undefined}
                  projectId={projectId}
                  onBackToHome={() => {
                    setActiveTab("home");
                    setSelectedScreen("dashboard");
                  }}
                />
              )}

              {activeTab === "journal" && (
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
                    setActiveTab("home");
                    setSelectedScreen("dashboard");
                  }}
                />
              )}

              {activeTab === "prayer" && (
                <PrayerBoard
                  prayers={prayers}
                  onAddPrayer={handleAddPrayer}
                  onUpdatePrayer={handleUpdatePrayer}
                  onDeletePrayer={handleDeletePrayer}
                  onMarkPrayed={handleMarkPrayed}
                  onBackToHome={() => {
                    setActiveTab("home");
                    setSelectedScreen("dashboard");
                  }}
                />
              )}

              {activeTab === "community" &&
                !selectedGroupId && <CommunityGroups />}

              {activeTab === "community" && selectedGroupId && (
                <GroupDetailScreen
                  groupId={selectedGroupId}
                  onBack={() => setSelectedGroupId(null)}
                />
              )}

              {activeTab === "profile" && (
                <SettingsScreen
                  profile={profile || undefined}
                  partner={partner || undefined}
                  onSignOut={handleSignOut}
                  onUpdateProfile={async (data) => {
                    try {
                      console.log(
                        "[App] Updating profile with data:",
                        data,
                      );

                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/profile`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify(data),
                        },
                      );

                      console.log(
                        "[App] Profile update response status:",
                        response.status,
                      );

                      if (!response.ok) {
                        const errorData = await response.json();
                        console.error(
                          "[App] Profile update failed:",
                          errorData,
                        );
                        throw new Error(
                          errorData.error ||
                            "Failed to update profile",
                        );
                      }

                      const result = await response.json();
                      console.log(
                        "[App] Profile update result:",
                        result,
                      );

                      // Immediately reload to get the latest data
                      await loadUserData();

                      // Show special message if relationshipStart was updated and user has a partner
                      if (data.relationshipStart && partner) {
                        toast.success(
                          "Profile updated! Your partner's relationship start date has been synced too. 💕",
                        );
                        console.log(
                          "[App] Relationship start date synced to partner:",
                          data.relationshipStart,
                        );
                      } else {
                        toast.success(
                          "Profile updated successfully!",
                        );
                      }
                    } catch (error: any) {
                      console.error(
                        "Update profile error:",
                        error,
                      );
                      toast.error(
                        error.message ||
                          "Failed to update profile",
                      );
                      throw error;
                    }
                  }}
                  accessToken={accessToken || ""}
                  onRefresh={loadUserData}
                  onNavigateToAdmin={
                    isAdmin
                      ? () => setSelectedScreen("admin")
                      : undefined
                  }
                  onNavigateToDebug={() =>
                    setSelectedScreen("debug-questions")
                  }
                  onNavigateToDebugResponses={() =>
                    setSelectedScreen("debug-responses")
                  }
                  onNavigateToTesting={() =>
                    setSelectedScreen("testing")
                  }
                />
              )}

              {activeTab === "questions" && (
                <QuestionsSection
                  responses={responses}
                  onSaveResponse={handleSaveQuestionResponse}
                />
              )}

              {activeTab === "progress" && progress && (
                <ProgressSection progress={progress} />
              )}
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Floating Action Buttons */}
            <FloatingActionButtons
              onPrayClick={handlePrayClick}
            />

            {/* Devotional Dialog */}
            <DevotionalDialog
              devotional={(() => {
                // Find the selected devotional from the loaded devotionals
                if (
                  selectedDevotionalId &&
                  devotionals.length > 0
                ) {
                  const found = devotionals.find(
                    (d) => d.id === selectedDevotionalId,
                  );
                  if (found) {
                    return {
                      id: found.id,
                      title: found.title || "Daily Devotion",
                      verse: found.verse || "",
                      reference:
                        found.reference ||
                        found.verseReference ||
                        "",
                      reflection:
                        found.reflection || found.content || "",
                      prayer: found.prayerPrompt || "",
                      audioUrl: found.audioUrl,
                      language: found.language,
                    };
                  }
                }
                // Fallback if no devotional found
                return {
                  title: "Daily Devotion",
                  verse: "",
                  reference: "",
                  reflection: "",
                  prayer: "",
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
            <LegalFooter
              language={
                (profile?.language as "en" | "am") || "en"
              }
            />
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}