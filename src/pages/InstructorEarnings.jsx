import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Download
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
import { format } from 'date-fns';

const earningsData = [
  { month: 'Jan', earnings: 850 },
  { month: 'Feb', earnings: 1200 },
  { month: 'Mar', earnings: 980 },
  { month: 'Apr', earnings: 1450 },
  { month: 'May', earnings: 1800 },
  { month: 'Jun', earnings: 1650 },
];

export default function InstructorEarnings() {
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

  const { data: instructorProfile } = useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      const profiles = await WWClient.entities.InstructorProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user?.id
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['instructor-enrollments', user?.id],
    queryFn: () => WWClient.entities.Enrollment.filter({ instructor_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const completedPayments = enrollments.filter(e => e.payment_status === 'completed');
  const totalRevenue = completedPayments.reduce((sum, e) => sum + (e.payment_amount || 0), 0);
  const revenueShare = instructorProfile?.revenue_share_percentage || 70;
  const totalEarnings = (totalRevenue * revenueShare) / 100;
  const pendingPayout = instructorProfile?.pending_payout || totalEarnings * 0.3;

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorEarnings" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Earnings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track your revenue and manage payouts
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Earnings"
              value={`$${totalEarnings.toLocaleString()}`}
              icon={DollarSign}
              color="green"
              change="+15% this month"
              changeType="increase"
              delay={0}
            />
            <StatsCard
              title="Pending Payout"
              value={`$${pendingPayout.toLocaleString()}`}
              icon={Wallet}
              color="orange"
              delay={1}
            />
            <StatsCard
              title="Revenue Share"
              value={`${revenueShare}%`}
              icon={TrendingUp}
              color="violet"
              delay={2}
            />
            <StatsCard
              title="Total Sales"
              value={completedPayments.length.toString()}
              icon={CreditCard}
              color="blue"
              delay={3}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Earnings Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Earnings Overview</CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15%
                </Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value) => [`$${value}`, 'Earnings']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorEarnings)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payout Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-violet-100">Available for Payout</p>
                    <p className="text-3xl font-bold">${pendingPayout.toLocaleString()}</p>
                  </div>
                </div>

                <Button className="w-full bg-white text-violet-600 hover:bg-violet-50">
                  Request Payout
                </Button>

                <p className="text-sm text-violet-200 mt-4 text-center">
                  Payouts are processed weekly
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-6 border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Your Share</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedPayments.slice(0, 10).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.user_name || 'Student'}</TableCell>
                        <TableCell>{payment.course_title}</TableCell>
                        <TableCell>
                          {payment.enrolled_date 
                            ? format(new Date(payment.enrolled_date), 'MMM d, yyyy')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>${payment.payment_amount || 0}</TableCell>
                        <TableCell className="font-medium text-emerald-600">
                          ${((payment.payment_amount || 0) * revenueShare / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}