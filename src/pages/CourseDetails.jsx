import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { triggerBookCelebration } from '@/components/common/BookCelebration';
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Globe,
  Award,
  FileText,
  Video,
  Lock,
  Share2,
  Heart,
  MessageCircle,
  CalendarDays,
  Shield,
  Check
} from 'lucide-react';

const levelColors = {
  A1: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30',
  A2: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-100 dark:border-teal-900/30',
  B1: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30',
  B2: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30',
  C1: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-100 dark:border-violet-900/30',
  C2: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30',
};

export default function CourseDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await WWClient.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = await WWClient.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await WWClient.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => WWClient.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
    initialData: []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => WWClient.entities.Review.filter({ course_id: courseId }),
    enabled: !!courseId,
    initialData: []
  });

  const { data: enrollment } = useQuery({
    queryKey: ['my-enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const enrollments = await WWClient.entities.Enrollment.filter({ 
        course_id: courseId, 
        user_id: user.id 
      });
      return enrollments[0];
    },
    enabled: !!courseId && !!user?.id
  });

  const { data: myRating } = useQuery({
    queryKey: ['my-rating', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !course?.instructor_id) return null;
      const ratings = await WWClient.entities.InstructorRating.filter({ 
        student_id: user.id,
        course_id: courseId
      });
      return ratings[0];
    },
    enabled: !!courseId && !!user?.id && !!course?.instructor_id
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await WWClient.entities.Enrollment.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        course_id: courseId,
        course_title: course.title,
        instructor_id: course.instructor_id,
        payment_amount: course.discount_price || course.price,
        payment_status: 'completed',
        enrolled_date: new Date().toISOString(),
        completed_lessons: []
      });
    },
    onSuccess: () => {
      triggerBookCelebration();
      toast.success('Welcome to the course! Your learning journey begins now! 📚');
      queryClient.invalidateQueries(['my-enrollment', courseId]);
    }
  });

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      if (myRating) {
        return await WWClient.entities.InstructorRating.update(myRating.id, {
          rating: ratingValue,
          comment: ratingComment
        });
      } else {
        return await WWClient.entities.InstructorRating.create({
          student_id: user.id,
          instructor_id: course.instructor_id,
          course_id: courseId,
          rating: ratingValue,
          comment: ratingComment
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rating', courseId]);
      setShowRatingDialog(false);
      toast.success(myRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      setRatingComment('');
    }
  });

  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalDuration = sortedLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (courseLoading) return <LoadingPage />;
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Course not found</h1>
          <Link to={createPageUrl('CourseCatalog')}>
            <Button className="bg-violet-600 hover:bg-violet-755 text-white rounded-xl">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      WWClient.auth.redirectToLogin(window.location.href);
      return;
    }
    enrollMutation.mutate();
  };

  const handleRateInstructor = () => {
    if (myRating) {
      setRatingValue(myRating.rating);
      setRatingComment(myRating.comment || '');
    }
    setShowRatingDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/65 dark:border-slate-900/65 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to={createPageUrl('CourseCatalog')}>
              <Button variant="ghost" size="icon" className="hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {course.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">
                <Heart className="w-5 h-5 text-slate-500 hover:text-rose-500 transition-colors" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">
                <Share2 className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=450&fit=crop`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <Button 
                  size="lg" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/95 hover:bg-white text-violet-650 hover:scale-105 shadow-xl transition-all"
                >
                  <Play className="w-6 h-6 ml-1 text-violet-600 fill-violet-600" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`${levelColors[course.level] || 'bg-slate-100 text-slate-700'} font-bold rounded-lg px-2.5 py-0.5 text-xs`}>
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded-lg px-2.5 py-0.5 text-xs border-none">
                  {course.language}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded-lg px-2.5 py-0.5 text-xs border-none">
                  {course.category || 'Standard'}
                </Badge>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <span>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled_count || 0} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours || Math.round(totalDuration / 60)}h total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{sortedLessons.length} lessons</span>
                </div>
              </div>
            </motion.div>

            {/* Tabs content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6 border border-slate-200/30 dark:border-slate-800/30">
                <TabsTrigger value="overview" className="rounded-lg font-bold text-xs uppercase tracking-wider py-2">Overview</TabsTrigger>
                <TabsTrigger value="curriculum" className="rounded-lg font-bold text-xs uppercase tracking-wider py-2">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg font-bold text-xs uppercase tracking-wider py-2">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        About This Course
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        {course.description || 'No description available'}
                      </p>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Course Features & Structure
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-3.5">
                        {course.has_live_classes && (
                          <div className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Live classes via Google Meet with shared links</span>
                          </div>
                        )}
                        {course.has_recorded_lectures && (
                          <div className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Recorded video lectures for all sessions</span>
                          </div>
                        )}
                        {course.includes_materials && (
                          <div className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Complete study materials and books included</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Structured CEFR levels (A1 to C2)</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Organized lessons with practice content</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Supporting resources for each level</span>
                        </div>
                      </div>
                    </div>

                    {course.level_structure && (
                      <>
                        <Separator className="bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Level Structure
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(course.level_structure).map(([level, data]) => (
                              <div key={level} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <Badge className={`${levelColors[level] || 'bg-slate-100 text-slate-700'} mb-2.5 font-bold px-2.5 py-0.5 text-[10px] rounded-md`}>{level}</Badge>
                                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-450 font-medium">
                                  {data.lessons_count && <p>• {data.lessons_count} lessons</p>}
                                  {data.practice_exercises && <p>• {data.practice_exercises} practice exercises</p>}
                                  {data.resources?.length > 0 && <p>• {data.resources.length} additional resources</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        What You'll Learn
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3 mb-2">
                        {(course.features || [
                          'Master essential grammar concepts',
                          'Build comprehensive vocabulary',
                          'Develop conversational fluency',
                          'Understand cultural context',
                          'Practice with native speakers',
                          'Prepare for language certifications'
                        ]).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Requirements
                      </h4>
                      <ul className="list-disc list-inside text-sm text-slate-650 dark:text-slate-400 space-y-1.5 pl-1.5 font-medium">
                        <li>No prior knowledge required for A1 level</li>
                        <li>A computer or tablet with internet access</li>
                        <li>Dedication and motivation to learn</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-0">
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Course Content
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {sortedLessons.length} lessons • {Math.round(totalDuration / 60)}h total
                      </p>
                    </div>

                    {sortedLessons.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-12 text-sm font-medium">
                        No lessons available yet.
                      </p>
                    ) : (
                      <Accordion type="single" collapsible className="space-y-3">
                        {sortedLessons.map((lesson, index) => (
                          <AccordionItem 
                            key={lesson.id} 
                            value={lesson.id}
                            className="border border-slate-200 dark:border-slate-800/80 rounded-2xl px-5 bg-white dark:bg-slate-900 overflow-hidden"
                          >
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100/50 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs">
                                  {index + 1}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-violet-600 transition-colors">
                                    {lesson.title}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    {lesson.type === 'video' && <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />Video</span>}
                                    {lesson.type === 'live' && <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-violet-500" />Live</span>}
                                    {lesson.type === 'reading' && <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />Reading</span>}
                                    <span>•</span>
                                    <span>{lesson.duration_minutes || 10} min</span>
                                    {lesson.level && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded border-slate-200 dark:border-slate-800">{lesson.level}</Badge>
                                      </>
                                    )}
                                    {lesson.live_class_link && <span className="text-violet-600 font-semibold">• Live Class</span>}
                                    {lesson.has_recording && <span>• Recording available</span>}
                                    {!lesson.is_free_preview && !enrollment && (
                                      <Lock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              <div className="pl-12 space-y-4">
                                <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed">
                                  {lesson.description || 'No description available'}
                                </p>
                                
                                {lesson.live_class_link && (
                                  <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850/60">
                                    <CalendarDays className="w-4 h-4 text-violet-500" />
                                    <span className="text-slate-650 dark:text-slate-400 font-semibold">
                                      Class Date: {lesson.live_class_date ? new Date(lesson.live_class_date).toLocaleString() : 'TBD'}
                                    </span>
                                    {enrollment && (
                                      <a href={lesson.live_class_link} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1 h-8 text-[11px] font-bold">
                                          Join Google Meet
                                        </Button>
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                {lesson.materials?.length > 0 && (
                                  <div className="text-xs space-y-1.5">
                                    <p className="text-slate-800 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">Materials:</p>
                                    <ul className="space-y-1">
                                      {lesson.materials.map((material, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-550 dark:text-slate-400 font-medium">
                                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                                          {material.name} ({material.type})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {lesson.practice_content?.length > 0 && (
                                  <div className="text-xs space-y-1.5">
                                    <p className="text-slate-800 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">Practice Assignments:</p>
                                    <ul className="space-y-1">
                                      {lesson.practice_content.map((practice, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-550 dark:text-slate-400 font-medium">
                                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          {practice.title} ({practice.type})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                      <div className="text-center md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-10">
                        <p className="text-5xl font-black text-slate-900 dark:text-white leading-none">
                          {avgRating.toFixed(1)}
                        </p>
                        <div className="flex items-center gap-0.5 my-3 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= avgRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-800'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 w-full space-y-2 max-w-md">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviews.filter(r => r.rating === rating).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500 w-6 text-right">{rating}★</span>
                              <Progress value={percentage} className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 [&>div]:bg-violet-600" />
                              <span className="text-xs font-semibold text-slate-400 w-6">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800 mb-6" />

                    {reviews.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-10 text-sm font-medium">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50">
                            <Avatar className="w-10 h-10 border border-slate-100">
                              <AvatarFallback className="bg-violet-50 text-violet-700 font-bold text-sm">
                                {review.user_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                  {review.user_name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed font-light">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Checkout Sticky Widget */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 sticky top-24 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-baseline gap-2">
                  {course.discount_price ? (
                    <>
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        ${course.discount_price}
                      </span>
                      <span className="text-lg text-slate-455 line-through">
                        ${course.price}
                      </span>
                      <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold border border-rose-100 dark:border-rose-900/30 text-[10px] uppercase rounded px-1.5 py-0.5">
                        {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      ${course.price}
                    </span>
                  )}
                </div>

                {enrollment ? (
                  <div className="space-y-3">
                    <Link to={createPageUrl(`CoursePlayer?enrollmentId=${enrollment.id}`)}>
                      <Button className="w-full bg-violet-600 hover:bg-violet-755 text-white h-12 text-sm font-bold shadow-md shadow-violet-600/25 hover:shadow-lg rounded-xl">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-sm font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl"
                      onClick={handleRateInstructor}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {myRating ? 'Update Rating' : 'Rate Instructor'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-755 text-white h-12 text-sm font-bold shadow-md shadow-violet-600/25 hover:shadow-lg rounded-xl"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}

                <p className="text-center text-xs font-semibold text-slate-400">
                  🔒 30-day money-back guarantee
                </p>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    This course includes:
                  </h4>
                  <div className="space-y-3.5 text-slate-650 dark:text-slate-400 text-xs font-semibold">
                    {course.has_live_classes && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4.5 h-4.5 text-violet-500" />
                        <span>Live classes via Google Meet</span>
                      </div>
                    )}
                    {course.has_recorded_lectures && (
                      <div className="flex items-center gap-3">
                        <Video className="w-4.5 h-4.5 text-violet-500" />
                        <span>Recorded lectures for reference</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Video className="w-4.5 h-4.5 text-violet-500" />
                      <span>{sortedLessons.filter(l => l.type === 'video').length} video lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4.5 h-4.5 text-violet-500" />
                      <span>{sortedLessons.filter(l => l.type === 'live').length} live sessions</span>
                    </div>
                    {course.includes_materials && (
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4.5 h-4.5 text-violet-500" />
                        <span>Complete study materials & books</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <FileText className="w-4.5 h-4.5 text-violet-500" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4.5 h-4.5 text-violet-500" />
                      <span>Access on mobile and web</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4.5 h-4.5 text-violet-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4.5 h-4.5 text-violet-500" />
                      <span>Instructor Q&A support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Details Card */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Your Instructor
                </h4>
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-slate-100">
                    <AvatarFallback className="bg-violet-50 text-violet-700 text-lg font-bold">
                      {course.instructor_name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {course.instructor_name || 'Instructor'}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">Native Speaker & Expert</p>
                    <div className="flex items-center gap-1 pt-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        4.8 rating
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md border border-slate-200 dark:border-slate-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white font-extrabold text-lg">Rate Your Instructor</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Share your experience with this instructor to help other students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex items-center justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingValue
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Your Review
              </label>
              <Textarea
                placeholder="Tell us about your experience with this instructor..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="resize-none rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-violet-500 text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingDialog(false)}
                className="flex-1 rounded-xl h-11 border-slate-200 dark:border-slate-850 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitRatingMutation.mutate()}
                disabled={submitRatingMutation.isPending}
                className="flex-1 bg-violet-600 hover:bg-violet-755 text-white rounded-xl h-11 font-semibold"
              >
                {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}