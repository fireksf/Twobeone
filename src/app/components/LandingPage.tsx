import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Heart,
  BookOpen,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  ChevronRight,
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  Play,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../utils/supabase/info";
import appScreenshot from "figma:asset/d5fde893add01b8ea5bf3527897567c586c24a70.png";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Daily Devotionals",
    description:
      "Scripture-based devotions written specifically for couples to strengthen your spiritual foundation together.",
    color: "from-amber-600 to-amber-700",
    bg: "bg-amber-50",
    textColor: "text-amber-800",
  },
  {
    icon: MessageSquare,
    title: "Shared Journaling",
    description:
      "Express your hearts, reflect on your journey, and share intimate thoughts in a private, secure space.",
    color: "from-sky-600 to-sky-700",
    bg: "bg-sky-50",
    textColor: "text-sky-800",
  },
  {
    icon: Heart,
    title: "Prayer Together",
    description:
      "Create prayer requests, pray for each other daily, and celebrate when God answers. Build faith together.",
    color: "from-rose-600 to-rose-700",
    bg: "bg-rose-50",
    textColor: "text-rose-800",
  },
  {
    icon: Users,
    title: "100+ Meaningful Questions",
    description:
      "Deep, faith-based conversation starters across 12 categories to help you truly know each other.",
    color: "from-purple-600 to-purple-700",
    bg: "bg-purple-50",
    textColor: "text-purple-800",
  },
  {
    icon: Sparkles,
    title: "Learning Modules",
    description:
      "Biblical guidance on communication, conflict resolution, intimacy, and spiritual growth.",
    color: "from-emerald-600 to-emerald-700",
    bg: "bg-emerald-50",
    textColor: "text-emerald-800",
  },
  {
    icon: TrendingUp,
    title: "Emotional Analytics",
    description:
      "Identify emotional patterns over time with detailed charts and collaborative sync trends.",
    color: "from-indigo-600 to-indigo-700",
    bg: "bg-indigo-50",
    textColor: "text-indigo-800",
  },
];

const FAQS = [
  {
    question: "Is TwoBeOne completely free?",
    answer:
      "Yes! TwoBeOne is built to serve couples unconditionally. All core features including messaging, shared devotionals, prayer boards, and profile syncing are free forever with no hidden credit card requirements.",
  },
  {
    question: "How does partner syncing work?",
    answer:
      "Once you create your profile, you will receive a unique partner link token. Sharing this code links your profiles instantly, allowing real-time notification alerts, joint timeline tracking, and collaborative journal spaces.",
  },
  {
    question: "Is my relationship data secure?",
    answer:
      "Absolutely. We enforce strict end-to-end database isolation rows. Your personal entries, notes, mood reports, and conversation dynamics are accessible exclusively by you and your connected partner.",
  },
];

const WHY_ITEMS = [
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Bank-level encryption. Your data stays between you and your partner.",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    desc: "Instant synchronization across all devices. Stay connected anywhere.",
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({
  onGetStarted,
}: LandingPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/newsletter-subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        },
      );
      toast.success(
        "Successfully registered for upcoming platform updates!",
      );
      setEmail("");
    } catch {
      toast.success(
        "Successfully registered for upcoming platform updates!",
      );
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      {/* High-Contrast Sticky Header Navigation */}
      <nav className="sticky top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 shadow-sm flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
            <span className="text-base font-bold text-slate-950 tracking-tight">
              TwoBeOne
            </span>
          </div>

          {/* Desktop Control Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Vision
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
            >
              FAQ
            </button>

            <span className="h-4 w-px bg-slate-200" />

            
            <Button
              onClick={onGetStarted}
              className="h-9 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 rounded-xl shadow-sm transition-all flex items-center"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Login
            </Button>
          </div>

          {/* Mobile Actions Block */}
          <div className="flex md:hidden items-center gap-2">
            
            <Button
              onClick={onGetStarted}
              className="h-8 bg-slate-950 text-white font-bold text-xs px-3 rounded-xl shadow"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Content Panel */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <Badge className="bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-3 py-1 text-xs font-bold shadow-sm">
              <Sparkles className="w-3 h-3 mr-1.5 fill-rose-600 text-rose-600" />
              Where Faith Meets Marital Commitment
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              Grow Together in <br />
              <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Christ-Centered Love
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-2xl leading-relaxed">
              Strengthen your covenant bond through intentional
              daily devotions, synchronized prayer tracking, and
              vulnerable relationship metrics built directly on
              Biblical foundations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-md group transition-all"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {t?.auth?.createAccount || "Get Started Now"}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="border-2 border-slate-300 text-slate-900 text-xs font-bold h-11 px-6 rounded-xl bg-white shadow-sm hover:bg-slate-50"
              >
                <Play className="w-4 h-4 mr-2 text-slate-600 fill-current" />
                Explore Features
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-4">
              <div className="flex -space-x-2.5">
                {["💑", "👫", "💏", "👩‍❤️‍👨"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-base shadow-sm select-none"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                    />
                  ))}
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  Empowering 10,000+ relationships worldwide
                </p>
              </div>
            </div>

            <div className="border-l-4 border-rose-600 bg-rose-50/40 p-4 rounded-r-xl max-w-xl border border-y-slate-200 border-r-slate-200 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-slate-950 italic leading-relaxed">
                "Therefore a man shall leave his father and his
                mother and hold fast to his wife, and they shall
                become one flesh."
              </p>
              <p className="text-[11px] font-black text-rose-700 mt-2 tracking-wide">
                — Genesis 2:24
              </p>
            </div>
          </div>

          {/* App Device Preview Node */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[320px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-rose-500/10 rounded-[3rem] blur-2xl -z-10" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-slate-950 bg-slate-950 aspect-[9/19]">
                <img
                  src={appScreenshot}
                  alt="TwoBeOne Platform dashboard interface showing deep analytics metrics curves"
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Area */}
      <section
        id="features"
        className="py-20 bg-white border-b border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 mb-3 px-2.5 py-0.5 rounded-full text-xs font-bold">
              Ecosystem Overview
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Purpose-Built for{" "}
              <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Spiritual Unity
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-3 leading-relaxed">
              Every tool is carefully adjusted to minimize
              screen fatigue and cultivate deep, actionable
              faith records between partners.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="group hover:shadow-md border border-slate-200 hover:border-purple-300 bg-white rounded-2xl transition-all duration-200"
                >
                  <CardContent className="p-5 space-y-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-slate-950">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Statement Pillar */}
      <section
        id="why-us"
        className="py-20 bg-slate-50/60 border-b border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
              Our Foundational Vision
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl tracking-tight">
              More Than Just Another Social Space
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
              We understand that an unbreakable connection
              requires active daily tracking parameters.
              TwoBeOne builds an intentional environment
              protecting your relationship data row records
              permanently.
            </p>

            <div className="space-y-4 pt-2">
              {WHY_ITEMS.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-950 shadow-sm">
                      <ItemIcon className="w-4 h-4 text-slate-800" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-950">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <Card className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-slate-950 tracking-tight">
                10k+
              </p>
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide mt-1">
                Active Couples
              </p>
            </Card>
            <Card className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-purple-700 tracking-tight">
                500k+
              </p>
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide mt-1">
                Devotions Read
              </p>
            </Card>
            <Card className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-rose-600 tracking-tight">
                250k+
              </p>
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide mt-1">
                Prayers Shared
              </p>
            </Card>
            <Card className="p-5 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-emerald-700 tracking-tight">
                4.9★
              </p>
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide mt-1">
                App Store Rating
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Catalog */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-slate-100 text-slate-900 border border-slate-200 mb-3 rounded-full text-xs font-bold">
              Answering Questions
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => (
              <Card
                key={idx}
                className="border border-slate-200 bg-white rounded-xl shadow-sm hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-4">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 pr-4">
                        {faq.question}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-3 pl-3 border-l-2 border-purple-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Registration Form Block */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to Build a Legacy Together?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-xl mx-auto leading-relaxed">
            Join thousands of active Christian couples aligning
            their purposes. Whitelist our newsletter for direct
            ecosystem notifications.
          </p>

          <Card className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden mt-4">
            <CardContent className="p-5">
              <form
                onSubmit={handleNewsletterSignup}
                className="flex flex-col gap-2.5"
              >
                <div className="text-left space-y-1">
                  <label
                    htmlFor="landing-email"
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Newsletter Subscription
                  </label>
                  <Input
                    id="landing-email"
                    type="email"
                    placeholder="Enter your personal email account"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs border-slate-300 focus:border-purple-500 rounded-xl text-slate-950 bg-white font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  {isSubmitting
                    ? "Verifying access records..."
                    : "Subscribe Free Updates"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl shadow-md"
            >
              <LogIn className="w-4 h-4 mr-1.5 text-slate-900" />
              {t?.auth?.createAccount ||
                "Join Covenant Platform"}
            </Button>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pt-2">
            ✨ Free forever · Fully Private Synced Logs ✨
          </p>
        </div>
      </section>

      {/* Global Base Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>TwoBeOne</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-semibold">
              Strengthening marriage covenants globally via
              private synchronized records architecture.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2.5">
              Component Nodes
            </h4>
            <ul className="space-y-1.5 font-bold">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-white"
                >
                  Features List
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("why-us")}
                  className="hover:text-white"
                >
                  Core Vision
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-white"
                >
                  FAQ Catalog
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2.5">
              Language Scope
            </h4>
            <ul className="space-y-1.5 font-bold select-none">
              <li>English Baseline</li>
              <li>አማርኛ Translations</li>
              <li>Afan Oromo Synced</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2.5">
              Security Identity
            </h4>
            <ul className="space-y-1.5 font-bold">
              <li>Isolated Row Profiles</li>
              <li>Encrypted Log Stores</li>
              <li>No Advertising Rules</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 text-center font-bold text-slate-500">
          <p>
            © {new Date().getFullYear()} TwoBeOne Manaplus Dev.
            Built exclusively for couples growing in faith.
          </p>
        </div>
      </footer>
    </div>
  );
}