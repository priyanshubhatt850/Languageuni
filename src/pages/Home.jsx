import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CourseCard from '@/components/common/CourseCard';
import { useTheme } from '@/components/ui/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Globe,
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Clock,
  MessageCircle,
  Moon,
  Sun,
  Search,
  Zap,
  Heart,
  Shield,
  ChevronDown,
  TrendingUp,
  Mail,
  Lock,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const dummyCourses = [
  {
    id: 1,
    title: "English - A1",
    description: "Start your English journey from the basics",
    language: "English",
    level: "A1",
    instructor_name: "Expert Instructor",
    price: 1999,
    discount_price: 999,
    thumbnail_url: "",
    duration_hours: 12,
    enrolled_count: 120,
    rating: 4.5,
    reviews_count: 45
  },
  {
    id: 2,
    title: "German - A1",
    description: "Learn basic German for daily conversations",
    language: "German",
    level: "A1",
    instructor_name: "Expert Instructor",
    price: 2499,
    discount_price: 1199,
    thumbnail_url: "",
    duration_hours: 15,
    enrolled_count: 90,
    rating: 4.6,
    reviews_count: 30
  },
  {
    id: 3,
    title: "French - A1",
    description: "Build a strong foundation in French",
    language: "French",
    level: "A1",
    instructor_name: "Expert Instructor",
    price: 2299,
    discount_price: 1099,
    thumbnail_url: "",
    duration_hours: 14,
    enrolled_count: 75,
    rating: 4.4,
    reviews_count: 25
  }
];

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from certified native speakers with years of teaching experience across all proficiency levels.'
  },
  {
    icon: Play,
    title: 'Live & Recorded Classes',
    description: 'Join interactive live sessions or learn at your own pace with high-quality recorded lessons.'
  },
  {
    icon: Award,
    title: 'Certified Learning',
    description: 'Earn internationally recognized certificates upon successful completion of each course level.'
  },
  {
    icon: MessageCircle,
    title: '1-on-1 Support',
    description: 'Get personalized feedback and dedicated guidance from your assigned language instructor.'
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'Global Tongue transformed my Spanish skills completely. The live classes are incredibly engaging and the instructors are world-class!',
    rating: 5
  },
  {
    name: 'Michael Torres',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'Finally found a platform that makes learning Japanese fun and effective. The structured approach is exactly what I needed.',
    rating: 5
  },
  {
    name: 'Emma Wilson',
    role: 'University Student',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: 'The structured curriculum and practice exercises helped me ace my French B2 exam on the first try. Highly recommended!',
    rating: 5
  },
];

const dummyLanguages = [
  { id: 1, name: "English", flag: "🇬🇧", instructor_count: 12 },
  { id: 2, name: "German", flag: "🇩🇪", instructor_count: 8 },
  { id: 3, name: "French", flag: "🇫🇷", instructor_count: 6 },
  { id: 4, name: "Spanish", flag: "🇪🇸", instructor_count: 7 },
  { id: 5, name: "Italian", flag: "🇮🇹", instructor_count: 4 },
  { id: 6, name: "Japanese", flag: "🇯🇵", instructor_count: 5 },
];

function InteractivePracticeCard() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setShowExplanation(true);
  };

  const reset = () => {
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <Card className="w-full max-w-[380px] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-2xl overflow-hidden backdrop-blur-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interactive Partner</span>
          </div>
          <Badge variant="secondary" className="bg-violet-50 dark:bg-violet-950 text-violet-750 dark:text-violet-300 border-none font-medium text-[11px] rounded-lg">
            Spanish A1
          </Badge>
        </div>

        {/* Chat message bubbles */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <Avatar className="w-7 h-7 border border-slate-105">
              <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">AI</AvatarFallback>
            </Avatar>
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] leading-relaxed">
              👋 ¡Hola! Let's practice. How do you say <span className="font-semibold text-violet-600 dark:text-violet-400">"Good morning"</span> in Spanish? 🇪🇸
            </div>
          </div>

          <AnimatePresence>
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 justify-end"
              >
                <div className={`p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] text-white leading-relaxed ${
                  selectedOption === 'A' 
                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/10' 
                    : 'bg-rose-500 shadow-md shadow-rose-500/10'
                }`}>
                  {selectedOption === 'A' ? 'Buenos días ☀️' : selectedOption === 'B' ? 'Buenas noches 🌙' : 'Adiós 👋'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options */}
        {!showExplanation ? (
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleSelect('A')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 text-sm font-medium text-slate-705 dark:text-slate-300 transition-all duration-200 flex items-center justify-between group"
            >
              <span>A) Buenos días</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>
            <button
              onClick={() => handleSelect('B')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 text-sm font-medium text-slate-705 dark:text-slate-300 transition-all duration-200 flex items-center justify-between group"
            >
              <span>B) Buenas noches</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>
            <button
              onClick={() => handleSelect('C')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 text-sm font-medium text-slate-705 dark:text-slate-300 transition-all duration-200 flex items-center justify-between group"
            >
              <span>C) Adiós</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3"
          >
            <div className="flex items-center gap-2">
              {selectedOption === 'A' ? (
                <>
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-sm text-slate-800 dark:text-white">¡Excelente! Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-sm text-slate-800 dark:text-white">Oops, incorrect</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {selectedOption === 'A' 
                ? '"Buenos días" translates directly to "Good morning". It is the standard greeting used until noon.' 
                : selectedOption === 'B' 
                  ? '"Buenas noches" translates to "Good evening" or "Good night". Try again to find the morning greeting.'
                  : '"Adiós" is a parting farewell meaning "Goodbye". Try again to greet the day.'
              }
            </p>
            <Button
              size="sm"
              onClick={reset}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 rounded-lg text-xs"
            >
              {selectedOption === 'A' ? 'Practice Again' : 'Try Again'}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, authError, checkUserAuth } = useAuth();
  const navigate = useNavigate();

  // Auth Popup Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('role'); // 'role' | 'otp'
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const { data: languages = [] } = useQuery({
    queryKey: ['active-languages'],
    queryFn: async () => {
      const allLanguages = await WWClient.entities.Language.filter({ is_active: true }, 'display_order');
      return allLanguages.filter(lang => lang.instructor_count > 0);
    },
    initialData: []
  });

  const languagesToShow = isAuthenticated ? languages : dummyLanguages;

  const { data: a1Levels = [] } = useQuery({
    queryKey: ['a1-levels'],
    queryFn: async () => {
      const levels = await WWClient.entities.CourseLevel.filter({ status: 'published' }, '-enrolled_count', 12);
      return levels.slice(0, 6);
    },
    initialData: []
  });

  const coursetoshow = isAuthenticated ? a1Levels : dummyCourses;

  const openPortal = () => {
    toast("Opening Portal...");
    setAuthStep('role');
    setSelectedRole(null);
    setEmail('');
    setOTP('');
    setOtpSent(false);
    setShowAuthModal(true);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAuthStep('otp');
    setOtpSent(false);
    setOTP('');
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setAuthLoading(true);
    try {
      await WWClient.functions.invoke('sendOTP', {
        email: email,
        service_type: selectedRole.id
      });
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (e) {
      toast.error('Failed to send OTP. Please check your network.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setAuthLoading(true);
    try {
      const data = await WWClient.functions.invoke('verifyOTP', {
        email,
        otp: otp.trim()
      });

      if (data?.success) {
        await checkUserAuth();
        const { role, profileCompleted } = data.user;
        setShowAuthModal(false);

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
        } else if (role === 'student') {
          navigate(profileCompleted ? '/StudentDashboard' : '/StudentOnboarding');
        } else {
          navigate('/');
        }
        toast.success('OTP verified! Redirecting...');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (e) {
      toast.error('Verification failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setAuthLoading(true);
      const data = await WWClient.functions.invoke('verifyGoogleToken', {
        googletoken: credentialResponse.credential,
        service_type: selectedRole.id
      });

      if (data?.success) {
        await checkUserAuth();
        const { role, profileCompleted } = data.user;
        setShowAuthModal(false);

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
        } else if (role === 'student') {
          navigate(profileCompleted ? '/StudentDashboard' : '/StudentOnboarding');
        } else {
          navigate('/');
        }
        toast.success('Google login successful!');
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 group">
                <img src="/logo.png" alt="Global Tongue logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300" />
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Global Tongue</span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link to={createPageUrl('CourseCatalog')} className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium text-sm">
                  Courses
                </Link>
                <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium text-sm">
                  Features
                </a>
                <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium text-sm">
                  Reviews
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-xl animate-none"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                {isAuthenticated ? (
                  <Link to={createPageUrl(
                    user?.role === 'admin' ? 'AdminDashboard' :
                      user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                  )}>
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all font-semibold h-10 px-5">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all rounded-xl font-semibold h-10 px-5"
                    onClick={openPortal}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 relative overflow-hidden">
          {/* Light Mode Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-300" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-30 dark:opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" className="text-violet-300 dark:text-slate-700" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>

          {/* Radial Accents */}
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/20 to-purple-400/10 dark:from-violet-600/10 dark:to-purple-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/15 to-violet-400/10 dark:from-blue-600/5 dark:to-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative px-2 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left">
              {/* Left text column */}
              <div className="lg:col-span-7 space-y-6">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="inline-flex bg-violet-100 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-violet-500 dark:text-violet-400" />
                    <span className="font-semibold text-xs tracking-wide">Trusted by 50K+ learners worldwide</span>
                  </Badge>
                </motion.div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight">
                  <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Master Languages
                  </span>
                  <br />
                  <span className="text-slate-900 dark:text-white">
                    With Confidence
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-405 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Learn from world-class instructors with immersive live classes, interactive sessions, and personalized guidance
                </p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2"
                >
                  <Button 
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/CourseCatalog');
                      } else {
                        openPortal();
                      }
                    }} 
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-8 w-full sm:w-auto shadow-md shadow-violet-600/20 hover:shadow-lg transition-all rounded-xl h-11 font-bold"
                  >
                    Explore Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={openPortal} 
                    variant="outline" 
                    className="text-sm px-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all w-full sm:w-auto font-bold h-11"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    See Demo
                  </Button>
                </motion.div>

                {/* Review Avatars */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-8"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Avatar key={i} className="w-11 h-11 border-[3px] border-white dark:border-slate-950 shadow-md">
                        <AvatarImage src={`https://i.pravatar.cc/120?img=${i + 10}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-0.5 text-amber-500 justify-center sm:justify-start mb-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                      <span className="text-violet-600 dark:text-violet-400 font-bold">4.9/5</span> rating from 50K+ reviews
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Card Column (Signature Interactive Element) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <InteractivePracticeCard />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative transition-colors duration-300">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 px-4"
            >
              <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
                <Globe className="w-3.5 h-3.5 mr-2" />
                Learn Any Language
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                Choose from 20+ Languages
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Explore world-class courses taught by native speakers tailored to your learning pace.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 px-2 sm:px-0">
              {languagesToShow.map((lang, index) => (
                <motion.div
                  key={lang.id || lang._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="h-full"
                >
                  <button 
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/LanguageDetail?id=${lang._id}`);
                      } else {
                        openPortal();
                      }
                    }}
                    className="w-full text-left h-full"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-850 hover:shadow-xl hover:shadow-violet-100/30 dark:hover:shadow-violet-950/15 transition-all duration-300 cursor-pointer group rounded-2xl h-full">
                        <CardContent className="p-5 text-center flex flex-col items-center justify-center h-full space-y-3">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-violet-50 dark:group-hover:bg-violet-950/30 flex items-center justify-center transition-all duration-300 border border-slate-200 dark:border-slate-700 group-hover:border-violet-200 dark:group-hover:border-violet-800 shrink-0">
                            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{lang.flag}</span>
                          </div>
                          <p className="font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm sm:text-base">
                            {lang.name}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {lang.instructor_count > 0 ? `${lang.instructor_count} Expert${lang.instructor_count > 1 ? 's' : ''}` : 'Coming Soon'}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <Badge className="mb-3 bg-violet-100 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 mr-2 fill-violet-500 text-violet-500" />
                  Top Rated
                </Badge>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Featured Courses
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-light">
                  Most popular courses chosen by our global community
                </p>
              </div>
              <Button 
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/CourseCatalog');
                  } else {
                    openPortal();
                  }
                }} 
                variant="outline" 
                className="border-slate-200 dark:border-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 rounded-xl font-bold h-11 px-5 transition-all"
              >
                View All Courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursetoshow.length > 0 ? (
                coursetoshow.map((level, index) => {
                  const allLanguages = [...languagesToShow];
                  const language = allLanguages.find(l => l._id === level.language_id) ||
                    { name: 'Language', flag: '🌐' };
                  const courseData = {
                    id: level._id,
                    title: `${language.name} - ${level.level_name}`,
                    description: level.description || 'Start your language journey from the basics',
                    language: language.name,
                    level: level.level_name,
                    instructor_name: 'Expert Instructor',
                    price: level.price,
                    discount_price: level.discount_price,
                    thumbnail_url: level.thumbnail_url,
                    duration_hours: level.duration_hours || 0,
                    enrolled_count: level.enrolled_count || 0,
                    rating: level.rating || 0,
                    reviews_count: 0
                  };
                  return (
                    <CourseCard
                      key={level._id}
                      course={courseData}
                      delay={index}
                    />
                  );
                })
              ) : (
                [1, 2, 3].map((i) => (
                  <Card key={i} className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <CardContent className="p-5 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Why Choose Us Features Section */}
        <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5 mr-2 text-violet-500" />
                Why Choose Us
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Everything for Your Success
              </h2>
              <p className="text-slate-500 dark:text-slate-450 max-w-2xl mx-auto text-lg font-light">
                A comprehensive learning platform offering all the tools and certifications needed to achieve absolute fluency.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="h-full"
                >
                  <motion.div whileHover={{ y: -5 }} className="h-full">
                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-950/20 transition-all duration-300 h-full rounded-2xl group overflow-hidden">
                      <CardContent className="p-7 flex flex-col h-full">
                        <motion.div
                          className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 flex items-center justify-center mb-5 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors"
                          whileHover={{ scale: 1.05, rotate: -3 }}
                        >
                          <feature.icon className="w-7 h-7 text-violet-600 dark:text-violet-400 transition-colors" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-white dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-10 sm:p-16 relative overflow-hidden shadow-2xl shadow-violet-600/20">
              {/* Ambient Glows */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="stats-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#stats-grid)" />
                </svg>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                  { value: '50K+', label: 'Active Learners', icon: Users },
                  { value: '500+', label: 'Expert Instructors', icon: GraduationCap },
                  { value: '1000+', label: 'Courses Available', icon: BookOpen },
                  { value: '95%', label: 'Success Rate', icon: TrendingUp },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <motion.div whileHover={{ scale: 1.1 }} className="inline-block mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/10">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </motion.div>
                      <p className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
                      <p className="text-white/80 font-medium text-sm">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
                <Heart className="w-3.5 h-3.5 mr-2 text-violet-500 fill-violet-500" />
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Loved by Learners Worldwide
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-violet-100/30 dark:hover:shadow-violet-950/10 hover:-translate-y-2 transition-all duration-300 h-full bg-white dark:bg-slate-900 rounded-2xl">
                    <CardContent className="p-7 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-slate-650 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                          "{testimonial.content}"
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <Avatar className="w-10 h-10 border-2 border-slate-105 dark:border-slate-800">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-450 font-medium">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-28 px-4 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                Begin Your Language{' '}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">Mastery</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                Join 50K+ learners worldwide on their journey to fluency with our premium courses taught by certified instructors.
              </p>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <Button 
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/CourseCatalog');
                    } else {
                      openPortal();
                    }
                  }} 
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-10 shadow-md shadow-violet-600/20 hover:shadow-lg transition-all rounded-xl h-11 font-bold"
                >
                  Browse All Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={openPortal} 
                  variant="outline" 
                  className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm px-10 font-bold rounded-xl transition-all h-11"
                >
                  Start Free Today
                </Button>
              </motion.div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-10 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
              <div>
                <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 mb-6 group">
                  <img src="/logo.png" alt="Global Tongue logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/25" />
                  <span className="font-bold text-xl tracking-tight">Global Tongue</span>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  Empowering learners worldwide to achieve complete language fluency through expert guidance and personalized instruction.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-4">Courses</h4>
                <ul className="space-y-2.5 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-violet-400 transition-colors">English</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Spanish</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">French</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">German</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-4">Company</h4>
                <ul className="space-y-2.5 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-violet-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm tracking-wider uppercase text-slate-300 mb-4">Legal</h4>
                <ul className="space-y-2.5 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-violet-400 transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
              <p>&copy; 2026 Global Tongue. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Reusable Auth Portal Modal Popup */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-2xl border border-slate-800/80 bg-slate-950 text-white rounded-2xl shadow-2xl p-7 overflow-hidden relative">
            {/* Background glowing orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            {authStep === 'role' ? (
              <div className="space-y-6 relative z-10">
                <DialogHeader className="text-center md:text-left">
                  <DialogTitle className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start gap-2.5">
                    <img src="/logo.png" alt="Global Tongue logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
                    <span>Global Tongue Portal</span>
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm font-medium pt-1">
                    Select your gateway role to enter the platform
                  </DialogDescription>
                </DialogHeader>

                <style>{`
                  @keyframes book-page-flap {
                    0%, 100% { transform: scaleX(1); }
                    50% { transform: scaleX(0.7) skewY(-2deg); }
                  }
                  @keyframes cap-toss {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-4px) rotate(-8deg); }
                  }
                  .animate-book-flap {
                    transform-origin: center;
                  }
                  .group:hover .animate-book-flap {
                    animation: book-page-flap 0.6s ease-in-out infinite;
                  }
                  .animate-cap-toss {
                    transform-origin: center;
                  }
                  .group:hover .animate-cap-toss {
                    animation: cap-toss 0.7s ease-in-out infinite;
                  }
                `}</style>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Student Option */}
                  <div
                    onClick={() => handleRoleSelect({ id: 'student', title: 'Student Learner', color: 'from-emerald-500 to-teal-600', icon: BookOpen, iconColor: 'text-emerald-400' })}
                    className="border border-slate-800 bg-slate-900/20 hover:bg-slate-900/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 rounded-2xl p-6 cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                        <BookOpen className="w-6 h-6 animate-book-flap" />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">Student Learner</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">Access core study curricula, interactive practice decks, level completions, and native group reviews.</p>
                      </div>
                    </div>
                    <div className="mt-6 py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <span>Join Classroom</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Instructor Option */}
                  <div
                    onClick={() => handleRoleSelect({ id: 'instructor', title: 'Instructor Partner', color: 'from-violet-600 to-purple-600', icon: GraduationCap, iconColor: 'text-violet-400' })}
                    className="border border-slate-800 bg-slate-900/20 hover:bg-slate-900/50 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 rounded-2xl p-6 cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
                        <GraduationCap className="w-6 h-6 animate-cap-toss" />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <h4 className="font-bold text-white text-base group-hover:text-violet-400 transition-colors">Instructor Partner</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">Publish course levels, build custom curricula, manage live native class sessions, and track analytics.</p>
                      </div>
                    </div>
                    <div className="mt-6 py-2.5 px-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <span>Access Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <DialogHeader className="pb-2">
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    {selectedRole && (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {React.createElement(selectedRole.icon, { className: `w-4.5 h-4.5 ${selectedRole.iconColor}` })}
                        </div>
                        <span className="text-slate-850 dark:text-white">Login as {selectedRole.title}</span>
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-405 text-xs">
                    {otpSent
                      ? 'Verify by entering the code sent to your email.'
                      : 'Enter email to receive your passwordless one-time pass code.'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white rounded-xl focus-visible:ring-violet-500 focus-visible:border-violet-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        disabled={authLoading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-violet-600/10"
                      >
                        {authLoading ? 'Sending OTP...' : 'Send OTP'}
                      </Button>

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-900">
                          <span className="px-3 text-slate-400 dark:text-slate-500">Or Continue With</span>
                        </div>
                      </div>

                      <div className="flex justify-center w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                          theme={theme === 'dark' ? 'dark' : 'outline'}
                          size="large"
                          width="350px"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => setAuthStep('role')}
                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white"
                      >
                        Change Role
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter Verification Code</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                            className="pl-11 h-11 bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center text-xl tracking-[0.4em] font-mono font-bold text-slate-900 dark:text-white rounded-xl focus-visible:ring-violet-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                          />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Sent to: <span className="text-slate-650 dark:text-slate-400">{email}</span>
                        </p>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <Button
                          variant="outline"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 rounded-xl h-11 border-slate-200 dark:border-slate-800 font-bold"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleVerifyOTP}
                          disabled={authLoading}
                          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-violet-600/10"
                        >
                          {authLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleSendOTP}
                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white"
                        disabled={authLoading}
                      >
                        Resend Code
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
}