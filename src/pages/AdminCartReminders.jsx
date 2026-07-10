import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WWClient } from '@/api/WWClient';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Mail, Search, AlertCircle, TrendingUp, DollarSign, 
  Clock, ArrowRight, CheckCircle2, ChevronRight, RefreshCw, Star
} from 'lucide-react';

export default function AdminCartReminders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [remindedCarts, setRemindedCarts] = useState(new Set()); // track sent reminders locally

  // Fetch logged in admin details (needed for Header component)
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => WWClient.auth.me()
  });

  // Fetch all carts with items from the backend
  const { data: carts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-abandoned-carts'],
    queryFn: async () => {
      const res = await WWClient.custom.get('/cart/admin/all');
      return res?.carts || [];
    }
  });

  // Mutation to send a reminder email
  const sendReminderMutation = useMutation({
    mutationFn: async ({ userId, courseNames }) => {
      return await WWClient.custom.post('/cart/admin/send-reminder', { userId, courseNames });
    },
    onSuccess: (data, variables) => {
      toast.success('Reminder email sent successfully to the student!');
      setRemindedCarts(prev => {
        const next = new Set(prev);
        next.add(variables.userId);
        return next;
      });
    },
    onError: (error) => {
      toast.error('Failed to send reminder: ' + error.message);
    }
  });

  const handleLogout = () => {
    WWClient.auth.logout();
    window.location.href = '/';
  };

  const handleSendReminder = (cart) => {
    const courseNames = cart.items.map(item => `${item.language_id?.name || 'Language'} ${item.level_name} Course`);
    sendReminderMutation.mutate({
      userId: cart.user_id?._id || cart.user_id?.id,
      courseNames
    });
  };

  // Filter carts by search term
  const filteredCarts = carts.filter(cart => {
    const student = cart.user_id || {};
    const name = (student.full_name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  // Compute overall stats
  const totalCartsCount = carts.length;
  const potentialRevenue = carts.reduce((sum, cart) => {
    const cartSum = cart.items.reduce((cSum, item) => cSum + (item.discount_price || item.price || 0), 0);
    return sum + cartSum;
  }, 0);

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCartReminders" onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto text-left">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Cart Reminders <ShoppingBag className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </h1>
              <p className="text-sm text-slate-505 dark:text-slate-400 mt-1">
                Monitor student carts, track potential checkout revenue, and send reminder notifications.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              variant="outline"
              className="rounded-xl flex items-center gap-2 font-bold h-10 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-605">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abandoned Carts</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCartsCount}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potential Revenue</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">${potentialRevenue}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders Sent Today</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{remindedCarts.size}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search bar & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border border-slate-200 focus-visible:ring-1 focus-visible:ring-violet-500 h-11"
              />
            </div>
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
              <p className="text-slate-500 text-sm font-semibold">Loading carts...</p>
            </div>
          ) : filteredCarts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 border border-slate-100 dark:border-slate-800">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">No abandoned carts found</h3>
                <p className="text-slate-500 text-sm">
                  {searchTerm ? "Try searching for a different student." : "All students currently have checked out carts!"}
                </p>
              </div>
            </div>
          ) : (
            /* Carts Grid List */
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCarts.map((cart, idx) => {
                  const student = cart.user_id || {};
                  const userId = student._id || student.id;
                  const cartTotal = cart.items.reduce((sum, item) => sum + (item.discount_price || item.price || 0), 0);
                  const isReminded = remindedCarts.has(userId);

                  return (
                    <motion.div
                      key={cart._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          
                          {/* Student Info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <Avatar className="w-12 h-12 border-2 border-violet-100 dark:border-violet-900">
                              <AvatarImage src={student.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-bold">
                                {student.full_name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 text-left">
                              <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                {student.full_name || 'Anonymous Student'}
                              </h4>
                              <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 truncate">
                                {student.email || 'N/A'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-semibold text-slate-400">
                                  Updated {new Date(cart.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cart Items Details */}
                          <div className="flex-1 flex flex-wrap gap-2 text-left">
                            {cart.items.map((item, iIndex) => (
                              <Badge 
                                key={item._id || iIndex} 
                                variant="secondary" 
                                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                              >
                                <span>{item.language_id?.flag || '🏳️'}</span>
                                <span>{item.level_name}</span>
                                <span className="text-slate-400 font-normal">|</span>
                                <span className="text-violet-605 dark:text-violet-400 font-extrabold">${item.discount_price || item.price}</span>
                              </Badge>
                            ))}
                          </div>

                          {/* Checkout Subtotal & Action */}
                          <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                            <div className="text-left md:text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtotal</p>
                              <h5 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">${cartTotal}</h5>
                            </div>

                            {isReminded ? (
                              <Button
                                disabled
                                className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold h-10 px-5 flex items-center gap-1.5 cursor-default transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Sent
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSendReminder(cart)}
                                disabled={sendReminderMutation.isPending}
                                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold h-10 px-5 flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/10 active:scale-[0.98]"
                              >
                                <Mail className="w-4 h-4" /> Send Reminder
                              </Button>
                            )}
                          </div>

                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
