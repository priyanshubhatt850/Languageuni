import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Search,
  Clock,
  CheckCircle,
  Award,
  Video,
  CalendarDays,
  FileText,
  Flame,
  TrendingUp
} from 'lucide-react';

export default function MyLearning() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  // Use the new API to get all course details for the user's enrollments
  const { data: myCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses', user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      // Directly get all course details for the user
      const courseDetailsList = await WWClient.entities.Enrollment.getwithparams('getallcourseList', {
        user_id: user._id
      });
      // courseDetailsList is expected to be an array of objects with enrollment, courseDetails, languageDetails, materialDetails, etc.
      return Array.isArray(courseDetailsList) ? courseDetailsList : [];
    },
    enabled: !!user?._id,
    initialData: []
  });

  // Flatten and map data for UI
  const enrollmentLevels = myCourses.map((course) => {
    // course = enrollment object with courseDetails, languageDetails, materialDetails, etc.
    const enrollment = course;
    const level = course.courseDetails;
    const language = course.languageDetails;
    const progress = {
      status: course.status === 'active' && course.progress_percentage < 100
        ? (course.progress_percentage > 0 ? 'in_progress' : 'not_started')
        : (course.progress_percentage === 100 ? 'completed' : 'not_started'),
      progress_percentage: course.progress_percentage || 0,
      course_level_id: course.course_id,
      language_id: language?._id
    };
    const materials = Array.isArray(course.materialDetails)
      ? course.materialDetails
      : [];
      const material = course?.totalMaterials || 0;
    return {
      id: enrollment._id,
      enrollment,
      level,
      language,
      progress,
      materials,
      material
    };
  }).filter(item => item.level && item.language);

  const activeProgress = enrollmentLevels.filter(item => item.progress.status === 'in_progress' || item.progress.status === 'not_started');
  console.log(activeProgress,"this is activeprogress")
  const completedProgress = enrollmentLevels.filter(item => item.progress.status === 'completed');

  const filteredActive = activeProgress.filter(item =>
    item.level?.level_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompleted = completedProgress.filter(item =>
    item.level?.level_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || coursesLoading) return <LoadingPage />;

  // Move notifications query ABOVE LevelCard definition and all returns
  // const { data: notifications = [] } = useQuery({
  //   queryKey: ['my-notifications', user?._id],
  //   queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
  //   enabled: !!user?._id,
  //   initialData: []
  // });
const notifications = []
  const LevelCard = ({ item, index }) => {
    const { level, progress, enrollment, language, materials, material } = item;

    const levelGradients = {
      A1: 'from-emerald-400 to-teal-600',
      A2: 'from-teal-400 to-cyan-600',
      B1: 'from-blue-400 to-indigo-600',
      B2: 'from-indigo-400 to-purple-600',
      C1: 'from-purple-400 to-pink-600',
      C2: 'from-pink-400 to-rose-600',
    };

    const levelBadgeColors = {
      A1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      A2: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      B2: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      C1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      C2: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    };

    if (!level || !language) return null;

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const progressPercent = progress?.progress_percentage || 0;
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'in_progress';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <div className="group h-full rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 relative">
          {/* Top Accent Bar */}
          <div className={`h-1.5 bg-gradient-to-r ${levelGradients[level.level_name] || 'from-slate-400 to-slate-600'}`} />

          <CardContent className="p-6 md:p-8 h-full flex flex-col">
            {/* Header with Flag and Level */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{language.flag}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {language.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{language.code?.toUpperCase()}</p>
                  </div>
                </div>
              </div>
              <Badge className={`${levelBadgeColors[level.level_name]} px-4 py-2 text-lg font-bold rounded-full`}>
                {level.level_name}
              </Badge>
            </div>

            {/* Description */}
            {level.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                {level.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{material}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Materials</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{level.duration_hours || 0}h</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">${level.price}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Price</p>
              </div>
            </div>

            {/* Progress Section */}
            {isInProgress && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Learning Progress</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${levelBadgeColors[level.level_name]}`}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${levelGradients[level.level_name]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Dates and Type */}
            <div className="flex flex-wrap gap-3 mb-6">
              {level.level_type && (
                <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                  {level.level_type === 'exam' ? '📝 Exam Prep' : '📚 Standard Course'}
                </Badge>
              )}
              {isCompleted && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Completed
                </Badge>
              )}
              {enrollment?.start_date && (
                <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(enrollment.start_date)}
                </Badge>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-4">
              <Button
                onClick={() => navigate(createPageUrl(`StudentPractice?levelId=${level._id}`))}
                className={`w-full py-3 font-semibold rounded-xl gap-2 transition-all duration-300 shadow-md ${
                  isCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                    : `bg-gradient-to-r ${levelGradients[level.level_name]} text-white hover:shadow-lg transform hover:scale-105`
                }`}
              >
                <Play className="w-4 h-4" />
                {isCompleted ? 'Review Course' : 'Continue Learning'}
              </Button>
            </div>
          </CardContent>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              My Learning
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Unlock your potential and continue your language journey
            </p>
          </motion.div>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-md mb-8"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 shadow-md border-0"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="in-progress" className="w-full">
              <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-2xl mb-6 shadow-md border-0">
                <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                  In Progress ({activeProgress.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  Completed ({completedProgress.length})
                </TabsTrigger>
              </TabsList>

            <TabsContent value="in-progress">
             {filteredActive.length === 0 ? (
               <EmptyState
                 icon={BookOpen}
                 title="No courses in progress"
                 description="Start learning by enrolling in a course"
                 action
                 actionLabel="Browse Courses"
                 onAction={() => window.location.href = createPageUrl('CourseCatalog')}
               />
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {filteredActive.map((item, index) => (
                   <LevelCard key={item._id} item={item} index={index} />
                 ))}
               </div>
             )}
            </TabsContent>

            <TabsContent value="completed">
             {filteredCompleted.length === 0 ? (
               <EmptyState
                 icon={Award}
                 title="No completed courses yet"
                 description="Keep learning to complete your first course!"
               />
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {filteredCompleted.map((item, index) => (
                   <LevelCard key={item._id} item={item} index={index} />
                 ))}
               </div>
             )}
            </TabsContent>
            </Tabs>
            </motion.div>
            </main>
      </div>
    </div>
  );
}