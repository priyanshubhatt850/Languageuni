import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';

export default function InstructorSchedule() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    live_class_date: '',
    live_class_link: '',
    duration_minutes: 60
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['instructor-courses', user?.id],
    queryFn: () => WWClient.entities.Course.filter({ instructor_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['instructor-lessons', user?.id],
    queryFn: async () => {
      const allLessons = [];
      for (const course of courses) {
        const courseLessons = await WWClient.entities.Lesson.filter({ 
          course_id: course.id,
          type: 'live'
        });
        allLessons.push(...courseLessons.map(l => ({ ...l, course_title: course.title })));
      }
      return allLessons;
    },
    enabled: courses.length > 0,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Lesson.create({
      ...data,
      type: 'live',
      order: 999
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-lessons']);
      setCreateDialogOpen(false);
      setFormData({
        course_id: '',
        title: '',
        live_class_date: '',
        live_class_link: '',
        duration_minutes: 60
      });
    }
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getLessonsForDay = (date) => {
    return lessons.filter(lesson => {
      if (!lesson.live_class_date) return false;
      return isSameDay(new Date(lesson.live_class_date), date);
    });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      live_class_date: format(date, "yyyy-MM-dd'T'HH:mm")
    });
    setCreateDialogOpen(true);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorSchedule" onLogout={handleLogout} />
      
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
                Class Schedule
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your live class schedule
              </p>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Class
            </Button>
          </motion.div>

          {/* Week Navigation */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'd, yyyy')}
                </h2>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {weekDays.map((day, index) => {
              const dayLessons = getLessonsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`border-0 shadow-sm min-h-[200px] cursor-pointer hover:shadow-md transition-shadow ${
                      isToday 
                        ? 'bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-500' 
                        : 'bg-white dark:bg-slate-800'
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <p className="text-xs text-slate-500 uppercase">
                        {format(day, 'EEE')}
                      </p>
                      <p className={`text-xl font-bold ${
                        isToday ? 'text-violet-600' : 'text-slate-900 dark:text-white'
                      }`}>
                        {format(day, 'd')}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {dayLessons.length === 0 ? (
                        <div className="text-center py-4">
                          <Plus className="w-4 h-4 mx-auto text-slate-300" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="font-medium text-violet-700 dark:text-violet-300 truncate">
                                {lesson.title}
                              </p>
                              <p className="text-violet-500 truncate text-xs">
                                {lesson.course_title}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-violet-600 dark:text-violet-400">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(new Date(lesson.live_class_date), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Create Class Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Live Class</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select 
                    value={formData.course_id} 
                    onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Live Q&A Session"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.live_class_date}
                    onChange={(e) => setFormData({ ...formData, live_class_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meeting Link (Zoom/Google Meet)</Label>
                  <Input
                    value={formData.live_class_link}
                    onChange={(e) => setFormData({ ...formData, live_class_link: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.course_id || !formData.title}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {createMutation.isPending ? 'Creating...' : 'Schedule Class'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}