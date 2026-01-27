import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, BookOpen, Play, Search, Filter, X, Sparkles, Grid3X3, ListChecks } from 'lucide-react';
import MaterialViewer from '@/components/learning/MaterialViewer';
import MaterialCard from '@/components/learning/MaterialCard';
import { AnimatePresence } from 'framer-motion';


export default function StudentPractice() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  // Check if user is enrolled
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', levelId, user?.id],
    queryFn: async () => {
      const enrollments = await WWClient.entities.Enrollment.filter({
        course_id: levelId,
        user_id: user?.id
      });
      return enrollments[0];
    },
    enabled: !!levelId && !!user?.id
  });

  const { data: level } = useQuery({
    queryKey: ['level', levelId],
    queryFn: async () => {
      const levels = await WWClient.entities.CourseLevel.filter({ id: levelId });
      return levels[0];
    },
    enabled: !!levelId
  });

  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', levelId],
    queryFn: () => WWClient.entities.Flashcard.filter({ level_id: levelId }, 'display_order'),
    enabled: !!levelId,
    initialData: []
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', levelId],
    queryFn: () => WWClient.entities.Exercise.filter({ level_id: levelId, is_active: true }, 'display_order'),
    enabled: !!levelId,
    initialData: []
  });

  const { data: studyMaterials = [] } = useQuery({
    queryKey: ['study-materials', levelId],
    queryFn: () => WWClient.entities.StudyMaterial.filter({ level_id: levelId }, 'display_order'),
    enabled: !!levelId,
    initialData: []
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['material-bookmarks', user?.id, levelId],
    queryFn: async () => {
      const bookmarks = await WWClient.entities.StudentMaterialBookmark.filter({
        user_id: user?.id,
        level_id: levelId,
        is_bookmarked: true
      });
      return bookmarks.map(b => b.material_id);
    },
    enabled: !!user?.id && !!levelId,
    initialData: []
  });

  useEffect(() => {
    setBookmarkedMaterials(bookmarks);
  }, [bookmarks]);

  const materialTypes = ['all', 'video', 'reading', 'listening', 'grammar', 'vocabulary', 'writing'];

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesType = selectedFilter === 'all' || material.material_type === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      (material.title && material.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['student-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  if (!levelId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={notifications} />
          <main className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-0 shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Course Selected
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 text-center">
                    Select a course from My Learning to access practice materials, or enroll in a new course.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate(createPageUrl('MyLearning'))}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Go to My Learning
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(createPageUrl('CourseCatalog'))}
                    >
                      Browse Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={notifications} />
          <main className="p-8 text-center">
            <p className="text-slate-600">You must enroll in this course to access practice materials.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
             {/* Hero Section */}
             <div className="mb-10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
               <div className="relative flex items-center gap-4 md:gap-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-900/40 dark:to-pink-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-purple-200/50 dark:border-purple-800/30 shadow-2xl">
                 <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('MyLearning'))} className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                   <ArrowLeft className="w-5 h-5" />
                 </Button>
                 <div className="flex-1 space-y-2">
                   <div className="flex items-center gap-2">
                     <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                     <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                       {level?.level_name} Practice Materials
                     </h1>
                   </div>
                   <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                     Master your language skills with carefully curated flashcards, interactive exercises, and comprehensive study materials
                   </p>
                 </div>
               </div>
             </div>



                  {/* Study Materials with Filter & Search */}
            {studyMaterials.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Study Materials
                </h2>

                {/* Search Bar */}
                <div className="mb-6 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Type Filter */}
                <div className="mb-6 flex gap-2 flex-wrap items-center">
                  <Filter className="w-5 h-5 text-slate-500" />
                  <div className="flex gap-2 flex-wrap">
                    {materialTypes.map(type => (
                      <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={selectedFilter === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFilter(type)}
                          className={`rounded-full transition-all ${
                            selectedFilter === type
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-600'
                          }`}
                        >
                          {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Materials Grid */}
                {filteredMaterials.length > 0 ? (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                      }
                    }}
                  >
                    {filteredMaterials.map((material, index) => (
                      <motion.div
                        key={material.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 }
                        }}
                      >
                        <MaterialCard
                          material={material}
                          levelId={levelId}
                          onView={setSelectedMaterial}
                          onBookmarkChange={() => {
                            setBookmarkedMaterials(prev => 
                              bookmarkedMaterials.includes(material.id)
                                ? prev.filter(id => id !== material.id)
                                : [...prev, material.id]
                            );
                          }}
                          isBookmarked={bookmarkedMaterials.includes(material.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No materials match your search</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters or search term</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Flashcards Section */}
            {flashcards.length > 0 && (
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    Flashcard Decks
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 ml-13">Build vocabulary and master key concepts</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flashcards.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -6 }}
                      className="group cursor-pointer"
                    >
                      <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-2xl hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 h-full flex flex-col">
                        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-600 group-hover:h-1.5 transition-all" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{deck.deck_name}</CardTitle>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">📇 {deck.total_cards} cards</p>
                            </div>
                            <Badge className={`rounded-full font-semibold ml-2 ${
                              deck.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              deck.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {deck.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          {deck.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                              {deck.description}
                            </p>
                          )}
                          <Button 
                            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold gap-2 group-hover:shadow-lg transition-all"
                            onClick={() => navigate(createPageUrl(`StudentFlashcards?levelId=${levelId}&deckId=${deck.id}`))}
                          >
                            <Play className="w-4 h-4" />
                            Study Now
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                  </motion.div>
                  )}

                  {/* Exercises Section */}
                  {exercises.length > 0 && (
                  <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  >
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      Exercises
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 ml-13">Practice your skills and track your progress</p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -6 }}
                      className="group cursor-pointer"
                    >
                      <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-2xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 h-full flex flex-col">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 group-hover:h-1.5 transition-all" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{exercise.title}</CardTitle>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">📝 {exercise.type.replace('_', ' ')}</p>
                            </div>
                            <Badge className={`rounded-full font-semibold ml-2 ${
                              exercise.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              exercise.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          {exercise.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                              {exercise.description}
                            </p>
                          )}
                          <div className="flex gap-3 text-sm mb-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">⏱️ {exercise.time_limit_minutes} min</span>
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">⭐ {exercise.points} pts</span>
                          </div>
                          <Button 
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold gap-2 group-hover:shadow-lg transition-all"
                            onClick={() => navigate(createPageUrl(`StudentExercise?levelId=${levelId}&exerciseId=${exercise.id}`))}
                          >
                            <Play className="w-4 h-4" />
                            Start Exercise
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                  </motion.div>
                  )}

                  {studyMaterials.length === 0 && flashcards.length === 0 && exercises.length === 0 && (
                  <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                  >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  No practice materials yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto mb-8">
                  Your instructor is preparing flashcards and exercises. Check back soon!
                  </p>
                  <Button 
                  onClick={() => navigate(createPageUrl('MyLearning'))}
                  variant="outline"
                  className="rounded-full"
                  >
                  Back to My Learning
                  </Button>
                  </motion.div>
                  )}
          </motion.div>
        </main>

        {/* Material Viewer Modal */}
        <AnimatePresence>
          {selectedMaterial && (
            <MaterialViewer
              material={selectedMaterial}
              onClose={() => setSelectedMaterial(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}