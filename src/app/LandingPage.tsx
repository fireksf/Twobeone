import { useState } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronRight,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Play
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function LandingPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = t.landing.features;
  const testimonials = t.landing.testimonials;
  const faqs = t.landing.faq;

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(t.landing.newsletterSubscribeSuccess);
    setEmail('');
    setIsSubmitting(false);
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
              <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700">
                {t.landing.downloadFree}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
                {t.landing.heroBadge}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl">
                <span className="block mb-2">{t.landing.heroTitle}</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl">
                {t.landing.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6">
                  <Smartphone className="w-5 h-5 mr-2" />
                  {t.landing.downloadFree}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-purple-300 hover:bg-purple-50 text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  {t.landing.watchDemo}
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['💑', '👫', '💏', '👩‍❤️‍👨'].map((emoji, i) => (
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
                    <p className="text-sm text-gray-600">{t.landing.socialProof}</p>
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
                {/* Phone Frame */}
                <div className="relative rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden bg-white">
                  {/* Status Bar */}
                  <div className="bg-gray-800 h-6 flex items-center justify-center text-white text-xs">
                    <span>9:41</span>
                  </div>
                  
                  {/* App Screenshot Mockup */}
                  <div className="bg-gradient-to-b from-purple-100 to-pink-100 p-6 space-y-4" style={{ height: '600px' }}>
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="text-2xl mb-2">Good Morning! ☀️</h3>
                      <p className="text-gray-600 text-sm">Sarah & Mike • Day 45 Streak 🔥</p>
                    </div>

                    {/* Devotional Card */}
                    <Card className="bg-white">
                      <CardContent className="p-4 space-y-3">
                        <Badge className="bg-purple-100 text-purple-700">{t.landing.devotionalCardTitle}</Badge>
                        <h4 className="font-semibold">{t.landing.devotionalCardTitle}</h4>
                        <p className="text-sm text-gray-600">
                          "{t.landing.devotionalCardQuote}"
                        </p>
                        <Button size="sm" className="w-full bg-gradient-to-r from-rose-500 to-purple-600">
                          {t.landing.devotionalCardButton}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="p-3 text-center">
                        <p className="text-2xl">📖</p>
                      <p className="text-xs text-gray-600">{t.landing.statsDevotionals}</p>
                      <p className="font-semibold">45</p>
                    </Card>
                    <Card className="p-3 text-center">
                        <p className="text-2xl">🙏</p>
                        <p className="text-xs text-gray-600">{t.landing.statsPrayers}</p>
                        <p className="font-semibold">23</p>
                    </Card>
                    <Card className="p-3 text-center">
                        <p className="text-2xl">💬</p>
                        <p className="text-xs text-gray-600">{t.landing.statsQuestions}</p>
                        <p className="font-semibold">18</p>
                      </Card>
                    </div>

                    {/* Prayer Request */}
                    <Card className="bg-gradient-to-r from-rose-50 to-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-rose-500 mt-1" />
                          <div>
                          <p className="text-sm font-medium">{t.landing.prayerRequestTitle}</p>
                          <p className="text-xs text-gray-600">{t.landing.prayerRequestDescription}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
              {t.landing.heroBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              {t.landing.featuresHeadline}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.landing.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <Button variant="ghost" className="group-hover:text-purple-600 p-0">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                {t.landing.whyHeadline}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t.landing.whySubtitle}
              </p>

              <div className="space-y-6">
                {[
                  { icon: <Shield className="w-5 h-5" />, title: 'Private & Secure', desc: 'Bank-level encryption. Your data stays between you and your partner.' },
                  { icon: <Zap className="w-5 h-5" />, title: 'Real-Time Sync', desc: 'Instant synchronization across all devices. Stay connected anywhere.' },
                  { icon: <Globe className="w-5 h-5" />, title: 'Works Everywhere', desc: 'Web, iOS, and Android. Access from any device, anytime.' }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
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
              {t.landing.testimonialsBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              {t.landing.testimonialsSectionTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {t.landing.testimonialsSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
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
              {t.landing.faqBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              {t.landing.faqSectionTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {t.landing.faqSubtitle}
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
            {t.landing.ctaTitle}
          </h2>
          <p className="text-xl text-white/90">
            {t.landing.ctaText}
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
                  <p className="text-sm text-gray-600 mt-2">{t.landing.newsletterSubtitle}</p>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                  size="lg"
                >
                  {isSubmitting ? t.common.loading : t.landing.newsletterButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Smartphone className="w-5 h-5 mr-2" />
              Download for iOS
            </Button>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Smartphone className="w-5 h-5 mr-2" />
              Download for Android
            </Button>
          </div>

          <p className="text-sm text-white/70">
            ✨ Free forever. No credit card required. ✨
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
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 TwoBeOne. All rights reserved. Made with 💕 for Christ-centered couples.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>100% Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
