import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from '@/components/common/EmptyState';
import CourseCard from '@/components/common/CourseCard';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  ArrowLeft,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const levelColors = {
  A1: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-350 dark:border-emerald-900',
  A2: 'bg-teal-50 text-teal-700 border-teal-250 dark:bg-teal-950/30 dark:text-teal-350 dark:border-teal-900',
  B1: 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/30 dark:text-blue-350 dark:border-blue-900',
  B2: 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-350 dark:border-indigo-900',
  C1: 'bg-violet-50 text-violet-700 border-violet-250 dark:bg-violet-950/30 dark:text-violet-350 dark:border-violet-900',
  C2: 'bg-purple-50 text-purple-700 border-purple-250 dark:bg-purple-950/30 dark:text-purple-350 dark:border-purple-900',
};

const SkeletonCard = () => (
  <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden h-full flex flex-col animate-pulse shadow-sm">
    <div className="aspect-video bg-slate-200 dark:bg-slate-850" />
    <div className="p-5 flex-1 flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-850 rounded-lg" />
        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-850 rounded-lg" />
      </div>
      <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded-md w-3/4" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-850 rounded-md" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-850 rounded-md w-5/6" />
      </div>
      <div className="h-px bg-slate-100 dark:bg-slate-800/80" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-850 rounded-lg" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-850 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-xl" />
      </div>
    </div>
  </div>
);

export default function CourseCatalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialLanguage = urlParams.get('language') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(initialLanguage ? [initialLanguage] : []);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('popular');

  const { data: languages = [], isLoading: isLanguagesLoading } = useQuery({
    queryKey: ['active-languages'],
    queryFn: async () => {
      const allLanguages = await WWClient.entities.Language.filter({ is_active: true }, 'display_order');
      const uniqueLanguages = allLanguages.filter((lang, index, self) =>
        index === self.findIndex(l => l.code === lang.code)
      );
      return uniqueLanguages;
    },
    initialData: []
  });

  const { data: levels = [], isLoading: isLevelsLoading } = useQuery({
    queryKey: ['published-levels'],
    queryFn: async () => {
      const allLevels = await WWClient.entities.CourseLevel.filter({ status: 'published' }, 'display_order');
      const activeLanguageIds = languages.map(l => l._id || l.id);
      return allLevels.filter(level => activeLanguageIds.includes(level.language_id));
    },
    enabled: languages.length > 0,
    initialData: []
  });

  const isCatalogLoading = isLanguagesLoading || isLevelsLoading;

  const uniqueLevelNames = [...new Set(levels.map(l => l.level_name).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(levels.map(l => l.level_type).filter(Boolean))];
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filteredLevels = levels.filter(level => {
    const language = languages.find(l => (l._id || l.id) === level.language_id);
    
    const matchesSearch = !searchTerm || 
      level.level_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = selectedLanguages.length === 0 || 
      selectedLanguages.includes(language?.name);
    
    const matchesLevel = selectedLevels.length === 0 || 
      selectedLevels.includes(level.level_name);
    
    const displayType = level.level_type === 'standard' ? 'CEFR Standard' : 'Exam Prep';
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(displayType);
    
    const price = level.discount_price || level.price || 0;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesLanguage && matchesLevel && matchesCategory && matchesPrice;
  });

  const sortedLevels = [...filteredLevels].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.enrolled_count || 0) - (a.enrolled_count || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'price-low':
        return (a.discount_price || a.price || 0) - (b.discount_price || b.price || 0);
      case 'price-high':
        return (b.discount_price || b.price || 0) - (a.discount_price || a.price || 0);
      default:
        return 0;
    }
  });

  const toggleFilter = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSelectedLanguages([]);
    setSelectedLevels([]);
    setSelectedCategories([]);
    setPriceRange([0, 500]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedLanguages.length > 0 || selectedLevels.length > 0 || 
    selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 500;

  const FilterSection = ({ title, items, selected, setSelected, isLanguage, isLoadingSection }) => (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {isLoadingSection ? (
          <div className="flex flex-wrap gap-1.5 w-full animate-pulse">
            <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-7 w-12 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">No options</p>
        ) : (
          items.map(item => {
            const displayText = isLanguage && typeof item === 'object' ? `${item.flag} ${item.name}` : item;
            const value = isLanguage && typeof item === 'object' ? item.name : item;
            const isChecked = selected.includes(value);
            const isLevel = title.toLowerCase() === 'level';
            const levelColorClass = levelColors[value] || 'bg-violet-600 text-white dark:bg-violet-700';
            
            return (
              <button
                key={value}
                onClick={() => toggleFilter(value, selected, setSelected)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200",
                  isChecked 
                    ? isLevel 
                      ? `${levelColorClass} border-transparent text-white shadow-sm`
                      : "bg-violet-600 border-transparent text-white shadow-sm dark:bg-violet-750"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-705 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {displayText}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const FiltersContent = () => (
    <div className="space-y-6">
      <FilterSection 
        title="Language" 
        items={languages} 
        selected={selectedLanguages} 
        setSelected={setSelectedLanguages}
        isLanguage={true}
        isLoadingSection={isCatalogLoading}
      />
      <Separator className="bg-slate-100 dark:bg-slate-800/80" />
      <FilterSection 
        title="Level" 
        items={uniqueLevelNames.length > 0 ? uniqueLevelNames : cefrLevels} 
        selected={selectedLevels} 
        setSelected={setSelectedLevels} 
        isLoadingSection={isCatalogLoading}
      />
      <Separator className="bg-slate-100 dark:bg-slate-800/80" />
      <FilterSection 
        title="Type" 
        items={uniqueTypes.map(t => t === 'standard' ? 'CEFR Standard' : 'Exam Prep')} 
        selected={selectedCategories} 
        setSelected={setSelectedCategories} 
        isLoadingSection={isCatalogLoading}
      />
      <Separator className="bg-slate-100 dark:bg-slate-800/80" />
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={500}
          step={10}
          className="w-full py-2"
        />
        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-0.5">
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">${priceRange[0]}</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">${priceRange[1]}</span>
        </div>
      </div>
      
      {hasActiveFilters && (
        <>
          <Separator className="bg-slate-100 dark:bg-slate-800/80" />
          <Button onClick={clearFilters} className="w-full bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-violet-750 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50 rounded-xl h-10 transition-colors font-semibold text-xs uppercase tracking-wider">
            Clear Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-900/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
            <motion.div whileHover={{ x: -3 }}>
              <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
            </motion.div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Explore Courses
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {!isCatalogLoading && (
              <span className="text-xs font-semibold text-slate-400">{sortedLevels.length} course{sortedLevels.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search, Filter & Sort Toolbar */}
        <div className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" />
              <Input
                placeholder="Search courses, levels, languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-10 h-11 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus-visible:ring-violet-500 transition-all w-full shadow-sm hover:shadow-md focus:bg-white dark:focus:bg-slate-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filters and Sorting */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden rounded-2xl h-11 text-sm flex-1 sm:flex-initial border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-violet-600 hover:bg-violet-750 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {selectedLanguages.length + selectedLevels.length + selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <SheetTitle className="text-slate-900 dark:text-white text-base">Filter Catalog</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto max-h-[80vh] pr-1">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-11 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-violet-500 shadow-sm hover:shadow-md transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick CEFR Toggles Row */}
          <div className="py-2.5 px-1 border-t border-b border-slate-100 dark:border-slate-850 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Quick CEFR Select:</span>
            <div className="flex items-center gap-2">
              {cefrLevels.map(level => {
                const isChecked = selectedLevels.includes(level);
                const levelColorClass = levelColors[level] || 'bg-violet-650 text-white dark:bg-violet-700';
                return (
                  <button
                    key={level}
                    onClick={() => toggleFilter(level, selectedLevels, setSelectedLevels)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold border transition-all duration-200 whitespace-nowrap",
                      isChecked 
                        ? `${levelColorClass} border-transparent text-white shadow-sm scale-95`
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Badge Pills */}
        {hasActiveFilters && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mb-8">
            {selectedLanguages.map(lang => (
              <Badge 
                key={lang} 
                className="bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-750 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50 cursor-pointer rounded-lg px-2.5 py-1 text-xs"
                onClick={() => toggleFilter(lang, selectedLanguages, setSelectedLanguages)}
              >
                {lang}
                <X className="w-3.5 h-3.5 ml-1.5" />
              </Badge>
            ))}
            {selectedLevels.map(level => (
              <Badge 
                key={level} 
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs border flex items-center gap-1",
                  levelColors[level] || "bg-violet-50 dark:bg-violet-950/60 text-violet-750 dark:text-violet-350 border-violet-100 dark:border-violet-900/50"
                )}
                onClick={() => toggleFilter(level, selectedLevels, setSelectedLevels)}
              >
                {level}
                <X className="w-3.5 h-3.5 ml-1.5" />
              </Badge>
            ))}
            {selectedCategories.map(cat => (
              <Badge 
                key={cat} 
                className="bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-750 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50 cursor-pointer rounded-lg px-2.5 py-1 text-xs"
                onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
              >
                {cat}
                <X className="w-3.5 h-3.5 ml-1.5" />
              </Badge>
            ))}
          </motion.div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-850 dark:text-white mb-6 text-sm tracking-tight">Filter Settings</h3>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            {isCatalogLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : sortedLevels.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                description="Try adjusting your filters or search term"
                action={hasActiveFilters}
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {sortedLevels.map((level, index) => {
                  const language = languages.find(l => (l._id || l.id) === level.language_id);
                  const courseData = {
                    _id: level._id || level.id,
                    title: `${language?.name || 'Language'} - ${level.level_name}`,
                    description: level.description || 'Comprehensive language course covering grammatical structures, speech patterns, and custom vocabulary logs.',
                    language: language?.name || '',
                    level: level.level_name,
                    instructor_name: 'Expert Instructor',
                    price: level.price,
                    discount_price: level.discount_price,
                    thumbnail_url: level.thumbnail_url,
                    duration_hours: level.duration_hours || 0,
                    enrolled_count: level.enrolled_count || 0,
                    rating: level.rating || 0,
                    reviews_count: 0
                  };
                  return (
                    <CourseCard 
                      key={level._id || level.id}
                      course={courseData}
                      delay={index}
                    />
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}