import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
        LayoutDashboard,
        BookOpen,
        Users,
        GraduationCap,
        MessageSquare,
        Settings,
        BarChart3,
        Award,
        Calendar,
        CreditCard,
        FileText,
        Bell,
        ChevronLeft,
        ChevronRight,
        Menu,
        X,
        LogOut,
        Moon,
        Sun,
        Globe,
        Wallet,
        Clock,
        ShoppingBag
      } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
  { icon: Globe, label: 'Languages', page: 'AdminLanguages' },
  { icon: BookOpen, label: 'Course Levels', page: 'AdminCourseLevels' },
  { icon: Users, label: 'Instructors', page: 'AdminInstructors' },
  { icon: GraduationCap, label: 'Students', page: 'AdminStudents' },
  { icon: Calendar, label: 'Enrollments', page: 'AdminEnrollments' },
  { icon: ShoppingBag, label: 'Cart Reminders', page: 'AdminCartReminders' },
  { icon: Clock, label: 'Approve Hours', page: 'AdminApproveHours' },
  { icon: MessageSquare, label: 'Messages', page: 'Messages' },
  { icon: CreditCard, label: 'Payments', page: 'AdminPayments' },
  { icon: Wallet, label: 'Withdrawals', page: 'AdminWithdrawals' },
  { icon: Award, label: 'Certificates', page: 'AdminCertificates' },
  { icon: BarChart3, label: 'Analytics', page: 'AdminAnalytics' },
  { icon: Settings, label: 'Settings', page: 'AdminSettings' },
];

const instructorMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'InstructorDashboard' },
  { icon: BookOpen, label: 'My Courses', page: 'InstructorCourses' },
  { icon: Calendar, label: 'Schedule', page: 'InstructorSchedule' },
  { icon: GraduationCap, label: 'Students', page: 'InstructorStudents' },
  { icon: Clock, label: 'Log Hours', page: 'InstructorLogHours' },
  { icon: CreditCard, label: 'Earnings', page: 'InstructorEarnings' },
  { icon: Wallet, label: 'Wallet', page: 'InstructorWallet' },
  { icon: Settings, label: 'Profile', page: 'InstructorProfile' },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'StudentDashboard' },
  { icon: BookOpen, label: 'Browse Courses', page: 'CourseCatalog' },
  { icon: GraduationCap, label: 'My Learning', page: 'MyLearning' },
  { icon: Calendar, label: 'Schedule', page: 'StudentSchedule' },
  { icon: Award, label: 'Certificates', page: 'MyCertificates' },
  { icon: MessageSquare, label: 'Messages', page: 'Messages' },
  { icon: Settings, label: 'Settings', page: 'StudentSettings' },
];

export default function Sidebar({ userRole, currentPage, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  const menuItems = userRole === 'admin' 
    ? adminMenuItems 
    : userRole === 'instructor' 
    ? instructorMenuItems 
    : studentMenuItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex items-center h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 relative",
        collapsed ? "justify-center px-4" : "justify-between"
      )}>
        <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 overflow-hidden">
          <img src="/logo.png" alt="Global Tongue logo" className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-violet-500/25 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent whitespace-nowrap"
              >
                Global Tongue
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </motion.div>
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg absolute -right-3 top-5 z-50 bg-white dark:bg-slate-900 shadow-md border border-slate-200/50 dark:border-slate-800/50 w-6 h-6"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </motion.div>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="md:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-6">
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 no-underline group",
                  isActive 
                    ? "text-violet-600 dark:text-violet-400 animate-gradient"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
                  collapsed && "justify-center px-2"
                )}
                style={{ textDecoration: 'none' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl -z-10 border border-violet-100/50 dark:border-violet-800/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                {/* Hover state micro-interaction */}
                <span className="absolute inset-0 bg-slate-100/40 dark:bg-slate-800/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-20" />

                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )} />
                
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium text-sm z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "relative w-full justify-start gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200 group",
            collapsed && "justify-center px-2"
          )}
        >
          <span className="absolute inset-0 bg-slate-100/40 dark:bg-slate-800/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="z-10 flex-shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium z-10 whitespace-nowrap"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "relative w-full justify-start gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors duration-200 group",
            collapsed && "justify-center px-2"
          )}
        >
          <span className="absolute inset-0 bg-red-50/10 dark:bg-red-950/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="z-10 flex-shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium z-10 whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50 rounded-xl"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-50 md:hidden shadow-2xl border-r border-slate-200/50 dark:border-slate-800/50"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 z-30 shadow-premium-sm"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}