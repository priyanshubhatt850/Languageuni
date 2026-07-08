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
  Calendar,
  BarChart3,
  RefreshCw,
  X,
  Upload,
  User
} from 'lucide-react';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
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



export default function Home() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, authError, checkUserAuth } = useAuth();
  const navigate = useNavigate();

  // Auth Popup Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('role'); // 'role' | 'otp' | 'student-onboarding'
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Student Onboarding States
  const [onboardingSubStep, setOnboardingSubStep] = useState(1); // 1 | 2 | 3
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [interests, setInterests] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const languagesList = [
    { name: "English", flag: "🇬🇧" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Portuguese", flag: "🇵🇹" },
    { name: "Mandarin", flag: "🇨🇳" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Arabic", flag: "🇸🇦" }
  ];

  const interestOptions = ['Business', 'Travel', 'Conversation', 'Grammar', 'Exam Prep', 'Culture'];

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadImageToCloudinary(file, {
        folder: 'language-uni/student-avatars',
        tags: ['student', 'avatar']
      });
      setAvatarUrl(response.file_url);
      toast.success('Profile picture uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language you want to learn');
      return;
    }
    setAuthLoading(true);
    try {
      await WWClient.auth.updateMe({
        onboarding_completed: true,
        profileCompleted: true,
        learning_languages: selectedLanguages,
        learning_interests: interests,
        avatar_url: avatarUrl
      });
      await checkUserAuth();
      toast.success('Welcome to Global Tongue!');
      setShowAuthModal(false);
      navigate('/StudentDashboard');
    } catch (error) {
      toast.error('Failed to save profile details. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && !user.profileCompleted && user.role === 'student') {
      setAuthStep('student-onboarding');
      setShowAuthModal(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleError = (event) => {
      const errorMsg = event.error ? event.error.stack : event.message;
      fetch(`http://localhost:3000/log-frontend-error?msg=${encodeURIComponent(errorMsg)}`).catch(() => {});
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      fetch(`http://localhost:3000/log-frontend-error?msg=${encodeURIComponent('Promise Rejection: ' + event.reason)}`).catch(() => {});
    });
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

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

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
          setShowAuthModal(false);
        } else if (role === 'student') {
          if (profileCompleted) {
            navigate('/StudentDashboard');
            setShowAuthModal(false);
          } else {
            setAuthStep('student-onboarding');
          }
        } else {
          navigate('/');
          setShowAuthModal(false);
        }
        toast.success('OTP verified!');
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

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
          setShowAuthModal(false);
        } else if (role === 'student') {
          if (profileCompleted) {
            navigate('/StudentDashboard');
            setShowAuthModal(false);
          } else {
            setAuthStep('student-onboarding');
          }
        } else {
          navigate('/');
          setShowAuthModal(false);
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
                  <Button
                    onClick={() => {
                      if (user?.role === 'student' && !user?.profileCompleted) {
                        setAuthStep('student-onboarding');
                        setOnboardingSubStep(1);
                        setShowAuthModal(true);
                      } else if (user?.role === 'instructor' && !user?.profileCompleted) {
                        navigate('/InstructorOnboarding');
                      } else {
                        navigate(
                          user?.role === 'admin' ? '/AdminDashboard' :
                            user?.role === 'instructor' ? '/InstructorDashboard' : '/StudentDashboard'
                        );
                      }
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all font-semibold h-10 px-5"
                  >
                    Dashboard
                  </Button>
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

              {/* Right Card Column (Premium Hero Illustration) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <img
                    src="/hero_illustration.png"
                    alt="Language Learning Illustration"
                    className="w-full max-w-[480px] object-contain rounded-3xl shadow-2xl shadow-violet-500/10 hover:shadow-violet-500/20 hover:scale-[1.02] transition-all duration-500 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                  />
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
                      onAuthRequired={openPortal}
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

        {/*        {/* Reusable Auth Portal Custom Modal Popup using Framer Motion */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAuthModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className={`${authStep === 'role' ? 'w-full max-w-3xl' : 'w-full max-w-lg'} border border-slate-100 bg-white rounded-[28px] shadow-2xl p-8 text-slate-800 relative overflow-hidden z-10`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute right-6 top-6 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {authStep === 'role' ? (
                  <div className="space-y-6 relative z-10">
                    {/* Floating illustrations */}
                    <svg className="absolute -left-6 -top-2 w-20 h-20 text-violet-100 pointer-events-none opacity-65" viewBox="0 0 100 100" fill="none">
                      <path d="M30 90 C 20 60, 40 30, 80 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path d="M40 70 Q 25 65, 30 55 Q 40 60, 40 70 Z" fill="currentColor" />
                      <path d="M50 50 Q 35 45, 40 35 Q 50 40, 50 50 Z" fill="currentColor" />
                      <path d="M65 30 Q 55 20, 60 10 Q 70 18, 65 30 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute -right-6 top-4 w-24 h-24 text-violet-100/70 pointer-events-none opacity-65" viewBox="0 0 100 100" fill="none">
                      <path d="M10 80 Q 40 40, 90 20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                      <path d="M90 20 L75 25 L80 15 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    <div className="flex flex-col items-center text-center space-y-2 mb-2">
                      <img src="/logo.png" alt="Global Tongue logo" className="w-12 h-12 object-contain rounded-xl shrink-0" />
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Tongue Portal</h3>
                      <p className="text-slate-500 text-sm font-medium">Select your path to continue</p>
                      <div className="w-12 h-1.5 bg-violet-500/80 rounded-full mt-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Instructor Option */}
                      <div
                        onClick={() => handleRoleSelect({ id: 'instructor', title: 'Instructor Partner', color: 'from-violet-600 to-purple-600', icon: GraduationCap, iconColor: 'text-violet-650' })}
                        className="border border-slate-100 hover:border-violet-200 bg-white hover:bg-slate-50/20 hover:shadow-xl transition-all duration-300 rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="space-y-4">
                          {/* Precise Vector Shelf Illustration */}
                          <div className="relative w-full h-32 flex flex-col items-center justify-end overflow-visible shrink-0 pb-1">
                            {/* Decorative sparks */}
                            <Sparkles className="absolute right-12 top-2 w-4.5 h-4.5 text-violet-300 opacity-60 rotate-12" />
                            <Sparkles className="absolute left-12 top-4 w-3.5 h-3.5 text-violet-300 opacity-40 -rotate-12" />
                            
                            <div className="relative w-48 h-20 flex items-end justify-center">
                              {/* Left Calendar widget */}
                              <div className="absolute left-4 bottom-0 w-11 h-11 bg-[#ece8ff] border border-violet-100 rounded-xl shadow-sm flex items-center justify-center text-violet-500 rotate-[-10deg] z-10 group-hover:rotate-[-6deg] group-hover:scale-105 transition-all duration-300">
                                <Calendar className="w-5.5 h-5.5" />
                              </div>

                              {/* Center Graduation Cap circle */}
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-violet-150 via-violet-100 to-violet-50 flex items-center justify-center border border-violet-200 shadow-md shadow-violet-500/5 z-20 group-hover:scale-[1.05] transition-transform duration-300">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                                  <GraduationCap className="w-9 h-9 text-violet-600" />
                                </div>
                              </div>

                              {/* Right Stats Chart widget */}
                              <div className="absolute right-4 bottom-0 w-11 h-11 bg-[#ece8ff] border border-violet-100 rounded-xl shadow-sm flex items-center justify-center text-violet-500 rotate-[10deg] z-10 group-hover:rotate-[6deg] group-hover:scale-105 transition-all duration-300">
                                <BarChart3 className="w-5.5 h-5.5" />
                              </div>
                            </div>

                            {/* The Wood Shelf */}
                            <div className="w-48 h-2 bg-gradient-to-r from-[#dec6ad] via-[#e6c39f] to-[#dec6ad] rounded-full shadow-sm mt-2.5 z-30" />
                          </div>
                          
                          <div className="space-y-1.5 text-center">
                            <h4 className="font-extrabold text-slate-800 text-base">Instructor Partner</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">Teach, publish learning levels, manage scheduled classes, and review earnings.</p>
                          </div>
                        </div>

                        <div className="flex justify-center gap-1.5 mt-4 mb-5">
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-200/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-200/60" />
                        </div>

                        <div className="py-2.5 px-4 rounded-xl border border-violet-200 text-violet-600 bg-white hover:bg-violet-50 hover:border-violet-300 transition-all duration-200 text-xs font-bold text-center flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                          <span>Continue as Instructor</span>
                        </div>
                      </div>

                      {/* Student Option */}
                      <div
                        onClick={() => handleRoleSelect({ id: 'student', title: 'Student Learner', color: 'from-emerald-500 to-teal-600', icon: BookOpen, iconColor: 'text-emerald-600' })}
                        className="border border-slate-105 hover:border-emerald-200 bg-white hover:bg-slate-50/20 hover:shadow-xl transition-all duration-300 rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="space-y-4">
                          {/* Precise Vector Shelf Illustration */}
                          <div className="relative w-full h-32 flex flex-col items-center justify-end overflow-visible shrink-0 pb-1">
                            {/* Decorative sparks */}
                            <Sparkles className="absolute right-12 top-2 w-4.5 h-4.5 text-emerald-300 opacity-60 rotate-12" />
                            <Sparkles className="absolute left-12 top-4 w-3.5 h-3.5 text-emerald-300 opacity-40 -rotate-12" />

                            <div className="relative w-48 h-20 flex items-end justify-center">
                              {/* Left Stacked Books widget */}
                              <div className="absolute left-3 bottom-0.5 flex flex-col items-center rotate-[-10deg] z-10 group-hover:rotate-[-6deg] group-hover:scale-105 transition-all duration-300">
                                <div className="w-9 h-2 bg-emerald-505 rounded-t-sm border border-emerald-600/20" />
                                <div className="w-10 h-2 bg-emerald-100 rounded-sm border border-emerald-200" />
                                <div className="w-11 h-3 bg-amber-100 rounded-b-sm border border-amber-200 shadow-sm" />
                              </div>

                              {/* Center Book Open circle */}
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-150 via-emerald-100 to-emerald-50 flex items-center justify-center border border-emerald-200 shadow-md shadow-emerald-500/5 z-20 group-hover:scale-[1.05] transition-transform duration-300">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                                  <BookOpen className="w-9 h-9 text-emerald-600" />
                                </div>
                              </div>

                              {/* Right Checklist widget */}
                              <div className="absolute right-4 bottom-0 w-11 h-11 bg-[#e4f8f0] border border-emerald-100 rounded-xl shadow-sm flex items-center justify-center text-emerald-600 rotate-[10deg] z-10 group-hover:rotate-[6deg] group-hover:scale-105 transition-all duration-300">
                                <Check className="w-5.5 h-5.5" />
                              </div>
                            </div>

                            {/* The Wood Shelf */}
                            <div className="w-48 h-2 bg-gradient-to-r from-[#dec6ad] via-[#e6c39f] to-[#dec6ad] rounded-full shadow-sm mt-2.5 z-30" />
                          </div>
                          
                          <div className="space-y-1.5 text-center">
                            <h4 className="font-extrabold text-slate-800 text-base">Student Learner</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">Access core curriculum materials, practice decks, and verify language completions.</p>
                          </div>
                        </div>

                        <div className="flex justify-center gap-1.5 mt-4 mb-5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-200/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-200/60" />
                        </div>

                        <div className="py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-650 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 text-xs font-bold text-center flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                          <span>Continue as Student</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer widgets */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-5 mt-4 border-t border-slate-100 gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-extrabold text-slate-800">Trusted Learning</p>
                          <p className="text-[10px] text-slate-450 font-normal">Safe & Secure</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-extrabold text-slate-800">Quality Education</p>
                          <p className="text-[10px] text-slate-450 font-normal">Expert Instructors</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-extrabold text-slate-800">Track Progress</p>
                          <p className="text-[10px] text-slate-450 font-normal">Achieve Goals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : authStep === 'student-onboarding' ? (
                  <div className="space-y-5 relative z-10 text-left">
                    {/* Header */}
                    <div className="flex items-center gap-3.5 pb-2.5 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">Complete Your Profile</h3>
                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${(onboardingSubStep / 3) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Step {onboardingSubStep} of 3</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Avatar Upload */}
                    {onboardingSubStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 py-2"
                      >
                        <div className="text-center space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-800">Add a Profile Photo</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Let other learners and instructors recognize you.</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative group">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                <User className="w-12 h-12" />
                              </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                              <Upload className="w-4 h-4 text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold mt-2">
                            {uploading ? 'Uploading avatar...' : 'Upload Profile Picture (Optional)'}
                          </p>
                        </div>
                        <Button
                          onClick={() => setOnboardingSubStep(2)}
                          disabled={uploading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-emerald-600/15"
                        >
                          Next Step →
                        </Button>
                      </motion.div>
                    )}

                    {/* Step 2: Target Languages */}
                    {onboardingSubStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 py-2"
                      >
                        <div className="text-center space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-800">What languages do you want to learn?</h4>
                          <p className="text-[11px] text-slate-505 font-medium">Select all that apply.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {languagesList.map(lang => {
                            const isSelected = selectedLanguages.includes(lang.name);
                            return (
                              <button
                                key={lang.name}
                                onClick={() => toggleLanguage(lang.name)}
                                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                <span className="text-sm">{lang.flag}</span>
                                <span>{lang.name}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setOnboardingSubStep(1)}
                            className="flex-1 rounded-xl h-11 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={() => {
                              if (selectedLanguages.length === 0) {
                                toast.error('Please select at least one language to continue');
                                return;
                              }
                              setOnboardingSubStep(3);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-emerald-600/15"
                          >
                            Next Step →
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Learning Interests */}
                    {onboardingSubStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 py-2"
                      >
                        <div className="text-center space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-800">What are you interested in?</h4>
                          <p className="text-[11px] text-slate-505 font-medium">We'll recommend content based on your interests.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {interestOptions.map(interest => {
                            const isSelected = interests.includes(interest);
                            return (
                              <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                <span>{interest}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setOnboardingSubStep(2)}
                            className="flex-1 rounded-xl h-11 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleCompleteOnboarding}
                            disabled={authLoading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-emerald-600/15"
                          >
                            {authLoading ? 'Completing...' : 'Complete Profile'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10 text-left">
                    {/* Floating illustrations */}
                    <svg className="absolute -left-6 top-20 w-20 h-20 text-slate-200 pointer-events-none opacity-50" viewBox="0 0 100 100" fill="none">
                      <path d="M10 80 Q 30 60, 80 40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                      <path d="M80 40 L68 45 L72 37 Z" fill="currentColor" />
                    </svg>

                    {/* Floating open book in top right corner */}
                    <div className={`absolute right-0 top-2 opacity-20 rotate-12 pointer-events-none ${
                      selectedRole?.id === 'student' ? 'text-emerald-500' : 'text-violet-500'
                    }`}>
                      <BookOpen className="w-16 h-16" />
                    </div>

                    <div className="flex items-start gap-4 pb-2">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        selectedRole?.id === 'student'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-violet-50 text-violet-600 border-violet-100'
                      }`}>
                        {React.createElement(selectedRole?.icon || BookOpen, { className: "w-7 h-7" })}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 leading-tight">
                          Login as{' '}
                          <span className={selectedRole?.id === 'student' ? 'text-emerald-600' : 'text-violet-600'}>
                            {selectedRole?.title}
                          </span>
                        </h3>
                        <p className="text-slate-505 text-xs">
                          {otpSent
                            ? 'Verify by entering the code sent to your email.'
                            : 'Enter email to receive your passwordless one-time pass code.'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-2">
                      {!otpSent ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
                            <div className="relative">
                              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${
                                selectedRole?.id === 'student' ? 'text-emerald-500' : 'text-violet-500'
                              }`} />
                              <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`pl-11 h-11 bg-slate-50 border-slate-205 text-sm text-slate-900 rounded-xl focus-visible:ring-2 ${
                                  selectedRole?.id === 'student'
                                    ? 'focus-visible:ring-emerald-500 focus-visible:border-emerald-500'
                                    : 'focus-visible:ring-violet-500 focus-visible:border-violet-500'
                                }`}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                              />
                            </div>
                          </div>

                          <Button
                            onClick={handleSendOTP}
                            disabled={authLoading}
                            className={`w-full text-white font-bold h-11 rounded-xl transition-all shadow-md ${
                              selectedRole?.id === 'student'
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/15'
                            }`}
                          >
                            {authLoading ? 'Sending OTP...' : 'Send OTP →'}
                          </Button>

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest bg-white">
                          <span className="px-3 text-slate-400">Or Continue With</span>
                        </div>
                      </div>

                      <div className="flex justify-center w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                          theme="outline"
                          size="large"
                          width="350px"
                        />
                      </div>

                          <Button
                            variant="ghost"
                            onClick={() => setAuthStep('role')}
                            className="w-full text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Change Role →</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter Verification Code</Label>
                            <div className="relative">
                              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${
                                selectedRole?.id === 'student' ? 'text-emerald-500' : 'text-violet-500'
                              }`} />
                              <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                                className={`pl-11 h-11 bg-slate-50 border-slate-200 text-center text-xl tracking-[0.4em] font-mono font-bold text-slate-900 rounded-xl focus-visible:ring-2 ${
                                  selectedRole?.id === 'student'
                                    ? 'focus-visible:ring-emerald-500 focus-visible:border-emerald-500'
                                    : 'focus-visible:ring-violet-500 focus-visible:border-violet-500'
                                }`}
                                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                              />
                            </div>
                            <p className="text-xs text-slate-550 font-medium">
                              Sent to: <span className="text-slate-700 font-semibold">{email}</span>
                            </p>
                          </div>

                          <div className="flex gap-3 pt-1">
                            <Button
                              variant="outline"
                              onClick={() => setOtpSent(false)}
                              className="flex-1 rounded-xl h-11 border-slate-200 text-slate-605 hover:bg-slate-50 font-bold"
                            >
                              Back
                            </Button>
                            <Button
                              onClick={handleVerifyOTP}
                              disabled={authLoading}
                              className={`flex-1 text-white font-bold h-11 rounded-xl transition-all shadow-md ${
                                selectedRole?.id === 'student'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/15'
                              }`}
                            >
                              {authLoading ? 'Verifying...' : 'Verify'}
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={handleSendOTP}
                            className={`w-full text-xs font-bold rounded-xl ${
                              selectedRole?.id === 'student'
                                ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'
                            }`}
                            disabled={authLoading}
                          >
                            Resend Code
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </GoogleOAuthProvider>
  );
}
