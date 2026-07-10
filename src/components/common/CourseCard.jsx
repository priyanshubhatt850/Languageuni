import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, BookOpen, Play, CheckCircle, Video, FileText, Award, Target, Heart, Check, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { toast } from 'sonner';

const levelColors = {
  A1: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-350 dark:border-emerald-900',
  A2: 'bg-teal-50 text-teal-700 border-teal-250 dark:bg-teal-950/30 dark:text-teal-350 dark:border-teal-900',
  B1: 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/30 dark:text-blue-350 dark:border-blue-900',
  B2: 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-350 dark:border-indigo-900',
  C1: 'bg-violet-50 text-violet-700 border-violet-250 dark:bg-violet-950/30 dark:text-violet-350 dark:border-violet-900',
  C2: 'bg-purple-50 text-purple-700 border-purple-250 dark:bg-purple-950/30 dark:text-purple-350 dark:border-purple-900',
};

const languageFlags = {
  English: '🇬🇧',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  German: '🇩🇪',
  Italian: '🇮🇹',
  Japanese: '🇯🇵',
  Chinese: '🇨🇳',
  Korean: '🇰🇷',
  Russian: '🇷🇺',
  Portuguese: '🇵🇹',
  Turkish: '🇹🇷',
  Arabic: '🇸🇦',
};

const getFlag = (lang) => {
  if (!lang) return '🌐';
  return languageFlags[lang] || '🌐';
};

export default function CourseCard({ course, variant = 'default', delay = 0, onAuthRequired }) {
  const isCompact = variant === 'compact';
  const { isAuthenticated, user, authError, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const { items, addToCart, setDrawerOpen } = useCart();
  const isInCart = items.some(item => (item._id || item.id) === (course.id || course._id));
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleCardClick = (e) => {
    // Avoid navigation when clicking action buttons
    if (e.target.closest('button') || e.target.closest('a')) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    navigate(`/LevelDetail?id=${course.id || course._id}`);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success("Added course to wishlist!");
    } else {
      toast.success("Removed course from wishlist!");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.45;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative w-3 h-3">
            <Star className="absolute top-0 left-0 w-3 h-3 text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-slate-250 dark:text-slate-705 fill-slate-100 dark:fill-slate-800" />
        );
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ delay: delay * 0.05, type: "spring", stiffness: 350, damping: 25 }}
      onClick={handleCardClick}
      className="group h-full cursor-pointer relative"
    >
      <Card className="overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl dark:hover:shadow-violet-950/30 transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
          )}
          <img
            src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=225&fit=crop`}
            alt={course.title}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Flags & Level Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <div className={cn("border shadow-md backdrop-blur-md font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5", levelColors[course.level])}>
              <span className="text-sm leading-none" role="img" aria-label={course.language}>
                {getFlag(course.language)}
              </span>
              <span>{course.level}</span>
            </div>
          </div>

          {/* Discount Badge */}
          {course.discount_price && course.price ? (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md font-bold px-2 py-0.5 text-xs rounded-full">
                {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
              </Badge>
            </div>
          ) : null}

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
            {/* Wishlist overlay button */}
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "w-9 h-9 rounded-full shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 bg-white/90 hover:bg-white text-slate-800 hover:text-red-500 border border-slate-100 dark:bg-slate-900/90 dark:border-slate-800 dark:text-white dark:hover:text-red-400",
                isWishlisted && "text-red-500 fill-red-500 dark:text-red-400 dark:fill-red-400 hover:text-red-650"
              )}
              onClick={toggleWishlist}
            >
              <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
            </Button>

            {/* Cart overlay button */}
            <Button
              variant="secondary"
              size="icon"
              className="w-9 h-9 rounded-full shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 bg-white/90 hover:bg-white text-slate-800 hover:text-violet-650 border border-slate-100 dark:bg-slate-900/90 dark:border-slate-800 dark:text-white dark:hover:text-violet-400"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isInCart) {
                  setDrawerOpen(true);
                } else {
                  addToCart(course, e);
                }
              }}
            >
              {isInCart ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-450 font-bold" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>

            {/* Play/View Overlay */}
            <div className="w-9 h-9 rounded-full shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 bg-violet-600 text-white flex items-center justify-center hover:bg-violet-750">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Instructor & Language tag */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 border border-violet-100 dark:border-violet-900">
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                  {course.instructor_name?.charAt(0) || 'I'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {course.instructor_name || 'Instructor'}
              </span>
            </div>
            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-350 border-0 font-medium text-[10px] px-2 py-0.5">
              {course.language}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-850 dark:text-white line-clamp-2 mb-2 text-base leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
            {course.description || 'Comprehensive language course covering all essential skills.'}
          </p>

          {/* Stats & Rating */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-0.5">
                  {course.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                ({course.reviews_count || 0} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1" title={`${course.enrolled_count || 0} students enrolled`}>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{(course.enrolled_count || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1" title={`Course duration: ${course.duration_hours || 0} hours`}>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.duration_hours || 0}h</span>
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                {course.discount_price ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-850 dark:text-white">
                      ${course.discount_price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ${course.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-850 dark:text-white">
                    ${course.price || 0}
                  </span>
                )}
              </div>

              {/* Wishlist toggle button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-8 h-8 transition-colors",
                  isWishlisted && "text-red-500 hover:text-red-650 bg-red-50 dark:bg-red-950/20"
                )}
                onClick={toggleWishlist}
              >
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Add to Cart / Added */}
              {isInCart ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDrawerOpen(true);
                  }}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-350 dark:border-emerald-800 rounded-xl text-xs font-bold h-10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Added
                </Button>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    addToCart(course, e);
                  }}
                  className="w-full bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 rounded-xl text-xs font-bold h-10 transition-colors"
                >
                  Add to Cart
                </Button>
              )}

              {/* Buy Now */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(`/LevelDetail?id=${course.id || course._id}`);
                }}
                className="w-full bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold h-10 shadow-sm shadow-violet-600/10 hover:shadow-md transition-all duration-200"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}