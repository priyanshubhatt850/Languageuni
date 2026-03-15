import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/components/ui/ThemeProvider';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Clock,
  Star,
  CheckCircle,
  Trophy,
  Target,
  Moon,
  Sun,
  BookOpen,
  Award
} from 'lucide-react';

export default function LanguageDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const languageId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const loadUser = async () => {
      const authenticated = await WWClient.auth.isAuthenticated();
      if (authenticated) {
        const userData = await WWClient.auth.me();
        setUser(userData);
      }
    };
    loadUser();
  }, []);

  const { data: language } = useQuery({
    queryKey: ['language', languageId],
    queryFn: async () => {
      const langs = await WWClient.entities.Language.filter({ id: languageId });
      return langs[0];
    },
    enabled: !!languageId
  });

  const { data: levels = [] } = useQuery({
    queryKey: ['course-levels', languageId],
    queryFn: () => WWClient.entities.CourseLevel.filter({ language_id: languageId, status: 'published' }, 'display_order'),
    enabled: !!languageId,
    initialData: []
  });

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const standardLevels = levels.filter(l => l.level_type === 'standard');
  const examLevels = levels.filter(l => l.level_type === 'exam');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">Global Tongue</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-slate-400"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {user && (
                <Link to={createPageUrl(
                  user?.role === 'admin' ? 'AdminDashboard' :
                  user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                )}>
                  <Button className="bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact & Elegant */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Flag & Title Inline */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <span className="text-7xl sm:text-8xl block drop-shadow-lg">{language.flag}</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-left sm:text-left"
              >
                <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-2">
                  {language.name}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Learn from experts worldwide
                </p>
              </motion.div>
            </div>

            {/* Stats Row - Compact */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-8 pt-4"
            >
              {[
                { value: levels.length, label: 'Levels' },
                { value: language.instructor_count || 0, label: 'Instructors' },
                { value: language.learner_count || 0, label: 'Students' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CEFR Course Levels */}
      {standardLevels.length > 0 ? (
        <section className="py-24 px-4 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring" }}
                className="inline-block mb-6"
              >
                <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-4 py-2">
                  ✨ Structured Learning
                </Badge>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Progression Levels
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                From A1 beginner to C2 mastery—carefully structured progression following international standards
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {standardLevels.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                  whileHover={{ y: -12 }}
                  className="group"
                >
                  <Link to={createPageUrl(`LevelDetail?id=${level.id}`)}>
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
                      {/* Image */}
                      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                        {level.thumbnail_url ? (
                          <img
                            src={level.thumbnail_url}
                            alt={level.level_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
                            <span className="text-5xl filter drop-shadow-lg">{language.flag}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardContent className="p-7 space-y-5">
                        {/* Level Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 font-semibold">
                            {level.level_name}
                          </Badge>
                          {level.enrolled_count > 0 && (
                            <motion.span 
                              initial={{ scale: 0.8, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                            >
                              {level.enrolled_count}+ enrolled
                            </motion.span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {level.description || 'Comprehensive course with expert instruction and interactive learning'}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{level.duration_hours}h</span>
                          </motion.div>
                          {level.rating > 0 && (
                            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{level.rating.toFixed(1)}</span>
                            </motion.div>
                          )}
                        </div>

                        {/* CTA Section */}
                        <div className="flex items-center justify-between pt-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              ${level.discount_price || level.price}
                            </div>
                            {level.discount_price && (
                              <p className="text-xs text-slate-400 line-through">${level.price}</p>
                            )}
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg px-6">
                              Explore
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 overflow-hidden">
                <CardContent className="p-12">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="inline-block mb-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Courses Launching Soon! 🚀
                  </motion.h3>
                  
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                    We're preparing amazing {language.name} courses for you. Stay tuned for comprehensive lessons, expert instructors, and interactive learning materials.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
                    >
                      <Trophy className="w-8 h-8 text-violet-600 mb-2" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Expert Instructors</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
                    >
                      <Target className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">CEFR Aligned</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
                    >
                      <Award className="w-8 h-8 text-pink-600 mb-2" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Certificates</span>
                    </motion.div>
                  </div>

                  <Link to={createPageUrl('Home')}>
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl">
                      Explore Other Languages
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Exam Preparation Levels - Enhanced */}
      {examLevels.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-950">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Award className="w-3 h-3 mr-1" />
                Test Preparation
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Exam Preparation Courses
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Ace your language proficiency tests with our specialized exam preparation courses
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {examLevels.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Link to={createPageUrl(`LevelDetail?id=${level.id}`)}>
                    <Card className="border-0 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden group cursor-pointer h-full bg-white dark:bg-slate-900">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-8">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className="bg-purple-600 text-white px-3 py-1">
                            Exam Prep
                          </Badge>
                          <Award className="w-12 h-12 text-purple-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                          {level.level_name}
                        </h3>
                      </div>

                      <CardContent className="p-6">
                        <p className="text-slate-600 dark:text-slate-300 mb-6 text-base">
                          {level.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{level.duration_hours || 0} hours</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{level.enrolled_count || 0} enrolled</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            ${level.price}
                          </div>
                          <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                            Prepare Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of learners mastering {language.name} with our expert-led courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {standardLevels.length > 0 && (
                <Link to={createPageUrl(`LevelDetail?id=${standardLevels[0].id}`)}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 shadow-2xl w-full sm:w-auto">
                    Start with {standardLevels[0].level_name}
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl('Home')}>
                <Button size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 text-lg px-8 w-full sm:w-auto">
                  Explore More Languages
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}