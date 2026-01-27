import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  BookOpen,
  Search,
  Play,
  StopCircle,
  Clock,
  Video
} from 'lucide-react';
import { toast } from 'sonner';

const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const categories = ['General', 'Business', 'Conversation', 'Grammar', 'Vocabulary', 'Exam Prep'];

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-700',
  archived: 'bg-red-100 text-red-700',
};

export default function InstructorCourses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    level: 'A1',
    category: 'General',
    price: 0,
    discount_price: null,
    duration_hours: 0,
    total_lessons: 0,
    status: 'draft'
  });
  const [activeTimers, setActiveTimers] = useState({});
  const [timerIntervals, setTimerIntervals] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructor-courses', user?._id],
    queryFn: () => WWClient.entities.CourseLevel.filter({ instructor_id: user?._id }),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: instructorProfile } = useQuery({
    queryKey: ['instructor-profile', user?._id],
    queryFn: async () => {
      const profiles = await WWClient.entities.InstructorProfile.filter({ user_id: user?._id });
      return profiles[0];
    },
    enabled: !!user?.id
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['instructor-course-levels', user?._id],
    queryFn: () => WWClient.entities.CourseLevel.filter({ instructor_id: user?._id }),
    enabled: !!user?._id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Course.create({
      ...data,
      instructor_id: user._id,
      instructor_name: user.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      setCreateDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => WWClient.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      setCreateDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      language: '',
      level: 'A1',
      category: 'General',
      price: 0,
      discount_price: null,
      duration_hours: 0,
      total_lessons: 0,
      status: 'draft'
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      language: course.language || '',
      level: course.level || 'A1',
      category: course.category || 'General',
      price: course.price || 0,
      discount_price: course.discount_price || null,
      duration_hours: course.duration_hours || 0,
      total_lessons: course.total_lessons || 0,
      status: course.status || 'draft'
    });
    setCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLevels = courseLevels.filter(level =>
    level.level_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createMeetMutation = useMutation({
    mutationFn: async ({ levelId, levelName }) => {
      const response = await WWClient.functions.invoke('createMeetLink', {
        sessionId: `session_${levelId}_${Date.now()}`,
        courseName: levelName,
        startTime: new Date().toISOString(),
        duration: 2
      });
      return response.data;
    },
    onError: (error) => {
      console.error('Meet creation failed:', error);
    }
  });

  const startClassMutation = useMutation({
    mutationFn: async ({ levelId, levelName, startTime }) => {
      // Create session first
      const session = await WWClient.entities.TeachingSession.create({
        instructor_id: user.id,
        course_level_id: levelId,
        session_date: new Date().toISOString(),
        hours_taught: 0,
        hourly_rate: instructorProfile?.hourly_rate || 0,
        amount_earned: 0,
        status: 'pending'
      });

      // Try to create meet link
      let meetLink = null;
      try {
        const meetResult = await createMeetMutation.mutateAsync({ levelId, levelName });
        meetLink = meetResult.meetLink;
        
        // Update session with meet link
        if (meetLink) {
          await WWClient.entities.TeachingSession.update(session.id, {
            meet_link: meetLink
          });
        }
      } catch (error) {
        console.error('Could not create meet link:', error);
      }

      return { levelId, sessionId: session.id, startTime, meetLink };
    },
    onSuccess: ({ levelId, sessionId, startTime, meetLink }) => {
      setActiveTimers(prev => ({
        ...prev,
        [levelId]: { sessionId, startTime, elapsedSeconds: 0, meetLink }
      }));
      const interval = setInterval(() => {
        setActiveTimers(prev => {
          if (!prev[levelId]) return prev;
          return {
            ...prev,
            [levelId]: {
              ...prev[levelId],
              elapsedSeconds: Math.floor((Date.now() - prev[levelId].startTime) / 1000)
            }
          };
        });
      }, 1000);
      setTimerIntervals(prev => ({ ...prev, [levelId]: interval }));
      toast.success(meetLink ? 'Class started with Google Meet!' : 'Class timer started');
    }
  });

  const endClassMutation = useMutation({
    mutationFn: async ({ levelId, sessionId, elapsedSeconds }) => {
      const hoursWorked = elapsedSeconds / 3600;
      const hourlyRate = instructorProfile?.hourly_rate || 0;
      const amount = hoursWorked * hourlyRate;
      
      await WWClient.entities.TeachingSession.update(sessionId, {
        hours_taught: hoursWorked,
        amount_earned: amount
      });

      return { levelId, hoursWorked, amount };
    },
    onSuccess: ({ levelId, hoursWorked, amount }) => {
      if (timerIntervals[levelId]) {
        clearInterval(timerIntervals[levelId]);
        setTimerIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[levelId];
          return newIntervals;
        });
      }
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[levelId];
        return newTimers;
      });
      toast.success(`Class ended! ${hoursWorked.toFixed(2)} hours logged. Earned $${amount.toFixed(2)}`);
    }
  });

  const handleStartClass = (levelId, levelName) => {
    startClassMutation.mutate({ levelId, levelName, startTime: Date.now() });
  };

  const handleEndClass = (levelId) => {
    const timer = activeTimers[levelId];
    if (timer) {
      endClassMutation.mutate({
        levelId,
        sessionId: timer.sessionId,
        elapsedSeconds: timer.elapsedSeconds
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorCourses" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                My Courses
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your assigned courses
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Course Levels Grid */}
          {filteredLevels.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses assigned yet"
              description="Contact admin to get course levels assigned to you"
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLevels.map((level, index) => {
                const isTimerActive = !!activeTimers[level.id];
                const timer = activeTimers[level.id];
                
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden group">
                      <div className="relative aspect-video bg-gradient-to-br from-violet-500 to-purple-600">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-80" />
                            <p className="text-2xl font-bold">{level.level_name}</p>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className={statusColors[level.status]}>
                            {level.status}
                          </Badge>
                        </div>
                        {isTimerActive && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-red-500 text-white animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              LIVE
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                          {level.level_name}
                        </h3>

                        {level.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                            {level.description}
                          </p>
                        )}

                        {isTimerActive && (
                          <div className="mb-4 space-y-2">
                            <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Class in Progress</span>
                                <Clock className="w-4 h-4 text-violet-600" />
                              </div>
                              <div className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400">
                                {formatTime(timer?.elapsedSeconds || 0)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Rate: ${instructorProfile?.hourly_rate || 0}/hour
                              </div>
                            </div>
                            {timer?.meetLink && (
                              <Button
                                onClick={() => window.open(timer.meetLink, '_blank')}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Google Meet
                              </Button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {level.enrolled_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              {level.rating?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ${level.price}
                          </span>
                        </div>

                        {isTimerActive ? (
                          <Button 
                            onClick={() => handleEndClass(level.id)}
                            disabled={endClassMutation.isPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            End Class
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleStartClass(level.id, level.level_name)}
                            disabled={startClassMutation.isPending}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {startClassMutation.isPending ? 'Starting...' : 'Start Class'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Spanish for Beginners"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description & Learning Objectives</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your course and what students will learn..."
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">Include learning objectives and what students will achieve</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(v) => setFormData({ ...formData, language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(v) => setFormData({ ...formData, level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Price ($) - Optional</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.discount_price || ''}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Lessons</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.total_lessons}
                      onChange={(e) => setFormData({ ...formData, total_lessons: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingCourse ? 'Update Course' : 'Create Course'
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}