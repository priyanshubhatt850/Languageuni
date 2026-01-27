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
import { LoadingPage } from '@/components/common/LoadingSpinner';
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



export default function CourseCatalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialLanguage = urlParams.get('language') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(initialLanguage ? [initialLanguage] : []);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('popular');

  const { data: languages = [] } = useQuery({
    queryKey: ['active-languages'],
    queryFn: async () => {
      const allLanguages = await WWClient.entities.Language.filter({ is_active: true }, 'display_order');
      // Remove duplicates based on language code
      const uniqueLanguages = allLanguages.filter((lang, index, self) =>
        index === self.findIndex(l => l.code === lang.code)
      );
      return uniqueLanguages;
    },
    initialData: []
  });

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['published-levels'],
    queryFn: async () => {
      const allLevels = await WWClient.entities.CourseLevel.filter({ status: 'published' }, 'display_order');
      const activeLanguageIds = languages.map(l => l.id);
      return allLevels.filter(level => activeLanguageIds.includes(level.language_id));
    },
    enabled: languages.length > 0,
    initialData: []
  });

  const uniqueLevelNames = [...new Set(levels.map(l => l.level_name).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(levels.map(l => l.level_type).filter(Boolean))];

  const filteredLevels = levels.filter(level => {
    const language = languages.find(l => l.id === level.language_id);
    
    const matchesSearch = !searchTerm || 
      level.level_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = selectedLanguages.length === 0 || 
      selectedLanguages.includes(language?.name);
    
    const matchesLevel = selectedLevels.length === 0 || 
      selectedLevels.includes(level.level_name);
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(level.level_type);
    
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

  const FilterSection = ({ title, items, selected, setSelected, isLanguage }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">{title}</h4>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500">No options</p>
        ) : (
          items.map(item => {
            const displayText = isLanguage && typeof item === 'object' ? `${item.flag} ${item.name}` : item;
            const value = isLanguage && typeof item === 'object' ? item.name : item;
            return (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selected.includes(value)}
                  onCheckedChange={() => toggleFilter(value, selected, setSelected)}
                  className="rounded-md"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{displayText}</span>
              </label>
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
      />
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <FilterSection 
        title="Level" 
        items={uniqueLevelNames} 
        selected={selectedLevels} 
        setSelected={setSelectedLevels} 
      />
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <FilterSection 
        title="Type" 
        items={uniqueTypes.map(t => t === 'standard' ? 'CEFR Standard' : 'Exam Prep')} 
        selected={selectedCategories} 
        setSelected={setSelectedCategories} 
      />
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={500}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      
      {hasActiveFilters && (
        <>
          <Separator className="bg-slate-200 dark:bg-slate-800" />
          <Button onClick={clearFilters} className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg h-10 transition-colors">
            Clear Filters
          </Button>
        </>
      )}
    </div>
  );

  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
            <motion.div whileHover={{ x: -4 }}>
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </motion.div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Explore Courses
            </h1>
          </Link>
        </div>
      </div>

      <div className="pt-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {sortedLevels.length} Courses Available
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative max-w-2xl mx-auto px-1 sm:px-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl text-sm sm:text-base w-full"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-start sm:justify-end px-1 sm:px-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="sm:hidden rounded-lg h-10 text-sm flex-1">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-violet-600 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {selectedLanguages.length + selectedLevels.length + selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800">
                  <SheetHeader>
                    <SheetTitle className="text-slate-900 dark:text-white">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-2 pt-2">
                {selectedLanguages.map(lang => (
                  <Badge 
                    key={lang} 
                    className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors rounded-full"
                    onClick={() => toggleFilter(lang, selectedLanguages, setSelectedLanguages)}
                  >
                    {lang}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {selectedLevels.map(level => (
                  <Badge 
                    key={level} 
                    className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors rounded-full"
                    onClick={() => toggleFilter(level, selectedLevels, setSelectedLevels)}
                  >
                    {level}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {selectedCategories.map(cat => (
                  <Badge 
                    key={cat} 
                    className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors rounded-full"
                    onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                  >
                    {cat}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden md:block">
              <div className="sticky top-24 bg-slate-50 dark:bg-slate-900 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 md:mb-6 text-sm md:text-base">Filters</h3>
                <FiltersContent />
              </div>
            </aside>

            {/* Course Grid */}
            <div className="md:col-span-3">
              {sortedLevels.length === 0 ? (
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
                >
                  {sortedLevels.map((level, index) => {
                    const language = languages.find(l => l.id === level.language_id);
                    const courseData = {
                      id: level.id,
                      title: `${language?.name} - ${level.level_name}`,
                      description: level.description || 'Comprehensive language course',
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
                        key={level.id}
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
    </div>
  );
}