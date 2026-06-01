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

const FEATURE_ICONS = [BookOpen, MessageSquare, Heart, Users, Sparkles, TrendingUp];
const WHY_ICONS = [Shield, Zap, Globe];
const COUPLE_EMOJIS = ['💑', '👫', '💏', '👩‍❤️‍👨'];

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const features = t.landing.features;
  const testimonials = t.landing.testimonials;
  const faqs = t.landing.faq;
  const whyItems = t.landing.whyItems;

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(t.landing.newsletterInvalidEmail);
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

      toast.success(t.landing.newsletterSubscribeSuccess);
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error(t.landing.newsletterSubscribeFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 absolute" />
                <Heart className="w-8 h-8 text-purple-500 fill-purple-500 translate-x-3" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent ml-2">
                TwoBeOne
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-purple-600 transition-colors">
                {t.landing.navFeatures}
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-purple-600 transition-colors">
                {t.landing.navTestimonials}
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-purple-600 transition-colors">
                {t.landing.navFaq}
              </button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t.landing.getStarted}
              </Button>
            </div>

            {/* Mobile Get Started Button */}
            <Button 
              onClick={onGetStarted}
              className="md:hidden bg-gradient-to-r from-rose-500 to-purple-600"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left space-y-6">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Heart className="w-3 h-3 mr-1" />
                Where Faith Meets Love
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl">
                <span className="block mb-2">{t.landing.heroTitle}</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl">
                {t.landing.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  {t.landing.getStarted}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('features')}
                  className="border-2 border-purple-300 hover:bg-purple-50 text-lg px-8 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t.landing.learnMore}
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {COUPLE_EMOJIS.map((emoji, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center border-2 border-white text-lg">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Loved by 10,000+ couples</p>
                  </div>
                </div>
              </div>

              {/* Scripture Reference */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-gray-700 italic">
                  "Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh."
                </p>
                <p className="text-sm text-gray-600 mt-2">— Genesis 2:24</p>
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
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">
              {t.landing.featuresSectionTitle}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">{t.landing.featuresSectionTitle}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.landing.heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = FEATURE_ICONS[index] || BookOpen;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                      <span className="text-lg">{feature.image}</span>
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                    <Button variant="ghost" className="group-hover:text-purple-600 p-0">
                      {t.landing.learnMore}
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
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-purple-100 text-purple-700 mb-4">
                {t.landing.whySectionTitle}
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-6">
                {t.landing.whySectionTitle}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t.landing.heroSubtitle}
              </p>

              <div className="space-y-6">
                {whyItems.map((item, index) => {
                  const IconComponent = WHY_ICONS[index] || Shield;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-gradient-to-br from-rose-50 to-pink-50">
                <p className="text-4xl mb-2">10k+</p>
                <p className="text-gray-600">Active Couples</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-indigo-50">
                <p className="text-4xl mb-2">500k+</p>
                <p className="text-gray-600">Devotionals Read</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-amber-50 to-orange-50">
                <p className="text-4xl mb-2">250k+</p>
                <p className="text-gray-600">Prayers Shared</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                <p className="text-4xl mb-2">4.9★</p>
                <p className="text-gray-600">Average Rating</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">
              {t.landing.testimonialsSectionTitle}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              {t.landing.testimonialsSectionTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {t.landing.heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      <p className="text-xs text-purple-600">{testimonial.married}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">
              {t.landing.faqSectionTitle}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              {t.landing.faqSectionTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {t.landing.heroSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <ChevronRight className="w-5 h-5 text-purple-600 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-gray-600 mt-4 pl-2 border-l-2 border-purple-200">
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
      <section className="py-20 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white">
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
                  <label className="text-sm text-gray-600 block mb-2 text-left">
                    {t.landing.newsletterTitle}
                  </label>
                  <Input
                    type="email"
                    placeholder={t.landing.newsletterEmailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                  size="lg"
                >
                  {isSubmitting ? `${t.landing.newsletterButton}...` : t.landing.newsletterButton}
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
              Get Started Now
            </Button>
          </div>

          <p className="text-sm text-white/70">
            ✨ {t.landing.newsletterSubtitle} ✨
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                <span className="text-xl">TwoBeOne</span>
              </div>
              <p className="text-gray-400 text-sm">
                Strengthening Christian relationships through faith-based tools and daily spiritual practices.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">{t.landing.navFeatures}</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">{t.landing.navTestimonials}</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">{t.landing.navFaq}</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">{t.landing.getStarted}</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="mailto:support@twobeone.app" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} TwoBeOne. All rights reserved. Manaplus dev for couples growing in faith.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}