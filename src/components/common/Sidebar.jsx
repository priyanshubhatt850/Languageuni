import React, { useState } from 'react';
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
        Clock
      } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
  { icon: Globe, label: 'Languages', page: 'AdminLanguages' },
  { icon: BookOpen, label: 'Course Levels', page: 'AdminCourseLevels' },
  { icon: Users, label: 'Instructors', page: 'AdminInstructors' },
  { icon: GraduationCap, label: 'Students', page: 'AdminStudents' },
  { icon: Calendar, label: 'Enrollments', page: 'AdminEnrollments' },
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const menuItems = userRole === 'admin' 
    ? adminMenuItems 
    : userRole === 'instructor' 
    ? instructorMenuItems 
    : studentMenuItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex items-center h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/50",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Language Uni</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
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
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline",
                          isActive 
                            ? "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-600 dark:text-violet-400 shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                          collapsed && "justify-center px-2"
                        )}
                        style={{ textDecoration: 'none' }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </Link>
                    );
                  })}
                </nav>
      </ScrollArea>

      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "w-full justify-start gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
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
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-slate-900 shadow-lg"
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
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-50 md:hidden shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 20 }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 z-30"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}