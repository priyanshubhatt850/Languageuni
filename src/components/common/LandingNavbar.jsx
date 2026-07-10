import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/components/ui/ThemeProvider';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_LANGUAGES = [
  { id: 1, name: "English", flag: "🇬🇧" },
  { id: 2, name: "German", flag: "🇩🇪" },
  { id: 3, name: "French", flag: "🇫🇷" },
  { id: 4, name: "Spanish", flag: "🇪🇸" },
  { id: 5, name: "Italian", flag: "🇮🇹" },
  { id: 6, name: "Japanese", flag: "🇯🇵" },
];

export default function LandingNavbar({ showBack = false, openPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { items, setDrawerOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Fetch languages dynamically from backend
  const { data: dbLanguages = [] } = useQuery({
    queryKey: ['navbar-languages'],
    queryFn: async () => {
      try {
        const list = await WWClient.entities.Language.filter();
        return list && list.length > 0 ? list : DEFAULT_LANGUAGES;
      } catch (e) {
        return DEFAULT_LANGUAGES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  const languages = dbLanguages.length > 0 ? dbLanguages : DEFAULT_LANGUAGES;

  const isHome = location.pathname === '/' || location.pathname === '/Home';

  const handleDashboardClick = () => {
    if (user?.role === 'student' && !user?.profileCompleted) {
      if (openPortal) {
        openPortal();
      } else {
        navigate('/StudentDashboard');
      }
    } else if (user?.role === 'instructor' && !user?.profileCompleted) {
      navigate('/InstructorOnboarding');
    } else {
      navigate(
        user?.role === 'admin' ? '/AdminDashboard' :
        user?.role === 'instructor' ? '/InstructorDashboard' : '/StudentDashboard'
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-0 border-b border-slate-200/50 dark:border-slate-800/50 shadow-premium-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & optional Back button */}
          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-350" />
              </Button>
            )}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Global Tongue logo"
                className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 group-hover:scale-105 transition-all duration-300 flex-shrink-0"
              />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Global Tongue
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to={createPageUrl('CourseCatalog')}
              className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-semibold text-sm"
            >
              Courses
            </Link>
            
            {/* Language Selector Dropdown */}
            <DropdownMenu onOpenChange={setLangMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-semibold text-sm gap-1.5 px-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-lg"
                >
                  <Globe className="w-4 h-4" />
                  <span>Languages</span>
                  <motion.div
                    animate={{ rotate: langMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-premium-lg rounded-xl p-1"
              >
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg py-2 px-3 cursor-pointer"
                    onClick={() => navigate(`/LanguageDetail?id=${lang.id}`)}
                  >
                    <span className="mr-2.5 text-base">{lang.flag || '🌐'}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {lang.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isHome ? (
              <>
                <a
                  href="#features"
                  className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-semibold text-sm"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-semibold text-sm"
                >
                  Reviews
                </a>
              </>
            ) : null}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <motion.button
              id="navbar-cart-icon"
              onClick={() => setDrawerOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300"
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

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>

            {/* Auth / Dashboard Button */}
            <div className="hidden sm:block ml-2">
              {isAuthenticated ? (
                <Button
                  onClick={handleDashboardClick}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all font-bold h-10 px-5"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all rounded-xl font-bold h-10 px-5"
                  onClick={openPortal}
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link
                to={createPageUrl('CourseCatalog')}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 py-2"
              >
                Browse Courses
              </Link>

              {/* Mobile Languages list */}
              <div className="py-2">
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Learn a Language
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <Link
                      key={lang.id}
                      to={`/LanguageDetail?id=${lang.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-350"
                    >
                      <span>{lang.flag || '🌐'}</span>
                      <span>{lang.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {isHome && (
                <>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 py-2"
                  >
                    Features
                  </a>
                  <a
                    href="#testimonials"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-semibold text-slate-750 dark:text-slate-300 hover:text-violet-600 py-2"
                  >
                    Reviews
                  </a>
                </>
              )}

              {/* Mobile Auth Button */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                {isAuthenticated ? (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleDashboardClick();
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md font-bold py-2.5"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openPortal();
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md rounded-xl font-bold py-2.5"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
