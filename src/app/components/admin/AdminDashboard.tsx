import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  BookOpen,
  MessageCircle,
  GraduationCap,
  Heart,
  RefreshCw,
} from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  projectId,
  publicAnonKey,
} from "../../utils/supabase/info";
import { toast } from "sonner";

interface AdminDashboardProps {
  accessToken?: string;
  onNavigate?: (section: string) => void;
}

export function AdminDashboard({
  accessToken,
  onNavigate,
}: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCouples: 0,
    totalDevotionals: 0,
    totalQuestions: 0,
    totalJournalEntries: 0,
    totalPrayers: 0,
    completionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Guard: only fetch once a real user token is available.
    // Using the anon key on admin routes causes the edge function to crash
    // before sending response headers → browser throws TypeError: Failed to fetch.
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    loadDashboardData();
  }, [accessToken]); // re-run when token becomes available after async auth

  const loadDashboardData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const base = `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee`;

      const [statsRes, activityRes] = await Promise.all([
        fetch(`${base}/admin/stats`, { headers }),
        fetch(`${base}/admin/recent-activity`, { headers }),
      ]);

      if (statsRes.ok) {
        const { stats: apiStats } = await statsRes.json();
        setStats({
          totalUsers: apiStats.totalUsers || 0,
          activeCouples: apiStats.activeCouples || 0,
          totalDevotionals: apiStats.totalDevotionals || 0,
          totalQuestions: apiStats.totalQuestions || 0,
          totalJournalEntries:
            apiStats.totalJournalEntries || 0,
          totalPrayers: apiStats.totalPrayers || 0,
          completionRate: apiStats.completionRate || 0,
        });
      } else {
        console.warn(
          "Admin stats:",
          statsRes.status,
          await statsRes.text(),
        );
      }

      if (activityRes.ok) {
        const { activities } = await activityRes.json();
        setRecentActivity(activities || []);
      } else {
        console.warn(
          "Admin activity:",
          activityRes.status,
          await activityRes.text(),
        );
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error(
        "Failed to load dashboard data. Please refresh.",
      );
    } finally {
      setIsLoading(false);
    }
  }; // Sample statistics - will be replaced with real data

  const displayStats = [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
      link: "users",
    },
    {
      label: "Active Couples",
      value: stats.activeCouples.toString(),
      change: "+8%",
      trend: "up",
      icon: Heart,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
      link: "users",
    },
    {
      label: "Devotionals",
      value: stats.totalDevotionals.toString(),
      change: "+2",
      trend: "up",
      icon: BookOpen,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
      link: "devotionals",
    },
    {
      label: "Q&A Questions",
      value: stats.totalQuestions.toString(),
      change: "+8",
      trend: "up",
      icon: MessageCircle,
      color: "text-success-700",
      bgColor: "bg-success-50",
      link: "questions",
    },
    {
      label: "Journal Entries",
      value: stats.totalJournalEntries.toString(),
      change: "+15",
      trend: "up",
      icon: GraduationCap,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
      link: "modules",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-warning-500",
      bgColor: "bg-warning-50",
      link: "dashboard",
    },
  ];

  const contentNeeded = [
    {
      type: "Devotional",
      date: "November 15, 2025",
      status: "needed",
    },
    {
      type: "Devotional",
      date: "November 16, 2025",
      status: "needed",
    },
    {
      type: "Module",
      title: "Financial Planning",
      status: "in-progress",
    },
    {
      type: "Q&A Questions",
      category: "Spiritual Growth",
      status: "needed",
    },
  ];

  return (
    <div className="space-y-6">
            {/* Page Header */}     {" "}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               {" "}
        <div>
                   {" "}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Dashboard
          </h2>
                   {" "}
          <p className="text-sm text-muted-foreground">
            Overview of your content management system
          </p>
                 {" "}
        </div>
               {" "}
        <Button
          variant="outline"
          onClick={loadDashboardData}
          disabled={isLoading}
          size="sm"
          className="w-full sm:w-auto"
        >
                   {" "}
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
                    Refresh        {" "}
        </Button>
             {" "}
      </div>
            {/* Stats Grid - Enhanced Design */}     {" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
               {" "}
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => onNavigate?.(stat.link)}
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-muted border border-border hover:border-primary-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer text-left w-full"
            >
                            {/* Background Gradient Accent */}
                           {" "}
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} opacity-20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-30 transition-opacity`}
              />
                                          {" "}
              <div className="relative p-6">
                                {/* Icon and Badge Row */}     
                         {" "}
                <div className="flex items-center justify-between mb-5">
                                   {" "}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                                       {" "}
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                                     {" "}
                  </div>
                                   {" "}
                  <div className="flex flex-col items-end gap-1">
                                       {" "}
                    <Badge className="bg-gradient-to-r from-success-500 to-success-700 text-white border-0 shadow-sm text-xs font-semibold px-2.5 py-1">
                                            {stat.change}       
                                 {" "}
                    </Badge>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                                {/* Stats Content */}           
                   {" "}
                <div className="space-y-1">
                                   {" "}
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                                   {" "}
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                                 {" "}
                </div>
                               {" "}
                {/* Progress Bar (optional visual element) */} 
                             {" "}
                <div className="mt-4 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                   {" "}
                  <div
                    className={`h-full bg-gradient-to-r ${stat.color.replace("text-", "from-")} to-primary-500 rounded-full transition-all duration-500`}
                    style={{ width: `${65 + index * 5}%` }}
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </button>
          );
        })}
             {" "}
      </div>
           {" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}       {" "}
        <Card className="p-6">
                   {" "}
          <h3 className="font-semibold text-lg mb-4">
            Recent Activity
          </h3>
                   {" "}
          <div className="space-y-3">
                       {" "}
            {recentActivity.length > 0 ? (
              recentActivity
                .slice(0, 5)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                                     {" "}
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                                     {" "}
                    <div className="flex-1 min-w-0">
                                         {" "}
                      <p className="text-sm font-medium truncate">
                        {activity.action}
                      </p>
                                         {" "}
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.user}
                      </p>
                                       {" "}
                    </div>
                                     {" "}
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {activity.time}
                    </span>
                                   {" "}
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                               {" "}
                <p className="text-sm">No recent activity</p>   
                         {" "}
              </div>
            )}
                     {" "}
          </div>
                 {" "}
        </Card>
                {/* Content Needed */}       {" "}
        <Card className="p-6">
                   {" "}
          <h3 className="font-semibold text-lg mb-4">
            Content Needed
          </h3>
                   {" "}
          <div className="space-y-3">
                       {" "}
            {contentNeeded.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-warning-50 rounded-lg gap-2"
              >
                               {" "}
                <div className="min-w-0 flex-1">
                                   {" "}
                  <p className="font-medium text-sm truncate">
                    {item.type}
                  </p>
                                   {" "}
                  <p className="text-xs text-muted-foreground truncate">
                                       {" "}
                    {item.date || item.title || item.category} 
                                   {" "}
                  </p>
                                 {" "}
                </div>
                               {" "}
                <Badge
                  variant={
                    item.status === "needed"
                      ? "destructive"
                      : "secondary"
                  }
                  className={`text-xs flex-shrink-0 ${item.status === "in-progress" ? "bg-warning-50 text-warning-700" : ""}`}
                >
                                    {item.status}             
                   {" "}
                </Badge>
                             {" "}
              </div>
            ))}
                     {" "}
          </div>
                 {" "}
        </Card>
             {" "}
      </div>
            {/* Quick Actions */}     {" "}
      <Card className="p-6">
               {" "}
        <h3 className="font-semibold text-lg mb-4">
          Quick Actions
        </h3>
               {" "}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                   {" "}
          <button
            onClick={() => onNavigate?.("devotionals")}
            className="p-4 lg:p-5 border-2 border-dashed border-border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
          >
                       {" "}
            <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
                       {" "}
            <p className="text-sm font-medium text-foreground group-hover:text-primary-700">
              Add Devotional
            </p>
                     {" "}
          </button>
                   {" "}
          <button
            onClick={() => onNavigate?.("questions")}
            className="p-4 lg:p-5 border-2 border-dashed border-border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
          >
                       {" "}
            <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
                       {" "}
            <p className="text-sm font-medium text-foreground group-hover:text-primary-700">
              Add Question
            </p>
                     {" "}
          </button>
                   {" "}
          <button
            onClick={() => onNavigate?.("modules")}
            className="p-4 lg:p-5 border-2 border-dashed border-border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
          >
                       {" "}
            <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
                       {" "}
            <p className="text-sm font-medium text-foreground group-hover:text-primary-700">
              Create Module
            </p>
                     {" "}
          </button>
                   {" "}
          <button
            onClick={() => onNavigate?.("groups")}
            className="p-4 lg:p-5 border-2 border-dashed border-border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
          >
                       {" "}
            <Users className="w-6 h-6 lg:w-7 lg:h-7 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
                       {" "}
            <p className="text-sm font-medium text-foreground group-hover:text-primary-700">
              Add Group
            </p>
                     {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </Card>
         {" "}
    </div>
  );
}