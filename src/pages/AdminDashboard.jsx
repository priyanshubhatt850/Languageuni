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
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  UserCheck,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 7200 },
  { month: 'Jun', revenue: 6800 },
];

const enrollmentData = [
  { month: 'Jan', enrollments: 120 },
  { month: 'Feb', enrollments: 150 },
  { month: 'Mar', enrollments: 180 },
  { month: 'Apr', enrollments: 220 },
  { month: 'May', enrollments: 280 },
  { month: 'Jun', enrollments: 250 },
];

const languageDistribution = [
  { name: 'English', value: 35, color: '#8b5cf6' },
  { name: 'Spanish', value: 25, color: '#3b82f6' },
  { name: 'French', value: 20, color: '#10b981' },
  { name: 'German', value: 12, color: '#f59e0b' },
  { name: 'Other', value: 8, color: '#6b7280' },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => WWClient.entities.Course.list(),
    initialData: []
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => WWClient.entities.Enrollment.list(),
    initialData: []
  });

  const { data: instructorProfiles = [] } = useQuery({
    queryKey: ['all-instructors'],
    queryFn: () => WWClient.entities.InstructorProfile.list(),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
});

  const students = allUsers.filter(u => u.role === 'student' || !u.role);
  const instructors = allUsers.filter(u => u.role === 'instructor');
  const pendingInstructors = instructorProfiles.filter(p => p.verification_status === 'pending');
  const totalRevenue = enrollments
    .filter(e => e.payment_status === 'completed')
    .reduce((sum, e) => sum + (e.payment_amount || 0), 0);

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminDashboard" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Platform overview and management
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Students"
              value={students.length}
              icon={GraduationCap}
              color="violet"
              change="+18% this month"
              changeType="increase"
              delay={0}
            />
            <StatsCard
              title="Instructors"
              value={instructors.length}
              icon={UserCheck}
              color="blue"
              change={`${pendingInstructors.length} pending`}
              delay={1}
            />
            <StatsCard
              title="Total Courses"
              value={courses.length}
              icon={BookOpen}
              color="green"
              change={`${courses.filter(c => c.status === 'published').length} published`}
              changeType="increase"
              delay={2}
            />
            <StatsCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="orange"
              change="+24% this month"
              changeType="increase"
              delay={3}
            />
          </div>

          {/* Alerts */}
          {pendingInstructors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 dark:text-amber-200">
                      <strong>{pendingInstructors.length}</strong> instructor applications pending review
                    </p>
                  </div>
                  <Link to={createPageUrl('AdminInstructors')}>
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      Review Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +24%
                </Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenueAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorRevenueAdmin)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Course Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={languageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {languageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  {languageDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollments Chart & Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="enrollments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Courses */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Courses</CardTitle>
                <Link to={createPageUrl('AdminCourses')}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 4).map((course) => (
                    <div key={course.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <img
                          src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop`}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {course.title}
                        </p>
                        <p className="text-sm text-slate-500">{course.instructor_name}</p>
                      </div>
                      <Badge variant="secondary" className={
                        course.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : course.status === 'draft'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-700'
                      }>
                        {course.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Manage Users', icon: Users, page: 'AdminStudents', bgColor: 'bg-violet-100 dark:bg-violet-900/30', textColor: 'text-violet-600' },
              { label: 'Manage Courses', icon: BookOpen, page: 'AdminCourses', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600' },
              { label: 'View Payments', icon: DollarSign, page: 'AdminPayments', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600' },
              { label: 'Analytics', icon: BarChart3, page: 'AdminAnalytics', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600' },
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(action.page)}>
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${action.bgColor}`}>
                        <action.icon className={`w-6 h-6 ${action.textColor}`} />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}