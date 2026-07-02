import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Sparkles,
  ArrowRight,
  Star,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Play,
  LogIn
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import appScreenshot from 'figma:asset/d5fde893add01b8ea5bf3527897567c586c24a70.png';

// Static data moved outside component for performance
const FEATURES = [
  {
    icon: BookOpen,
    title: 'Daily Devotionals',
    description: 'Scripture-based devotions written specifically for couples to strengthen your spiritual foundation together.',
    color: 'from-warning-500 to-warning-500'
  },
  {
    icon: MessageSquare,
    title: 'Shared Journaling',
    description: 'Express your hearts, reflect on your journey, and share intimate thoughts in a private, secure space.',
    color: 'from-sky-500 to-sky-600'
  },
  {
    icon: Heart,
    title: 'Prayer Together',
    description: 'Create prayer requests, pray for each other daily, and celebrate when God answers. Build faith together.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: Users,
    title: '100+ Meaningful Questions',
    description: 'Deep, faith-based conversation starters across 12 categories to help you truly know each other.',
    color: 'from-primary-500 to-sky-500'
  },
  {
    icon: Sparkles,
    title: 'Learning Modules',
    description: 'Biblical guidance on communication, conflict resolution, intimacy, and spiritual growth.',
    color: 'from-success-500 to-success-700'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track devotional streaks, milestones, and spiritual growth. Celebrate your journey together!',
    color: 'from-primary-500 to-primary-500'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah & Mike',
    location: 'Austin, TX',
    image: '💑',
    quote: 'TwoBeOne transformed our marriage! We pray together daily now and our conversations have never been deeper. This app brought us closer to God and each other.',
    rating: 5,
    married: '3 years'
  },
  {
    name: 'Mahlet & David',
    location: 'Nashville, TN',
    image: '👫',
    quote: 'As a newly engaged couple, TwoBeOne is helping us build a Christ-centered foundation before we say "I do." The questions sparked conversations we never would have had!',
    rating: 5,
    married: 'Engaged'
  },
  {
    name: 'Derartu & Chala',
    location: 'Colorado Springs, CO',
    image: '💏',
    quote: 'After 10 years of marriage, we thought we knew everything about each other. TwoBeOne proved us wrong in the best way possible. We\'re falling in love all over again!',
    rating: 5,
    married: '10 years'
  }
];

// FAQ content mirrors the JSON-LD FAQPage schema in SEOHead.tsx
// so that on-page text and structured data are consistent for both
// search engines and AI answer engines (GEO).
const FAQS = [
  {
    question: 'What is TwoBeOne?',
    answer: 'TwoBeOne is a free Christian couples app that helps partners grow together spiritually through daily Bible-based devotionals, a shared prayer board, couples journaling, and over 1,000 faith-based conversation questions across 11 categories.'
  },
  {
    question: 'Is TwoBeOne free?',
    answer: 'Yes. TwoBeOne is completely free with no subscription required. Both partners download the app and connect via a unique invite code.'
  },
  {
    question: 'What languages does TwoBeOne support?',
    answer: 'TwoBeOne supports English, Amharic (አማርኛ), and Afan Oromo (Oromiffa), making it one of the few Christian couples apps with Ethiopian language support.'
  },
  {
    question: 'Can engaged or dating couples use TwoBeOne?',
    answer: 'Absolutely. TwoBeOne is designed for Christian couples at any stage — dating, engaged, newlywed, or married. The pre-marriage guidance modules are especially valuable for engaged couples.'
  },
  {
    question: 'How does the AI compatibility analysis work in TwoBeOne?',
    answer: 'When both partners answer the same conversation question, TwoBeOne uses Google Gemini AI to semantically analyse both answers and generate a compatibility score, identify shared strengths, suggest growth areas, and provide a personalised weekly action recommendation. Results are saved permanently.'
  },
  {
    question: 'Is TwoBeOne data private?',
    answer: 'Yes. Data is private and shared only between you and your partner. TwoBeOne never sells personal data or uses it for advertising.'
  }
];

const WHY_ITEMS = [
  { icon: Shield, title: 'Private & Secure', desc: 'Bank-level encryption. Your data stays between you and your partner.' },
  { icon: Zap, title: 'Real-Time Sync', desc: 'Instant synchronization across all devices. Stay connected anywhere.' },
  { icon: Globe, title: 'Works Everywhere', desc: 'Web, iOS, and Android. Access from any device, anytime.' }
];

const COUPLE_EMOJIS = ['💑', '👫', '💏', '👩‍❤️‍👨'];

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/newsletter/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      toast.success('🎉 Thanks for subscribing! Check your email soon.');
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary-50 to-primary-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Heart className="w-8 h-8 text-primary-500 fill-primary-500 absolute" />
                <Heart className="w-8 h-8 text-primary-500 fill-primary-500 translate-x-3" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent ml-2">
                TwoBeOne
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-primary-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-primary-600 transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-primary-600 transition-colors">
                FAQ
              </button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t.auth.createAccount}
              </Button>
            </div>

            {/* Mobile Get Started Button */}
            <Button
              onClick={onGetStarted}
              className="md:hidden bg-gradient-to-r from-primary-500 to-primary-700"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-1" />
              {t.auth.createAccount}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left space-y-6">
              <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                <Heart className="w-3 h-3 mr-1" />
                Where Faith Meets Love
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl">
                <span className="block mb-2">Grow Together</span>
                <span className="block bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                  In Faith & Love
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl">
                TwoBeOne helps Christian couples strengthen their relationship through daily devotionals, shared prayers, and meaningful conversations rooted in Scripture.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700 text-lg px-8 py-6"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  {t.auth.createAccount}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('features')}
                  className="border-2 border-primary-300 hover:bg-primary-50 text-lg px-8 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {COUPLE_EMOJIS.map((emoji, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-100 flex items-center justify-center border-2 border-white text-lg">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning-500 text-warning-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Loved by 10,000+ couples</p>
                  </div>
                </div>
              </div>

              {/* Scripture Reference */}
              <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r-lg">
                <p className="text-foreground italic">
                  "Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh."
                </p>
                <p className="text-sm text-muted-foreground mt-2">— Genesis 2:24</p>
              </div>
            </div>

            {/* Right Column - App Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-full max-w-md">
                {/* Real App Screenshot */}
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
                  <img 
                    src={appScreenshot} 
                    alt="TwoBeOne App - Chala T & Derartu A growing together in faith"
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-card rounded-full p-3 shadow-lg animate-bounce">
                  <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card rounded-full p-3 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary-100 text-primary-700 mb-4">
              Everything You Need
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              Built for <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Christian Couples</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed to help you grow closer to God and each other. No fluff, just meaningful tools for your relationship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <Button variant="ghost" className="group-hover:text-primary-600 p-0">
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why TwoBeOne Section */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-primary-100 text-primary-700 mb-4">
                Why TwoBeOne?
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-6">
                More Than Just an App
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We built TwoBeOne because we believe that when Christ is at the center of a relationship, that relationship becomes unbreakable. But staying connected spiritually requires intentionality.
              </p>

              <div className="space-y-6">
                {WHY_ITEMS.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-gradient-to-br from-primary-50 to-primary-100">
                <p className="text-4xl mb-2">10k+</p>
                <p className="text-muted-foreground">Active Couples</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-primary-50 to-sky-50">
                <p className="text-4xl mb-2">500k+</p>
                <p className="text-muted-foreground">Devotionals Read</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-warning-50 to-warning-50">
                <p className="text-4xl mb-2">250k+</p>
                <p className="text-muted-foreground">Prayers Shared</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-success-50 to-success-50">
                <p className="text-4xl mb-2">4.9★</p>
                <p className="text-muted-foreground">Average Rating</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary-100 text-primary-700 mb-4">
              Real Stories, Real Impact
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              What Couples Are Saying
            </h2>
            <p className="text-xl text-muted-foreground">
              Don't just take our word for it. Here's how TwoBeOne is transforming marriages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning-500 text-warning-500" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground italic">"{testimonial.quote}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      <p className="text-xs text-primary-600">{testimonial.married}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-b from-primary-50 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary-100 text-primary-700 mb-4">
              Got Questions?
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about TwoBeOne
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <ChevronRight className="w-5 h-5 text-primary-600 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-muted-foreground mt-4 pl-2 border-l-2 border-primary-200">
                      {faq.answer}
                    </p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl">
            Ready to Grow Together?
          </h2>
          <p className="text-xl text-white/90">
            Join thousands of Christian couples who are building stronger, faith-centered relationships with TwoBeOne.
          </p>
          
          {/* Newsletter Signup */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleNewsletterSignup} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2 text-left">
                    Get notified about updates and tips
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700"
                  size="lg"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              variant="secondary" 
              className="text-lg px-8"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {t.auth.createAccount}
            </Button>
          </div>

          <p className="text-sm text-white/70">
            ✨ Free forever. No credit card required. ✨
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
                <span className="text-xl">TwoBeOne</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Strengthening Christian relationships through faith-based tools and daily spiritual practices.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonials</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Get Started</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="mailto:support@twobeone.app" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TwoBeOne. All rights reserved. Manaplus dev for couples growing in faith.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}