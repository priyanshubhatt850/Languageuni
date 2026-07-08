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
import { motion } from 'framer-motion';
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
  Brain,
  Target,
  ChevronDown,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

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
  const { isAuthenticated, user, authError, navigateToLogin } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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
                className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-xl"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {isAuthenticated ? (
                <Link to={createPageUrl(
                  user?.role === 'admin' ? 'AdminDashboard' :
                    user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                )}>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/30 transition-all font-semibold">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/30 transition-all rounded-xl font-semibold"
                  onClick={() => navigate('/RoleSelection')}
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
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/20 to-purple-400/10 dark:from-violet-600/10 dark:to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/15 to-violet-400/10 dark:from-blue-600/5 dark:to-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-purple-300/10 to-pink-300/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 inline-flex bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full hover:bg-violet-200/70 dark:hover:bg-violet-900/40 transition-all">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-violet-500 dark:text-violet-400" />
                <span className="font-semibold text-xs tracking-wide">Trusted by 50K+ learners worldwide</span>
              </Badge>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Master Languages
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">
                With Confidence
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light px-4">
              Learn from world-class instructors with immersive live classes, interactive sessions, and personalized guidance
            </p>

            {/* Search and Filter Section */}
            <div className="max-w-3xl mx-auto mt-10 mb-8 px-2 sm:px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/20 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-violet-100/40 dark:hover:shadow-black/30 transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative group/search w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover/search:text-violet-500 transition-colors" />
                        <Input
                          placeholder="Search courses, languages..."
                          className="pl-11 h-12 text-sm w-full bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-violet-500 focus-visible:border-violet-400 transition-all rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <div className="relative w-full sm:w-[180px]">
                          <select className="h-12 w-full pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none">
                            <option value="">All Languages</option>
                            {languagesToShow.map(lang => (
                              <option key={lang.id} value={lang.name}>{lang.flag} {lang.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <Link to={isAuthenticated ? `/CourseCatalog` : `/RoleSelection`} className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto h-12 bg-violet-600 hover:bg-violet-700 text-white px-6 shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all rounded-xl font-semibold text-sm">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center px-4"
            >
              <Link to={createPageUrl('CourseCatalog')} className="w-full sm:w-auto">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white text-base px-8 w-full sm:w-auto shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/40 hover:scale-[1.02] transition-all duration-300 font-semibold rounded-xl h-12">
                  Explore Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all w-full sm:w-auto font-semibold h-12">
                <Play className="w-4 h-4 mr-2" />
                See Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="w-11 h-11 border-[3px] border-white dark:border-slate-950 shadow-md ring-0">
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
          </motion.div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 relative transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/50 dark:bg-violet-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 px-4"
          >
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
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
                key={lang.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="h-full"
              >
                <Link to={isAuthenticated ? `/LanguageDetail?id=${lang._id}` : `/RoleSelection`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="h-full"
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-950/20 transition-all duration-300 cursor-pointer group rounded-2xl h-full">
                      <CardContent className="p-5 text-center flex flex-col items-center justify-center h-full space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-violet-50 dark:group-hover:bg-violet-950/30 flex items-center justify-center transition-all duration-300 border border-slate-200 dark:border-slate-700 group-hover:border-violet-200 dark:group-hover:border-violet-800 shrink-0">
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
                </Link>
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
              <Badge className="mb-3 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1 rounded-full">
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
            <Link to={isAuthenticated ? `/CourseCatalog` : `/RoleSelection`} className="shrink-0">
              <Button variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800 rounded-xl font-semibold transition-all">
                View All Courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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

          <div className="text-center mt-10 md:hidden">
            <Link to={createPageUrl('CourseCatalog')} className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800">
                View All Courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5 mr-2 text-violet-500" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Everything for Your Success
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-light">
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
                <motion.div whileHover={{ y: -6 }} className="h-full">
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
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 relative z-10">
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
            <Badge className="mb-4 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 px-4 py-1.5 rounded-full">
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
                      <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                        "{testimonial.content}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                      <Avatar className="w-10 h-10 border-2 border-slate-100 dark:border-slate-800">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{testimonial.role}</p>
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
              <Link to={createPageUrl('CourseCatalog')} className="w-full sm:w-auto">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white text-base px-10 shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/40 hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto font-bold rounded-xl h-13">
                  Browse All Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('RoleSelection')} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-base px-10 w-full sm:w-auto font-bold rounded-xl transition-all h-13">
                  Start Free Today
                </Button>
              </Link>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
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
    </div>
  );
}