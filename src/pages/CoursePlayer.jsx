import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Circle,
  FileText,
  Video,
  Lock,
  ChevronRight,
  Download,
  MessageCircle,
  Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CoursePlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const enrollmentId = urlParams.get('enrollmentId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: async () => {
      const enrollments = await WWClient.entities.Enrollment.filter({ id: enrollmentId });
      return enrollments[0];
    },
    enabled: !!enrollmentId
  });

  const { data: course } = useQuery({
    queryKey: ['course', enrollment?.course_id],
    queryFn: async () => {
      const courses = await WWClient.entities.Course.filter({ id: enrollment?.course_id });
      return courses[0];
    },
    enabled: !!enrollment?.course_id
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', enrollment?.course_id],
    queryFn: () => WWClient.entities.Lesson.filter({ course_id: enrollment?.course_id }),
    enabled: !!enrollment?.course_id,
    initialData: []
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', user?.id, enrollment?.course_id],
    queryFn: async () => {
      if (!user?.id || !enrollment?.course_id) return null;
      const progresses = await WWClient.entities.StudentCourseLevelProgress.filter({
        user_id: user.id,
        course_level_id: enrollment.course_id
      });
      return progresses[0];
    },
    enabled: !!user?.id && !!enrollment?.course_id
  });

  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedLessons = enrollment?.completed_lessons || [];

  const currentLesson = sortedLessons.find(l => l.id === currentLessonId) || sortedLessons[0];

  useEffect(() => {
    if (sortedLessons.length > 0 && !currentLessonId) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = sortedLessons.find(l => !completedLessons.includes(l.id));
      setCurrentLessonId(firstIncomplete?.id || sortedLessons[0].id);
    }
  }, [sortedLessons, currentLessonId, completedLessons]);

  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId) => {
      const newCompleted = [...completedLessons, lessonId];
      const progressPercentage = Math.round((newCompleted.length / sortedLessons.length) * 100);
      
      // Update enrollment
      await WWClient.entities.Enrollment.update(enrollmentId, {
        completed_lessons: newCompleted,
        progress_percentage: progressPercentage,
        ...(progressPercentage === 100 && { 
          status: 'completed',
          completed_date: new Date().toISOString(),
          certificate_issued: true
        })
      });

      // Update student progress tracking if progress record exists
      if (progress?.id) {
        await WWClient.entities.StudentCourseLevelProgress.update(progress.id, {
          total_lessons_completed: newCompleted.length,
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? 'completed' : (progressPercentage > 0 ? 'in_progress' : 'not_started'),
          last_activity_date: new Date().toISOString(),
          ...(progressPercentage === 100 && { completed_date: new Date().toISOString() })
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', enrollmentId]);
      queryClient.invalidateQueries(['course-progress']);
    }
  });

  const handleMarkComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson.id)) {
      markCompleteMutation.mutate(currentLesson.id);
    }
  };

  const goToNextLesson = () => {
    const currentIndex = sortedLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex < sortedLessons.length - 1) {
      setCurrentLessonId(sortedLessons[currentIndex + 1].id);
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = sortedLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      setCurrentLessonId(sortedLessons[currentIndex - 1].id);
    }
  };

  const currentLessonIndex = sortedLessons.findIndex(l => l.id === currentLessonId);
  const canGoPrevious = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex < sortedLessons.length - 1;

  if (loading || enrollmentLoading) return <LoadingPage />;

  if (!enrollment || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h1>
          <Link to={createPageUrl('MyLearning')}>
            <Button>Back to My Learning</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = enrollment.progress_percentage || 0;
  const isCurrentCompleted = completedLessons.includes(currentLesson?.id);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col", sidebarOpen && "lg:mr-80")}>
        {/* Header */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('MyLearning')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="hidden md:block">
              <h1 className="text-white font-medium truncate max-w-md">{course.title}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{completedLessons.length}/{sortedLessons.length} lessons</span>
                <span>•</span>
                <span>{progress}% complete</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white"
            >
              {sidebarOpen ? 'Hide' : 'Show'} Syllabus
            </Button>
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {currentLesson?.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center">
              {currentLesson.video_url ? (
                <video
                  src={currentLesson.video_url}
                  controls
                  className="max-w-full max-h-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-center text-white">
                  <Video className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Video content coming soon</p>
                  <p className="text-slate-400 mt-2">This lesson's video is being prepared</p>
                </div>
              )}
            </div>
          ) : currentLesson?.type === 'reading' ? (
            <div className="max-w-3xl w-full mx-auto p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
              <p className="text-slate-300 leading-relaxed">{currentLesson.description}</p>
            </div>
          ) : (
            <div className="text-center text-white">
              <FileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Lesson content</p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-16 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{currentLesson?.title}</span>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              <Clock className="w-3 h-3 mr-1" />
              {currentLesson?.duration_minutes || 10} min
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={goToPreviousLesson}
              disabled={!canGoPrevious}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>

            {!isCurrentCompleted ? (
              <Button 
                onClick={handleMarkComplete}
                disabled={markCompleteMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {markCompleteMutation.isPending ? 'Marking...' : 'Mark Complete'}
              </Button>
            ) : (
              <Button variant="outline" className="border-slate-600 text-slate-300" disabled>
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                Completed
              </Button>
            )}
            
            <Button 
              onClick={goToNextLesson}
              disabled={!canGoNext}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-800 border-l border-slate-700 flex flex-col z-20"
          >
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-semibold mb-3">Course Content</h2>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-slate-400 mt-2">
                {progressPercentage}% complete
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {sortedLessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonId(lesson.id)}
                      className={cn(
                        "w-full p-3 rounded-lg flex items-start gap-3 text-left transition-colors",
                        isCurrent 
                          ? "bg-violet-600/20 border border-violet-500/50"
                          : "hover:bg-slate-700/50",
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        isCompleted 
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-violet-500 text-white"
                          : "bg-slate-600 text-slate-400"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm truncate",
                          isCurrent ? "text-white" : "text-slate-300"
                        )}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          {lesson.type === 'video' && <Video className="w-3 h-3" />}
                          {lesson.type === 'reading' && <FileText className="w-3 h-3" />}
                          <span>{lesson.duration_minutes || 10} min</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Materials */}
            {currentLesson?.materials?.length > 0 && (
              <div className="p-4 border-t border-slate-700">
                <h3 className="text-white font-medium mb-3">Lesson Materials</h3>
                <div className="space-y-2">
                  {currentLesson.materials.map((material, index) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300 truncate">{material.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}