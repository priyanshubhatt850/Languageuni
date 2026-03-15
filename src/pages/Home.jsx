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
  TrendingUp
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
    description: 'Learn from certified native speakers with years of teaching experience'
  },
  {
    icon: Play,
    title: 'Live & Recorded Classes',
    description: 'Join interactive live sessions or learn at your own pace with recordings'
  },
  {
    icon: Award,
    title: 'Certified Learning',
    description: 'Earn recognized certificates upon course completion'
  },
  {
    icon: MessageCircle,
    title: '1-on-1 Support',
    description: 'Get personalized feedback and guidance from instructors'
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'LinguaLearn transformed my Spanish skills. The live classes are incredibly engaging!',
    rating: 5
  },
  {
    name: 'Michael Torres',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'Finally found a platform that makes learning Japanese fun and effective.',
    rating: 5
  },
  {
    name: 'Emma Wilson',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: 'The structured curriculum and mock tests helped me ace my French exam!',
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
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();

  const { isAuthenticated, user, authError, navigateToLogin } = useAuth();


  const navigate = useNavigate()
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const authenticated = await WWClient.auth.isAuthenticated();
  //     setIsAuthenticated(authenticated);
  //     // if (authenticated) {
  //     //   const userData = await WWClient.auth.me();
  //     //   setUser(userData);
  //     // }
  //   };
  //   checkAuth();
  // }, []);

  const { data: languages = [] } = useQuery({
    queryKey: ['active-languages'],
    queryFn: async () => {
      const allLanguages = await WWClient.entities.Language.filter({ is_active: true }, 'display_order');
      // Remove duplicates based on language code
      // const uniqueLanguages = allLanguages.filter((lang, index, self) =>
      //   index === self.findIndex(l => l.code === lang.code)
      // );
      return allLanguages.filter(lang => lang.instructor_count > 0);
    },
    initialData: []
  });
  const languagesToShow = isAuthenticated ? languages : dummyLanguages;
  console.log('languagesToShow', languagesToShow);
  const { data: a1Levels = [] } = useQuery({
    queryKey: ['a1-levels'],
    queryFn: async () => {
      const levels = await WWClient.entities.CourseLevel.filter({ status: 'published' }, '-enrolled_count', 12);
      return levels.slice(0, 6);
    },
    initialData: []
  });
  const coursetoshow = isAuthenticated ? a1Levels : dummyCourses
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">Global Tongue</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('CourseCatalog')} className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                Courses
              </Link>
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                Features
              </a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                Reviews
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {isAuthenticated ? (
                <Link to={createPageUrl(
                  user?.role === 'admin' ? 'AdminDashboard' :
                    user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                )}>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  {/* <Button variant="ghost" onClick={() => navigate('/RoleSelection')} className="hidden sm:inline-flex">
                    Log In
                  </Button> */}
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                    onClick={() => navigate('/RoleSelection')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-32 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        </div>
        <div className="absolute top-32 right-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/15 to-purple-600/15 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 inline-flex bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/50 backdrop-blur-xl px-4 py-2 rounded-full hover:from-purple-500/40 hover:to-pink-500/40 transition-all">
                <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                <span className="font-semibold">Trusted by 50K+ learners worldwide</span>
              </Badge>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight mb-4 px-2">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Master Languages
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                With Confidence
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
              Learn from world-class instructors with immersive live classes and personalized guidance
            </p>

            {/* Search and Filter Section */}
            <div className="max-w-5xl mx-auto mb-12 px-0 sm:px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <Card className="border border-purple-500/20 shadow-2xl shadow-purple-500/20 bg-slate-900/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 mx-2 sm:mx-0">
                  <CardContent className="p-4 sm:p-8">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex-1 relative group/search w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/search:text-cyan-400 transition-colors" />
                        <Input
                          placeholder="Search courses, languages..."
                          className="pl-12 h-12 sm:h-14 text-sm sm:text-base w-full bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-cyan-500 focus-visible:border-cyan-400 transition-all rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-center">
                        <select className="h-12 sm:h-14 px-4 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all backdrop-blur-sm w-full sm:w-[200px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat pr-10">
                          <option value="">All Languages</option>
                          {languages.map(lang => (
                            <option key={lang.id} value={lang.name}>{lang.flag} {lang.name}</option>
                          ))}
                        </select>
                        <Link to={isAuthenticated ? `/CourseCatalog` : `/RoleSelection`}  className="w-full sm:w-auto">
                          <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-6 sm:px-8 shadow-lg hover:shadow-cyan-500/50 transition-all whitespace-nowrap">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link to={createPageUrl('CourseCatalog')}>
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 w-full sm:w-auto shadow-xl shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300 font-semibold rounded-xl">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" className="text-lg px-8 border-2 border-cyan-400/50 bg-transparent text-white hover:bg-cyan-500/10 backdrop-blur-sm rounded-xl hover:border-cyan-400 transition-all">
                <Play className="w-5 h-5 mr-2" />
                See Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="w-12 h-12 border-3 border-slate-950 shadow-lg">
                    <AvatarImage src={`https://i.pravatar.cc/120?img=${i + 10}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 text-yellow-400 justify-center sm:justify-start mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 font-semibold">
                  <span className="text-cyan-400">4.9/5</span> from 50K+ reviews
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/5 dark:from-purple-600/10 to-pink-600/5 dark:to-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/5 dark:from-blue-600/10 to-cyan-600/5 dark:to-cyan-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 px-4"
          >
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 dark:from-cyan-500/30 dark:to-blue-500/30 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50 px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Learn Any Language
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4 leading-tight">
              Choose from 20+ Languages
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Explore world-class courses taught by native speakers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
            {languagesToShow.map((lang, index) => (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="h-full"
              >
                <Link  to={isAuthenticated ? `/LanguageDetail?id=${lang._id}` : `/RoleSelection`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="h-full"
                  >
                    <Card className="border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-400/40 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-purple-200 dark:hover:shadow-purple-500/20 shadow-md dark:shadow-lg transition-all duration-300 cursor-pointer group rounded-2xl h-full">
                      <CardContent className="p-4 sm:p-6 text-center relative flex flex-col items-center justify-center h-full space-y-2 sm:space-y-4">
                        <div
                          className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 dark:from-purple-600/40 to-pink-500/20 dark:to-pink-600/40 flex items-center justify-center group-hover:from-cyan-500/30 dark:group-hover:from-cyan-600/50 group-hover:to-blue-500/30 dark:group-hover:to-blue-600/50 transition-all duration-300 border border-purple-200 dark:border-purple-500/30 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50 shrink-0"
                        >
                          <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">{lang.flag}</span>
                        </div>
                        <div className="min-h-10 sm:min-h-14">
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-cyan-300 transition-colors text-sm sm:text-base leading-snug">
                            {lang.name}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
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
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Featured Courses
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Most popular courses chosen by our learners
              </p>
            </div>
            <Link to={isAuthenticated ? `/CourseCatalog` : `/RoleSelection`}>
              <Button variant="outline" className="hidden md:flex">
                View All Courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coursetoshow.length > 0 ? (
              coursetoshow.map((level, index) => {
                const allLanguages = [...languages];
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
              // Placeholder cards
              [1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-sm bg-white dark:bg-slate-800">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-700 animate-pulse" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to={createPageUrl('CourseCatalog')}>
              <Button variant="outline">
                View All Courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-600/5 dark:from-blue-600/15 to-cyan-600/5 dark:to-cyan-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-purple-600/5 dark:from-purple-600/15 to-pink-600/5 dark:to-pink-600/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 dark:from-blue-500/30 to-cyan-500/20 dark:to-cyan-500/30 text-blue-600 dark:text-blue-300 border border-blue-500/30 dark:border-blue-500/50">
              <Zap className="w-4 h-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 dark:from-white to-slate-600 dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Everything for Your Success
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Comprehensive learning platform with all the tools you need to achieve fluency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="border border-blue-200 dark:border-blue-500/20 bg-gradient-to-br from-white dark:from-slate-900 to-slate-50 dark:to-slate-800 hover:from-blue-50 dark:hover:from-blue-900/30 hover:to-slate-50 dark:hover:to-slate-800 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 h-full rounded-xl group overflow-hidden">
                    <CardContent className="p-8 relative">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 dark:from-blue-600/40 to-cyan-600/30 dark:to-cyan-600/40 flex items-center justify-center mb-6 group-hover:from-cyan-600/40 dark:group-hover:from-cyan-600/50 group-hover:to-blue-600/40 dark:group-hover:to-blue-600/50 transition-all border border-blue-300 dark:border-blue-500/30"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                      >
                        <feature.icon className="w-8 h-8 text-blue-600 dark:text-cyan-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors leading-relaxed">
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
      <section className="py-24 px-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-100 dark:from-cyan-600 dark:via-blue-600 dark:to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-block mb-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-white/20 flex items-center justify-center group-hover:bg-white/30 dark:group-hover:bg-white/30 transition-all">
                      <Icon className="w-8 h-8 text-slate-900 dark:text-white" />
                    </div>
                  </motion.div>
                  <p className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</p>
                  <p className="text-slate-700 dark:text-white/80 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Learners Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 h-full bg-white dark:bg-slate-900 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
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
      <section className="py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-600/5 dark:from-cyan-600/20 to-blue-600/5 dark:to-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-600/5 dark:from-purple-600/20 to-pink-600/5 dark:to-pink-600/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 dark:from-cyan-400 via-slate-700 dark:via-blue-400 to-slate-800 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                Begin Your Language Mastery
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 50K+ learners worldwide on their journey to fluency with our premium courses taught by certified instructors
              </p>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={createPageUrl('CourseCatalog')}>
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-10 shadow-2xl shadow-cyan-500/40 hover:shadow-3xl hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300 w-full sm:w-auto font-bold rounded-xl">
                  Browse All Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('RoleSelection')}>
                <Button size="lg" className="border-2 border-cyan-400/50 bg-transparent text-cyan-300 hover:bg-cyan-500/10 backdrop-blur-sm text-lg px-10 w-full sm:w-auto font-semibold rounded-xl hover:border-cyan-400 transition-all">
                  Start Free Today
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-12">
            <div>
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-xl">Global Tongue</span>
              </Link>
              <p className="text-slate-400 mb-6">
                Empowering learners worldwide to achieve language fluency through expert instruction.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">English</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Spanish</a></li>
                <li><a href="#" className="hover:text-white transition-colors">French</a></li>
                <li><a href="#" className="hover:text-white transition-colors">German</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>© 2026 Global Tongue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}