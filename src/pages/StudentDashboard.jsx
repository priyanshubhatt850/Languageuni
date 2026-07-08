import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import StatsCard from '@/components/common/StatsCard';
import ProgressRing from '@/components/common/ProgressRing';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import PointsCard from '@/components/gamification/PointsCard';
import BadgesSection from '@/components/gamification/BadgesSection';
import Leaderboard from '@/components/gamification/Leaderboard';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Calendar,
  ChevronRight,
  Star,
  Flame,
  CalendarDays,
  ExternalLink,
  Video
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      
      // Check if onboarding is completed
      if (!userData.onboarding_completed) {
        window.location.href = createPageUrl('StudentOnboarding');
        return;
      }
      
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?._id],
    queryFn: () => WWClient.entities.Enrollment.filter({ user_id: user?._id }),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons-for-live-classes'],
    queryFn: async () => {
      if (enrollments.length === 0) return [];
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];
      const lessonsPromises = courseIds.map(id => 
        WWClient.entities.Lesson.filter({ course_id: id })
      );
      const lessonsArrays = await Promise.all(lessonsPromises);
      return lessonsArrays.flat();
    },
    enabled: enrollments.length > 0,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?._id],
    queryFn: async () => {
      const points = await WWClient.entities.UserPoints.filter({ user_id: user?._id });
      return points[0];
    },
    enabled: !!user?.id
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', user?._id],
    queryFn: () => WWClient.entities.UserBadge.filter({ user_id: user?._id }),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => WWClient.entities.Badge.list(),
    initialData: []
  });

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allPoints = await WWClient.entities.UserPoints.list('-total_points', 10);
      const userIds = allPoints.map(p => p.user_id);
      const users = await Promise.all(
        userIds.map(id => WWClient.entities.User.filter({ id }).then(u => u[0]))
      );
      return allPoints.map((points, index) => ({
        ...points,
        full_name: users[index]?.full_name || 'Anonymous'
      }));
    },
    initialData: []
  });

  const currentUserRank = leaderboardData.findIndex(u => u.user_id === user?._id) + 1;

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const totalProgress = activeEnrollments.length > 0 
    ? Math.round(activeEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / activeEnrollments.length)
    : 0;

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar userRole="student" currentPage="StudentDashboard" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-8">
          {/* Welcome Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-405 text-sm mt-1 font-light">
                Ready to make progress on your language tracks today?
              </p>
            </div>
            <Link to={createPageUrl('CourseCatalog')}>
              <Button className="bg-violet-600 hover:bg-violet-755 text-white font-bold rounded-xl shadow-md shadow-violet-650/15">
                Explore New Courses
              </Button>
            </Link>
          </motion.div>

          {/* Gamification Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
            >
              <PointsCard userPoints={userPoints} rank={currentUserRank} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <BadgesSection userBadges={userBadges} allBadges={allBadges.slice(0, 10)} />
            </motion.div>
          </div>

          {/* Quick Access to Live Sessions Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link to={createPageUrl('StudentLiveSessions')}>
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-600/10 hover:shadow-xl hover:shadow-violet-600/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Active Live Sessions Hub</h3>
                      <p className="text-violet-100 text-xs mt-0.5 font-medium">Access scheduled native speaker Google Meet classes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stats Summary Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, bg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-405' },
              { label: 'In Progress', value: activeEnrollments.length, icon: Clock, bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-405' },
              { label: 'Completed Levels', value: completedEnrollments.length, icon: Award, bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450' },
              { label: 'Certificates Issued', value: completedEnrollments.filter(e => e.certificate_issued).length, icon: TrendingUp, bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-450' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning catalog & schedule */}
            <div className="lg:col-span-2 space-y-8">
              {/* Continue Learning card */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-lg font-bold text-slate-850 dark:text-white">Continue Learning</CardTitle>
                  <Link to={createPageUrl('MyLearning')}>
                    <Button variant="ghost" size="sm" className="text-violet-650 hover:text-violet-755 hover:bg-violet-50 dark:hover:bg-violet-950/30 font-bold rounded-lg text-xs">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  {activeEnrollments.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No courses yet"
                      description="Start your learning journey by enrolling in a course"
                      action
                      actionLabel="Browse Courses"
                      onAction={() => window.location.href = createPageUrl('CourseCatalog')}
                    />
                  ) : (
                    <div className="space-y-4.5">
                      {activeEnrollments.slice(0, 3).map((enrollment, index) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link to={createPageUrl(`CoursePlayer?enrollmentId=${enrollment.id}`)}>
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 hover:border-violet-100 dark:hover:border-violet-900/50 transition-all duration-200 group">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                                <img
                                  src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop`}
                                  alt={enrollment.course_title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-white fill-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 space-y-2">
                                <h4 className="font-bold text-slate-850 dark:text-white truncate group-hover:text-violet-650 transition-colors text-sm">
                                  {enrollment.course_title}
                                </h4>
                                <div className="flex items-center gap-4">
                                  <Progress value={enrollment.progress_percentage || 0} className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 [&>div]:bg-violet-650" />
                                  <span className="text-xs font-bold text-slate-500 w-8">
                                    {enrollment.progress_percentage || 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Live Classes Card */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-lg font-bold text-slate-850 dark:text-white">Upcoming Classes</CardTitle>
                  <Link to={createPageUrl('StudentSchedule')}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold">
                      Calendar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    const upcomingLessons = allLessons
                      .filter(l => l.type === 'live' && l.live_class_link && l.live_class_date)
                      .filter(l => new Date(l.live_class_date) > new Date())
                      .sort((a, b) => new Date(a.live_class_date) - new Date(b.live_class_date))
                      .slice(0, 3);

                    if (upcomingLessons.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-2">
                          <Calendar className="w-10 h-10 mx-auto opacity-40" />
                          <p className="text-sm font-medium">No live classes scheduled</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {upcomingLessons.map((lesson, index) => {
                          const enrollment = enrollments.find(e => e.course_id === lesson.course_id);
                          return (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 bg-violet-50/50 dark:bg-violet-950/15 border border-violet-100/50 dark:border-violet-900/50 rounded-xl flex items-center justify-between gap-4"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                  {enrollment?.course_title}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider text-[10px]">
                                  <CalendarDays className="w-3.5 h-3.5 text-violet-500" />
                                  <span>
                                    {new Date(lesson.live_class_date).toLocaleString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              </div>
                              <a 
                                href={lesson.live_class_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="shrink-0"
                              >
                                <Button size="sm" className="bg-violet-600 hover:bg-violet-755 text-white font-bold rounded-lg shadow-sm h-9 px-3">
                                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                  Join
                                </Button>
                              </a>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar Widgets */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <Leaderboard 
                topUsers={leaderboardData} 
                currentUser={user}
                currentUserRank={currentUserRank > 10 ? currentUserRank : null}
              />

              {/* Progress Ring Widget */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="pb-2 border-b border-slate-105 dark:border-slate-800/40">
                  <CardTitle className="text-sm font-bold text-slate-850 dark:text-white">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <ProgressRing progress={totalProgress} size={140} strokeWidth={10} />
                  <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                    {totalProgress > 0 
                      ? `You are doing great! Complete more exercises to push higher.`
                      : `Get started by launching a learning lesson module.`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Glowing Streak Card */}
              <Card className="border border-orange-550/20 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/15 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-orange-105 text-xs font-bold uppercase tracking-wider">Active Streak</p>
                      <p className="text-3xl font-black tracking-tight">0 Days</p>
                    </div>
                  </div>
                  <p className="mt-4 text-orange-100 text-xs font-medium leading-relaxed">
                    Finish any course lecture or practice question deck today to establish your daily learning streak!
                  </p>
                </CardContent>
              </Card>

              {/* Simple Quick Actions */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="pb-2 border-b border-slate-105 dark:border-slate-800/40">
                  <CardTitle className="text-sm font-bold text-slate-850 dark:text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Link to={createPageUrl('CourseCatalog')}>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                      <BookOpen className="w-4 h-4 mr-2.5 text-slate-500" />
                      Browse Catalog
                    </Button>
                  </Link>
                  <Link to={createPageUrl('MyCertificates')}>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Award className="w-4 h-4 mr-2.5 text-slate-500" />
                      My Certificates
                    </Button>
                  </Link>
                  <Link to={createPageUrl('StudentLiveSessions')}>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <Video className="w-4 h-4 mr-2.5" />
                      Launch Live Class
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}