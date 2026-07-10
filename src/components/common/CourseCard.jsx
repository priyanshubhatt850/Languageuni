import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, BookOpen, Play, CheckCircle, Video, FileText, Award, Target, Heart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';

const levelColors = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  A2: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
  B1: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  B2: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  C1: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  C2: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

export default function CourseCard({ course, variant = 'default', delay = 0, onAuthRequired }) {
  const isCompact = variant === 'compact';
  const { isAuthenticated, user, authError, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const { items, addToCart, setDrawerOpen } = useCart();
  const isInCart = items.some(item => (item._id || item.id) === (course.id || course._id));

  const handleCardClick = (e) => {
    // Avoid navigation when clicking action buttons
    if (e.target.closest('button') || e.target.closest('a')) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    navigate(`/LevelDetail?id=${course.id || course._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 }}
      onClick={handleCardClick}
      className="group h-full cursor-pointer"
    >
        <Card className="overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
            <img
              src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=225&fit=crop`}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-violet-600 text-white border-0 shadow-lg font-semibold">
                🌐 {course.language}
              </Badge>
              <Badge className={cn("border shadow-lg backdrop-blur-sm", levelColors[course.level])}>
                {course.level}
              </Badge>
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              {course.discount_price ? (
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                </div>
              ) : null}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <Play className="w-7 h-7 text-violet-600 ml-1" />
              </div>
            </div>


          </div>

          {/* Content */}
          <CardContent className="p-5 flex-1 flex flex-col">
            {/* Instructor */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-violet-100 dark:border-violet-900">
                  <AvatarFallback className="text-sm bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    {course.instructor_name?.charAt(0) || 'I'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {course.instructor_name || 'Instructor'}
                </span>
              </div>
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800">
                {course.language}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 text-lg leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
              {course.description || 'Comprehensive language course covering all essential skills.'}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {course.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-slate-500">({course.reviews_count || 0})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{course.enrolled_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{course.duration_hours || 0}h</span>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4 pt-4 border-t border-slate-105 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  {course.discount_price ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ${course.discount_price}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ${course.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ${course.price || 0}
                    </span>
                  )}
                </div>

                {/* Wishlist toggle button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-8 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success("Saved course to wishlist!");
                  }}
                >
                  <Heart className="w-4.5 h-4.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Add to Cart / Added */}
                {isInCart ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDrawerOpen(true);
                    }}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold h-10 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Added
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(course, e);
                    }}
                    className="w-full bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold h-10"
                  >
                    Add to Cart
                  </Button>
                )}

                {/* Buy Now */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/LevelDetail?id=${course.id || course._id}`);
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-10 shadow-sm shadow-violet-600/10"
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