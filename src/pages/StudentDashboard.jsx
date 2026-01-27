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
    queryKey: ['my-enrollments', user?.id],
    queryFn: () => WWClient.entities.Enrollment.filter({ user_id: user?.id }),
    enabled: !!user?.id,
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
    queryKey: ['my-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      const points = await WWClient.entities.UserPoints.filter({ user_id: user?.id });
      return points[0];
    },
    enabled: !!user?.id
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: () => WWClient.entities.UserBadge.filter({ user_id: user?.id }),
    enabled: !!user?.id,
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

  const currentUserRank = leaderboardData.findIndex(u => u.user_id === user?.id) + 1;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950">
      <Sidebar userRole="student" currentPage="StudentDashboard" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Keep up the great work on your language learning journey
            </p>
          </motion.div>

          {/* Gamification Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <PointsCard userPoints={userPoints} rank={currentUserRank} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <BadgesSection userBadges={userBadges} allBadges={allBadges.slice(0, 10)} />
            </motion.div>
          </div>

          {/* Quick Access to Live Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Link to={createPageUrl('StudentLiveSessions')}>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Video className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Join Live Sessions</h3>
                      <p className="text-emerald-100">Access all your scheduled live classes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-8 h-8" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled Courses</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{enrollments.length}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeEnrollments.length}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{completedEnrollments.length}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Certificates</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{completedEnrollments.filter(e => e.certificate_issued).length}</p>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Continue Learning */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Continue Learning</CardTitle>
                  <Link to={createPageUrl('MyLearning')}>
                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
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
                    <div className="space-y-4">
                      {activeEnrollments.slice(0, 3).map((enrollment, index) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link to={createPageUrl(`CoursePlayer?enrollmentId=${enrollment.id}`)}>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                  src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop`}
                                  alt={enrollment.course_title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">
                                  {enrollment.course_title}
                                </h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Progress value={enrollment.progress_percentage || 0} className="flex-1 h-2" />
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
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

              {/* Upcoming Classes */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Upcoming Live Classes</CardTitle>
                  <Link to={createPageUrl('StudentSchedule')}>
                    <Button variant="ghost" size="sm">
                      View Calendar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const upcomingLessons = allLessons
                      .filter(l => l.type === 'live' && l.live_class_link && l.live_class_date)
                      .filter(l => new Date(l.live_class_date) > new Date())
                      .sort((a, b) => new Date(a.live_class_date) - new Date(b.live_class_date))
                      .slice(0, 3);

                    if (upcomingLessons.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No upcoming classes scheduled</p>
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
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    {enrollment?.course_title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CalendarDays className="w-3 h-3" />
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
                                >
                                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Join
                                  </Button>
                                </a>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <Leaderboard 
                topUsers={leaderboardData} 
                currentUser={user}
                currentUserRank={currentUserRank > 10 ? currentUserRank : null}
              />

              {/* Overall Progress */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ProgressRing progress={totalProgress} size={140} />
                  <p className="mt-4 text-slate-600 dark:text-slate-400 text-center">
                    {totalProgress > 0 
                      ? `Great progress! Keep it up!`
                      : `Start learning to see your progress`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Flame className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-orange-100">Learning Streak</p>
                      <p className="text-3xl font-bold">0 Days</p>
                    </div>
                  </div>
                  <p className="mt-4 text-orange-100 text-sm">
                    Complete a lesson today to start your streak!
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={createPageUrl('CourseCatalog')}>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                  <Link to={createPageUrl('MyCertificates')}>
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="w-4 h-4 mr-2" />
                      My Certificates
                    </Button>
                  </Link>
                  <Link to={createPageUrl('StudentLiveSessions')}>
                    <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100">
                      <Video className="w-4 h-4 mr-2 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">Live Sessions</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Messages')}>
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="w-4 h-4 mr-2" />
                      Messages
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