import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Calendar,
  Heart,
  Sparkles,
  BarChart3,
  Clock,
  MessageCircle,
  Loader2,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { moods as moodsApi } from "../utils/api";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface MoodEntry {
  id: string;
  userId: string;
  mood: "great" | "good" | "okay" | "sad";
  note?: string;
  createdAt: string;
}

interface MoodAnalyticsProps {
  profile?: {
    id: string;
    name: string;
  };
  partner?: {
    id: string;
    name: string;
  };
  onClose?: () => void;
}

export function MoodAnalytics({
  profile,
  partner,
  onClose,
}: MoodAnalyticsProps) {
  const { t } = useLanguage();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<
    "great" | "good" | "okay" | "sad"
  >("good");
  const [moodNote, setMoodNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyReportLoading, setWeeklyReportLoading] =
    useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [openAIStatus, setOpenAIStatus] = useState<any>(null);
  const [hasQuotaError, setHasQuotaError] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      setLoading(true);
      const { moods: fetchedMoods } = await moodsApi.list(30);
      setMoods(fetchedMoods);
    } catch (error) {
      console.error("Error loading moods:", error);
      toast.error("Failed to load mood data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsSaving(true);
    try {
      await moodsApi.save(selectedMood, moodNote);
      toast.success("Mood saved! 💝");
      setMoodNote("");
      await loadMoods();
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Failed to save mood");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!partner) {
      toast.error("You need a partner to generate AI analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { analysis: aiAnalysis } = await moodsApi.analyze();
      setAnalysis(aiAnalysis);
      setHasQuotaError(false);
      toast.success(t.mood.analysisGenerated);
    } catch (error: any) {
      console.warn(
        "Mood AI analysis unavailable:",
        error?.message,
      );

      // Generate a helpful stats-based fallback so the user still sees value
      const moodValues: Record<string, number> = {
        great: 4,
        good: 3,
        okay: 2,
        sad: 1,
      };
      const userAvg =
        userMoods.length > 0
          ? (
              userMoods.reduce(
                (s, m) => s + (moodValues[m.mood] || 0),
                0,
              ) / userMoods.length
            ).toFixed(1)
          : "—";
      const partnerAvg =
        partnerMoods.length > 0
          ? (
              partnerMoods.reduce(
                (s, m) => s + (moodValues[m.mood] || 0),
                0,
              ) / partnerMoods.length
            ).toFixed(1)
          : "—";

      // Use same object shape as the API response so the render doesn't break
      setAnalysis({
        analysis:
          `📊 Mood Summary — Last 30 Days\n\n` +
          `${profile?.name || "You"}: ${userMoods.length} entries · Average ${userAvg}/4\n` +
          `${partner?.name || "Partner"}: ${partnerMoods.length} entries · Average ${partnerAvg}/4\n\n` +
          `✨ Keep checking in daily — consistent mood tracking helps reveal your emotional patterns together.\n\n` +
          `📖 "Carry each other's burdens, and in this way you will fulfill the law of Christ." — Galatians 6:2\n\n` +
          `🙏 Prayer: Lord, help us be present to each other's hearts and respond with grace and understanding.`,
        createdAt: new Date().toISOString(),
        isFallback: true,
      });
      setHasQuotaError(false);
      // Don't show an error toast — the fallback text in the UI is sufficient
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!partner) {
      toast.error(
        "You need a partner to generate weekly reports",
      );
      return;
    }

    setWeeklyReportLoading(true);
    try {
      const { report } = await moodsApi.generateWeeklyReport();
      toast.success(
        "Weekly report sent to both of you! Check notifications 💝",
      );
    } catch (error: any) {
      console.error("Error generating weekly report:", error);

      // Check if it's an OpenAI quota error
      if (
        error.message &&
        (error.message.includes("quota") ||
          error.message.includes("billing"))
      ) {
        toast.error(
          "Weekly report created with basic stats. AI analysis unavailable due to quota limits.",
          {
            duration: 6000,
          },
        );
      } else if (
        error.message &&
        error.message.includes("rate_limit")
      ) {
        toast.error(
          "Rate limit reached. Please try again in a few moments.",
          {
            duration: 4000,
          },
        );
      } else {
        toast.error(
          error.message || "Failed to generate weekly report",
        );
      }
    } finally {
      setWeeklyReportLoading(false);
    }
  };

  // Calculate statistics
  const last7Days = moods.filter((m) => {
    const date = new Date(m.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  const userMoods = last7Days.filter(
    (m) => m.userId === profile?.id,
  );
  const partnerMoods = last7Days.filter(
    (m) => m.userId === partner?.id,
  );

  const moodValues: Record<string, number> = {
    great: 4,
    good: 3,
    okay: 2,
    sad: 1,
  };
  const userAverage =
    userMoods.length > 0
      ? userMoods.reduce(
          (sum, m) => sum + moodValues[m.mood],
          0,
        ) / userMoods.length
      : 0;
  const partnerAverage =
    partnerMoods.length > 0
      ? partnerMoods.reduce(
          (sum, m) => sum + moodValues[m.mood],
          0,
        ) / partnerMoods.length
      : 0;

  // Prepare chart data — 30 days
  const last7DaysData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split("T")[0];

    const userDayMoods = moods.filter(
      (m) =>
        m.userId === profile?.id &&
        m.createdAt.startsWith(dateStr),
    );
    const partnerDayMoods = moods.filter(
      (m) =>
        m.userId === partner?.id &&
        m.createdAt.startsWith(dateStr),
    );

    const userAvg =
      userDayMoods.length > 0
        ? userDayMoods.reduce(
            (sum, m) => sum + moodValues[m.mood],
            0,
          ) / userDayMoods.length
        : null;
    const partnerAvg =
      partnerDayMoods.length > 0
        ? partnerDayMoods.reduce(
            (sum, m) => sum + moodValues[m.mood],
            0,
          ) / partnerDayMoods.length
        : null;

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      you: userAvg,
      partner: partnerAvg,
    };
  });

  // Mood distribution
  const userMoodCounts = {
    great: userMoods.filter((m) => m.mood === "great").length,
    good: userMoods.filter((m) => m.mood === "good").length,
    okay: userMoods.filter((m) => m.mood === "okay").length,
    sad: userMoods.filter((m) => m.mood === "sad").length,
  };

  const partnerMoodCounts = {
    great: partnerMoods.filter((m) => m.mood === "great")
      .length,
    good: partnerMoods.filter((m) => m.mood === "good").length,
    okay: partnerMoods.filter((m) => m.mood === "okay").length,
    sad: partnerMoods.filter((m) => m.mood === "sad").length,
  };

  const MOOD_CONFIG = {
    great: {
      emoji: "🤩",
      label: t.mood.great,
      desc: t.mood.great,
      bg: "var(--success-50)",
      border: "var(--success-500)",
      color: "var(--success-700)",
    },
    good: {
      emoji: "😊",
      label: t.mood.good,
      desc: t.mood.good,
      bg: "var(--secondary-50)",
      border: "var(--secondary-500)",
      color: "var(--secondary-700)",
    },
    okay: {
      emoji: "😐",
      label: t.mood.okay,
      desc: t.mood.okay,
      bg: "var(--warning-50)",
      border: "var(--warning-500)",
      color: "var(--warning-700)",
    },
    sad: {
      emoji: "😔",
      label: t.mood.sad,
      desc: t.mood.sad,
      bg: "var(--neutral-100)",
      border: "var(--neutral-400)",
      color: "var(--neutral-600)",
    },
  } as const;

  const getMoodEmoji = (mood: string) => {
    return (
      MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.emoji ??
      "😐"
    );
  };

  const getMoodIcon = (mood: string, size = "w-5 h-5") => {
    const emoji = getMoodEmoji(mood);
    const px = size.includes("8")
      ? "2rem"
      : size.includes("6")
        ? "1.5rem"
        : "1.25rem";
    return (
      <span style={{ fontSize: px, lineHeight: 1 }}>
        {emoji}
      </span>
    );
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "great":
        return "border-success-500/50 bg-success-50";
      case "good":
        return "border-sky-200 bg-sky-50";
      case "okay":
        return "border-warning-500/50 bg-warning-50";
      case "sad":
        return "border-border bg-muted";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div className="space-y-6">
      {/* OpenAI Quota Error Alert */}
      {hasQuotaError && (
        <Alert className="border-2 border-warning-500 bg-gradient-to-r from-warning-50 to-warning-50">
          <AlertCircle className="h-5 w-5 text-warning-500" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-medium text-warning-700">
                AI Analysis Temporarily Unavailable
              </p>
              <p className="text-sm text-warning-700">
                The OpenAI API quota has been exceeded. To
                restore AI-powered mood analysis and weekly
                reports:
              </p>
              <ul className="text-sm text-warning-700 list-disc list-inside space-y-1 ml-2">
                <li>
                  Add credits to your OpenAI account at{" "}
                  <a
                    href="https://platform.openai.com/account/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium hover:text-warning-700"
                  >
                    platform.openai.com/account/billing
                  </a>
                </li>
                <li>
                  Or upgrade to a paid plan with higher quota
                  limits
                </li>
              </ul>
              <p className="text-sm text-warning-700 mt-2">
                Don't worry - all your mood tracking data is
                safe! Basic statistics and charts continue to
                work normally.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-primary-100"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {t.mood.analytics}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.mood.analyticsDescription}
            </p>
          </div>
        </div>
        {partner && (
          <Button
            onClick={handleGenerateWeeklyReport}
            disabled={weeklyReportLoading}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            {weeklyReportLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.mood.generating}
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                {t.mood.weeklyReport}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Track Today's Mood */}
      <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-600" />
            {t.mood.howAreYouFeelingToday}
          </CardTitle>
          <CardDescription>
            {t.mood.shareEmotionalState}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood Selection */}
          <div className="grid grid-cols-4 gap-3">
            {(
              Object.entries(MOOD_CONFIG) as [
                keyof typeof MOOD_CONFIG,
                (typeof MOOD_CONFIG)[keyof typeof MOOD_CONFIG],
              ][]
            ).map(([mood, cfg]) => {
              const isSelected = selectedMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--spacing-2)",
                    height: "80px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${isSelected ? cfg.border : "var(--neutral-200)"}`,
                    background: isSelected
                      ? cfg.bg
                      : "var(--card)",
                    cursor: "pointer",
                    padding: "var(--spacing-2)",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected
                      ? `0 0 0 3px ${cfg.border}33`
                      : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.75rem",
                      lineHeight: 1,
                    }}
                  >
                    {cfg.emoji}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: isSelected
                        ? cfg.color
                        : "var(--neutral-500)",
                    }}
                  >
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-600" />
              {t.mood.addNote}
            </label>
            <Textarea
              placeholder={t.mood.notePlaceholder}
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSaveMood}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Post Mood"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {partner && (
        <div className="grid grid-cols-2 gap-4">
          {/* Your Average */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>
                Your Average (30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userAverage.toFixed(1)}/4
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userMoods.length} entries
                  </p>
                </div>
              </div>
              <Progress
                value={(userAverage / 4) * 100}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          {/* Partner Average */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>
                {partner.name}'s Average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {partnerAverage.toFixed(1)}/4
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {partnerMoods.length} entries
                  </p>
                </div>
              </div>
              <Progress
                value={(partnerAverage / 4) * 100}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood Trends Chart */}
      {partner &&
        last7DaysData.some(
          (d) => d.you !== null || d.partner !== null,
        ) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success-700" />
                Mood Trends (Last 30 Days)
              </CardTitle>
              <CardDescription>
                Track your emotional patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent
              style={{
                paddingTop: "var(--spacing-3)",
                paddingBottom: "var(--spacing-3)",
              }}
            >
              {/* Waffle Chart — compact, inside CardContent */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-3)",
                }}
              >
                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--spacing-2)",
                  }}
                >
                  {[
                    {
                      label: "Great",
                      bg: "var(--success-500)",
                    },
                    {
                      label: "Good",
                      bg: "var(--secondary-500)",
                    },
                    { label: "Okay", bg: "var(--warning-500)" },
                    { label: "Sad", bg: "var(--error-500)" },
                    {
                      label: "No entry",
                      bg: "var(--neutral-200)",
                    },
                  ].map(({ label, bg }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: bg,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "var(--text-label)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grids — side by side */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--spacing-4)",
                  }}
                >
                  {[
                    {
                      name: profile?.name || "You",
                      key: "you" as const,
                    },
                    {
                      name: partner?.name || "Partner",
                      key: "partner" as const,
                    },
                  ].map(({ name, key }) => {
                    const moodColor = (val: number | null) => {
                      if (val === null || val === undefined)
                        return "var(--neutral-200)";
                      if (val >= 3.5)
                        return "var(--success-500)";
                      if (val >= 2.5)
                        return "var(--secondary-500)";
                      if (val >= 1.5)
                        return "var(--warning-500)";
                      return "var(--error-500)";
                    };
                    const moodLabel = (val: number | null) => {
                      if (val === null || val === undefined)
                        return "No entry";
                      if (val >= 3.5) return "Great";
                      if (val >= 2.5) return "Good";
                      if (val >= 1.5) return "Okay";
                      return "Sad";
                    };
                    return (
                      <div key={key}>
                        <p
                          style={{
                            fontSize: "var(--text-caption)",
                            fontWeight:
                              "var(--font-weight-semibold)",
                            color: "var(--foreground)",
                            marginBottom: "var(--spacing-1)",
                          }}
                        >
                          {name}
                        </p>
                        {/* 6 cols × 5 rows = 30 days */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(6, 1fr)",
                            gap: 3,
                          }}
                        >
                          {last7DaysData.map((d, i) => (
                            <div
                              key={i}
                              title={`${d.date}: ${moodLabel(d[key])}`}
                              style={{
                                width: "100%",
                                aspectRatio: "1/1",
                                borderRadius: 3,
                                background: moodColor(d[key]),
                                cursor: "default",
                                transition: "transform 0.1s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.4)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1)")
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Mood Distribution */}
      {partner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              Mood Distribution (Last 30 Days)
            </CardTitle>
            <CardDescription>
              How often you felt each emotion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Your Distribution */}
            <div className="space-y-3">
              <p
                style={{
                  fontSize: "var(--text-callout)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--foreground)",
                }}
              >
                {profile?.name || "You"}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(
                  Object.entries(MOOD_CONFIG) as [
                    keyof typeof MOOD_CONFIG,
                    (typeof MOOD_CONFIG)[keyof typeof MOOD_CONFIG],
                  ][]
                ).map(([mood, cfg]) => (
                  <div
                    key={mood}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding:
                        "var(--spacing-3) var(--spacing-2)",
                      background: cfg.bg,
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${cfg.border}55`,
                      gap: "var(--spacing-1)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.4rem",
                        lineHeight: 1,
                      }}
                    >
                      {cfg.emoji}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-subtitle)",
                        fontWeight: "var(--font-weight-bold)",
                        color: cfg.color,
                        lineHeight: 1,
                      }}
                    >
                      {userMoodCounts[mood]}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-label)",
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Partner Distribution */}
            <div className="space-y-3">
              <p
                style={{
                  fontSize: "var(--text-callout)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--foreground)",
                }}
              >
                {partner.name}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(
                  Object.entries(MOOD_CONFIG) as [
                    keyof typeof MOOD_CONFIG,
                    (typeof MOOD_CONFIG)[keyof typeof MOOD_CONFIG],
                  ][]
                ).map(([mood, cfg]) => (
                  <div
                    key={mood}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding:
                        "var(--spacing-3) var(--spacing-2)",
                      background: cfg.bg,
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${cfg.border}55`,
                      gap: "var(--spacing-1)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.4rem",
                        lineHeight: 1,
                      }}
                    >
                      {cfg.emoji}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-subtitle)",
                        fontWeight: "var(--font-weight-bold)",
                        color: cfg.color,
                        lineHeight: 1,
                      }}
                    >
                      {partnerMoodCounts[mood]}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-label)",
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {partner && (
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50/50 to-primary-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              AI Mood Analysis
            </CardTitle>
            <CardDescription>
              Get insights from your emotional patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis ? (
              <div
                className="rounded-lg p-4"
                style={{
                  background: "var(--card)",
                  border: `1px solid ${analysis.isFallback ? "var(--border)" : "var(--primary-200)"}`,
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div className="flex items-start gap-2 mb-3">
                  {analysis.isFallback ? (
                    <Brain
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    />
                  ) : (
                    <Sparkles
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--warning-500)" }}
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium mb-2"
                      style={{
                        fontWeight:
                          "var(--font-weight-semibold)",
                        color: "var(--foreground)",
                      }}
                    >
                      {analysis.isFallback
                        ? "Mood Summary"
                        : "AI Insights"}
                    </p>
                    <div
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{
                        fontSize: "var(--text-callout)",
                        color: "var(--foreground)",
                      }}
                    >
                      {analysis.analysis}
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div
                  style={{
                    fontSize: "var(--text-label)",
                    color: "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock className="w-3 h-3" />
                  {analysis.createdAt
                    ? (() => {
                        const d = new Date(analysis.createdAt);
                        return isNaN(d.getTime())
                          ? "Just now"
                          : d.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            });
                      })()
                    : "Just now"}
                  {analysis.isFallback && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      · Stats-based
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Brain
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: "var(--primary-300)" }}
                />
                <p
                  className="text-sm mb-4"
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "var(--text-callout)",
                  }}
                >
                  Generate an AI-powered analysis of your mood
                  patterns
                </p>
              </div>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-primary-600 to-sky-600 hover:from-primary-700 hover:to-sky-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Moods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Mood History
          </CardTitle>
          <CardDescription>
            Your last 10 mood entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : moods.length > 0 ? (
              <div className="space-y-3">
                {moods.slice(0, 10).map((mood) => (
                  <div
                    key={mood.id}
                    className={`p-4 rounded-lg border-2 ${getMoodColor(mood.mood)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getMoodIcon(mood.mood, "w-6 h-6")}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="capitalize"
                            >
                              {mood.mood}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {mood.userId === profile?.id
                                ? "You"
                                : partner?.name}
                            </span>
                          </div>
                          {mood.note && (
                            <p className="text-sm text-foreground mt-2">
                              {mood.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(
                          mood.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No mood entries yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start tracking your moods to see patterns and
                  insights
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}