import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, ChevronDown, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';

export default function Header({ user, notifications = [] }) {
  const { items, setDrawerOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await WWClient.auth.addAdmin({
        email: formData.email.trim(),
        full_name: formData.name.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'admin'
      });

      setAdminModalOpen(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setError('');
      // Optional: Show success message
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };
  const getSettingsRoute = () => {
    switch (user?.role) {
      case 'admin':
        return createPageUrl('AdminSettings');
      case 'instructor':
        return createPageUrl('InstructorProfile');
      case 'student':
      default:
        return createPageUrl('StudentSettings');
    }
  };

  return (
    <header className="h-16 glass-panel border-0 border-b border-slate-200/50 dark:border-slate-800/50 shadow-premium-sm sticky top-0 z-20 transition-all duration-300">
      <div className="h-full px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Add Admin Button */}
        {user?.role === 'admin' &&

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAdminModalOpen(true)}
            className="hover:bg-violet-100/50 dark:hover:bg-violet-900/20 rounded-xl"
          >
            <Plus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </Button>
        }
        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block group">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" />
            <Input
              placeholder="Search courses, lessons..."
              className="pl-10 bg-slate-50/40 hover:bg-slate-50/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-2 focus-visible:ring-violet-500/15 focus-visible:border-violet-500 rounded-xl transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Cart Icon */}
          <motion.button
            id="navbar-cart-icon"
            onClick={() => setDrawerOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-350"
          >
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {items.length > 0 && (
                <motion.span
                  key={items.length}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-violet-600/30"
                >
                  {items.length}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}

          <DropdownMenu onOpenChange={setNotifMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <motion.div
                  animate={notifMenuOpen ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="w-5 h-5 text-slate-650 dark:text-slate-350" />
                </motion.div>
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      key={unreadCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-red-500/25"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-premium-lg rounded-xl p-1">
              <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
                <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-3 px-3 hover:bg-slate-55 dark:hover:bg-slate-800/50 rounded-lg">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">{notif.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</span>
                  </DropdownMenuItem>
                ))
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem className="justify-center text-violet-600 dark:text-violet-400 font-semibold py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg">
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Avatar className="w-8 h-8 ring-2 ring-violet-500/10">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 text-sm font-semibold">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-none mt-0.5">{user?.role || 'Student'}</p>
                </div>
                <motion.div
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-premium-lg rounded-xl p-1">
              <DropdownMenuLabel className="px-3 py-2 font-semibold text-slate-900 dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem asChild className="hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg py-2 px-3">
                <Link to={getSettingsRoute()} className="text-slate-700 dark:text-slate-300">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg py-2 px-3">
                <Link to={createPageUrl('MyCertificates')} className="text-slate-700 dark:text-slate-300">My Certificates</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => WWClient.auth.logout()}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg py-2 px-3 font-medium"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Admin Creation Modal */}
      <AnimatePresence>
        {adminModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-96 z-50"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create Admin</h2>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@example.com"
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdminModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    {loading ? 'Creating...' : 'Add Admin'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4">
              <Input
                placeholder="Search courses, lessons..."
                className="bg-slate-50 dark:bg-slate-800"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}