import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import StatsCard from '@/components/common/StatsCard';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Plus,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 1500 },
  { month: 'Apr', revenue: 2200 },
  { month: 'May', revenue: 2800 },
  { month: 'Jun', revenue: 2400 },
];

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const res = await WWClient.auth.getme();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        const userData = await WWClient.auth.me();
        setUser(userData);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: aggregateRes, isLoading: isAggLoading } = useQuery({
    queryKey: ['instructor-dashboard-aggregate', user?._id || user?.id],
    queryFn: () => WWClient.custom.get(`/aggregate/instructor-dashboard/${user?._id || user?.id}`),
    enabled: !!(user?._id || user?.id),
  });

  const aggregateData = aggregateRes?.data || {};
  const instructorProfile = aggregateData.profile || {};
  const stats = aggregateData.stats || {};

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['instructor-course-levels', user?._id || user?.id],
    queryFn: () => WWClient.entities.CourseLevel.filter({ instructor_id: user?._id || user?.id }),
    enabled: !!(user?._id || user?.id),
    initialData: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => WWClient.entities.Language.list(),
    initialData: []
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => WWClient.entities.Enrollment.list('-created_date'),
    initialData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  // Filter enrollments for instructor's courses
  const enrollments = allEnrollments.filter(enrollment => 
    courseLevels.some(level => level.id === enrollment.course_id)
  );

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?._id || user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id || user?.id }, '-created_date', 10),
    enabled: !!(user?._id || user?.id),
    initialData: []
  });

  const publishedCourses = courseLevels.filter(c => c.status === 'published');
  const totalStudents = new Set(enrollments.map(e => e.user_id)).size;
  const totalRevenue = enrollments
    .filter(e => e.payment_status === 'completed')
    .reduce((sum, e) => sum + (e.payment_amount || 0), 0);
  const avgRating = courseLevels.length > 0 
    ? courseLevels.reduce((sum, c) => sum + (c.rating || 0), 0) / courseLevels.length 
    : 0;

  const getLanguageName = (languageId) => {
    const lang = languages.find(l => (l._id || l.id) === languageId);
    return lang ? `${lang.flag} ${lang.name}` : 'Unknown';
  };

  const getUserName = (userId) => {
    const user = allUsers.find(u => (u._id || u.id) === userId);
    return user?.full_name || 'Student';
  };

  const getCourseName = (courseId) => {
    const course = courseLevels.find(c => (c._id || c.id) === courseId);
    if (!course) return 'Unknown Course';
    const langName = getLanguageName(course.language_id);
    return `${langName} - ${course.level_name}`;
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || isAggLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorDashboard" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Instructor'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Here's what's happening with your courses today
                </p>
              </div>
            </div>
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{courseLevels.length}</p>
                <p className="text-xs text-slate-400">{publishedCourses.length} published</p>
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
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</p>
                <p className="text-xs text-emerald-600">+12% this month</p>
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
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-600">+8% this month</p>
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
                  <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</p>
                <p className="text-xs text-slate-400">across all courses</p>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Revenue Overview</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15%
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {publishedCourses.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Students</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {enrollments.filter(e => e.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${instructorProfile?.pending_payout || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* My Courses & Students Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* Assigned Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">My Assigned Courses</CardTitle>
                  <Link to={createPageUrl('InstructorCourses')}>
                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-6">
                  {courseLevels.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No courses assigned yet</p>
                      <p className="text-sm text-slate-400 mt-1">Contact admin to get courses assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseLevels.slice(0, 5).map((course, index) => {
                        const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.05 }}
                            className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {getLanguageName(course.language_id)} - {course.level_name}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {course.description || 'No description'}
                                </p>
                              </div>
                              <Badge className={
                                course.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-700 border-0 ml-2'
                                  : course.status === 'draft'
                                  ? 'bg-amber-100 text-amber-700 border-0 ml-2'
                                  : 'bg-slate-100 text-slate-700 border-0 ml-2'
                              }>
                                {course.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {courseEnrollments.length} students
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${course.price}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {course.rating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            {courseEnrollments.length > 0 && (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 mb-2 font-medium">Enrolled Students:</p>
                                <div className="flex flex-wrap gap-2">
                                  {courseEnrollments.slice(0, 5).map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs">
                                      <Avatar className="w-5 h-5">
                                        <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs">
                                          {getUserName(enrollment.user_id)?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-slate-700 dark:text-slate-300">{getUserName(enrollment.user_id)}</span>
                                    </div>
                                  ))}
                                  {courseEnrollments.length > 5 && (
                                    <span className="text-xs text-slate-500 px-2 py-1">+{courseEnrollments.length - 5} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enrolled Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Enrolled Students</CardTitle>
                  <Link to={createPageUrl('InstructorStudents')}>
                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-6">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No students enrolled yet</p>
                      <p className="text-sm text-slate-400 mt-1">Students will appear here once they enroll</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.slice(0, 5).map((enrollment, index) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Avatar className="w-11 h-11 border-2 border-white dark:border-slate-700">
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                                {getUserName(enrollment.user_id)?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {getUserName(enrollment.user_id)}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                {getCourseName(enrollment.course_id)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10">
                                {enrollment.progress_percentage || 0}%
                              </span>
                            </div>
                            <Badge className={
                              enrollment.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-700 border-0'
                                : enrollment.status === 'active'
                                ? 'bg-blue-100 text-blue-700 border-0'
                                : 'bg-slate-100 text-slate-700 border-0'
                            }>
                              {enrollment.status}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}