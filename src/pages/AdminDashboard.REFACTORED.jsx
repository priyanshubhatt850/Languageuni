/**
 * REFACTORED AdminDashboard Page Example
 * 
 * OLD APPROACH:
 * - 5 separate useQuery hooks (User.list, Course.list, Enrollment.list, etc.)
 * - Multiple network requests
 * - Client-side data aggregation
 * - Redundant data fetching across different pages
 * 
 * NEW APPROACH:
 * - 1 aggregated useAdminDashboard hook
 * - Single network request
 * - Server-side aggregation (more efficient)
 * - Cached and optimized
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useAdminDashboard } from '@/hooks/useApi'; // NEW: Import aggregated hook
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

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // NEW: Single hook instead of 5 separate useQuery calls
  const { data: dashboard, isLoading, isError, error } = useAdminDashboard();

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (isLoading) return <LoadingPage />;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message}</div>;

  // Extract aggregated data from single API response
  const stats = dashboard?.data?.stats || {};
  const notifications = dashboard?.data?.notifications || [];
  const recentStudents = dashboard?.data?.recent_users?.filter(u => u.role === 'student') || [];
  const recentInstructors = dashboard?.data?.instructor_profiles || [];

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

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
              <StatsCard
                title="Total Users"
                value={stats.total_users || 0}
                icon={Users}
                trend="+12%"
              />
            </motion.div>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
              <StatsCard
                title="Students"
                value={stats.total_students || 0}
                icon={GraduationCap}
                trend="+8%"
              />
            </motion.div>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
              <StatsCard
                title="Instructors"
                value={stats.total_instructors || 0}
                icon={UserCheck}
                trend="+5%"
              />
            </motion.div>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
              <StatsCard
                title="Total Revenue"
                value={`$${(stats.total_revenue || 0).toLocaleString()}`}
                icon={DollarSign}
                trend="+15%"
              />
            </motion.div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Language Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Students */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Students</CardTitle>
                <Link to={createPageUrl('AdminStudents')}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student._id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Avatar>
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback>{student.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Instructors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Pending Instructors
                </CardTitle>
                <Badge variant="outline">{stats.pending_instructors || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInstructors
                    .filter(i => i.verification_status === 'pending')
                    .slice(0, 5)
                    .map((instructor) => (
                      <div key={instructor._id} className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div>
                          <p className="text-sm font-medium">Instructor {instructor.user_id.slice(0, 8)}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {instructor.verification_status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
