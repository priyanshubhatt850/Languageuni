import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CalendarDays
} from 'lucide-react';

const levelColors = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-violet-100 text-violet-700',
  C2: 'bg-purple-100 text-purple-700',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h1>
          <Link to={createPageUrl('CourseCatalog')}>
            <Button>Browse Courses</Button>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to={createPageUrl('CourseCatalog')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {course.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img
                  src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=450&fit=crop`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Button 
                  size="lg" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 hover:bg-white text-violet-600"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={levelColors[course.level]}>{course.level}</Badge>
                <Badge variant="secondary">{course.language}</Badge>
                <Badge variant="secondary">{course.category}</Badge>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <span>({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5" />
                  <span>{course.enrolled_count || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_hours || Math.round(totalDuration / 60)}h total</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-5 h-5" />
                  <span>{sortedLessons.length} lessons</span>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-white dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="curriculum" className="rounded-lg">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                      About This Course
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {course.description || 'No description available'}
                    </p>

                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Course Features & Structure
                    </h4>
                    
                    {/* Key Features */}
                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                      {course.has_live_classes && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400">Live classes via Google Meet with shareable links</span>
                        </div>
                      )}
                      {course.has_recorded_lectures && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400">Recorded video lectures for all sessions</span>
                        </div>
                      )}
                      {course.includes_materials && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400">Complete study materials and books included</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">Structured levels (A1, A2, B1, B2)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">Organized lessons with practice content</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">Supporting resources for each level</span>
                      </div>
                    </div>

                    {/* Level Structure */}
                    {course.level_structure && (
                      <>
                        <Separator className="my-6" />
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                          Level Structure
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(course.level_structure).map(([level, data]) => (
                            <div key={level} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <Badge className={levelColors[level] + " mb-2"}>{level}</Badge>
                              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                {data.lessons_count && <p>• {data.lessons_count} lessons</p>}
                                {data.practice_exercises && <p>• {data.practice_exercises} practice exercises</p>}
                                {data.resources?.length > 0 && <p>• {data.resources.length} additional resources</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <Separator className="my-6" />

                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      What You'll Learn
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                      {(course.features || [
                        'Master essential grammar concepts',
                        'Build comprehensive vocabulary',
                        'Develop conversational fluency',
                        'Understand cultural context',
                        'Practice with native speakers',
                        'Prepare for language certifications'
                      ]).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Requirements
                    </h4>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                      <li>No prior knowledge required for A1 level</li>
                      <li>A computer or tablet with internet access</li>
                      <li>Dedication and motivation to learn</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Course Content
                      </h3>
                      <p className="text-slate-500">
                        {sortedLessons.length} lessons • {Math.round(totalDuration / 60)}h total
                      </p>
                    </div>

                    {sortedLessons.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">
                        No lessons available yet
                      </p>
                    ) : (
                      <Accordion type="single" collapsible className="space-y-2">
                        {sortedLessons.map((lesson, index) => (
                          <AccordionItem 
                            key={lesson.id} 
                            value={lesson.id}
                            className="border rounded-xl px-4 bg-slate-50 dark:bg-slate-700/50"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-sm text-slate-500">
                                    {lesson.type === 'video' && <Video className="w-4 h-4" />}
                                    {lesson.type === 'live' && <CalendarDays className="w-4 h-4" />}
                                    {lesson.type === 'reading' && <FileText className="w-4 h-4" />}
                                    <span>{lesson.duration_minutes || 10} min</span>
                                    {lesson.level && <Badge variant="outline" className="text-xs">{lesson.level}</Badge>}
                                    {lesson.live_class_link && <span className="text-violet-600">• Live</span>}
                                    {lesson.has_recording && <span>• Recorded</span>}
                                    {!lesson.is_free_preview && !enrollment && (
                                      <Lock className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-12 space-y-3">
                                <p className="text-slate-600 dark:text-slate-400">
                                  {lesson.description || 'No description available'}
                                </p>
                                
                                {lesson.live_class_link && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="w-4 h-4 text-violet-500" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                      Live class: {lesson.live_class_date ? new Date(lesson.live_class_date).toLocaleString() : 'TBD'}
                                    </span>
                                    {enrollment && (
                                      <a href={lesson.live_class_link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                                        Join Meeting
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                {lesson.materials?.length > 0 && (
                                  <div className="text-sm">
                                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">Materials:</p>
                                    <ul className="space-y-1">
                                      {lesson.materials.map((material, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-500">
                                          <FileText className="w-3 h-3" />
                                          {material.name} ({material.type})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {lesson.practice_content?.length > 0 && (
                                  <div className="text-sm">
                                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">Practice Content:</p>
                                    <ul className="space-y-1">
                                      {lesson.practice_content.map((practice, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-500">
                                          <CheckCircle className="w-3 h-3" />
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

              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-slate-900 dark:text-white">
                          {avgRating.toFixed(1)}
                        </p>
                        <div className="flex items-center gap-1 my-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-5 h-5 ${star <= avgRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-500">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviews.filter(r => r.rating === rating).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="text-sm text-slate-500 w-8">{rating}★</span>
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className="text-sm text-slate-500 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {reviews.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="flex gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-violet-100 text-violet-700">
                                {review.user_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {review.user_name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  {course.discount_price ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        ${course.discount_price}
                      </span>
                      <span className="text-xl text-slate-400 line-through">
                        ${course.price}
                      </span>
                      <Badge className="bg-red-100 text-red-700">
                        {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${course.price}
                    </span>
                  )}
                </div>

                {enrollment ? (
                  <>
                    <Link to={createPageUrl(`CoursePlayer?enrollmentId=${enrollment.id}`)}>
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg mb-3">
                        <Play className="w-5 h-5 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-lg"
                      onClick={handleRateInstructor}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      {myRating ? 'Update Rating' : 'Rate Instructor'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}

                <p className="text-center text-sm text-slate-500 mt-4">
                  30-day money-back guarantee
                </p>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    This course includes:
                  </h4>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    {course.has_live_classes && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-violet-500" />
                        <span>Live classes via Google Meet</span>
                      </div>
                    )}
                    {course.has_recorded_lectures && (
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-violet-500" />
                        <span>Recorded video lectures for all sessions</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-violet-500" />
                      <span>{sortedLessons.filter(l => l.type === 'video').length} video lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-violet-500" />
                      <span>{sortedLessons.filter(l => l.type === 'live').length} live sessions</span>
                    </div>
                    {course.includes_materials && (
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-violet-500" />
                        <span>Complete study materials & books</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-violet-500" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-violet-500" />
                      <span>Access on mobile and TV</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-violet-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-violet-500" />
                      <span>Instructor Q&A support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Your Instructor
                </h4>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xl">
                      {course.instructor_name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {course.instructor_name || 'Instructor'}
                    </p>
                    <p className="text-sm text-slate-500">Language Expert</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        4.8 instructor rating
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{myRating ? 'Update' : 'Rate'} Your Instructor</DialogTitle>
            <DialogDescription>
              Share your experience with this instructor to help other students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingValue
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Your Review (Optional)
              </label>
              <Textarea
                placeholder="Tell us about your experience with this instructor..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitRatingMutation.mutate()}
                disabled={submitRatingMutation.isPending}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
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