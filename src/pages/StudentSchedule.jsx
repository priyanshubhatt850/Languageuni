import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';

export default function StudentSchedule() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?._id],
    queryFn: () => WWClient.entities.Enrollment.filter({ user_id: user?._id }),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['scheduled-lessons'],
    queryFn: async () => {
      // Get all lessons that are live classes from enrolled courses
      const courseIds = enrollments.map(e => e.course_id);
      const allLessons = [];
      for (const courseId of courseIds) {
        const courseLessons = await WWClient.entities.Lesson.filter({ 
          course_id: courseId,
          type: 'live'
        });
        allLessons.push(...courseLessons);
      }
      return allLessons;
    },
    enabled: enrollments.length > 0,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getLessonsForDay = (date) => {
    return lessons.filter(lesson => {
      if (!lesson.live_class_date) return false;
      return isSameDay(new Date(lesson.live_class_date), date);
    });
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="StudentSchedule" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Class Schedule
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View your upcoming live classes
            </p>
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
                  <Card className={`border-0 shadow-sm min-h-[200px] ${
                    isToday 
                      ? 'bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-500' 
                      : 'bg-white dark:bg-slate-800'
                  }`}>
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
                        <p className="text-xs text-slate-400 text-center py-4">
                          No classes
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {dayLessons.map((lesson) => (
                            <div
                              key={lesson._id || lesson.id}
                              className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-xs"
                            >
                              <p className="font-medium text-violet-700 dark:text-violet-300 truncate">
                                {lesson.title}
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

          {/* Upcoming Classes List */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mt-6">
            <CardHeader>
              <CardTitle>Upcoming Live Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.filter(l => new Date(l.live_class_date) > new Date()).length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming classes"
                  description="You don't have any scheduled live classes at the moment"
                />
              ) : (
                <div className="space-y-4">
                  {lessons
                    .filter(l => new Date(l.live_class_date) > new Date())
                    .sort((a, b) => new Date(a.live_class_date) - new Date(b.live_class_date))
                    .slice(0, 5)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Video className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(lesson.live_class_date), 'MMM d, yyyy')}
                              </span>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>
                                {format(new Date(lesson.live_class_date), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {lesson.live_class_link && (
                          <a href={lesson.live_class_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-violet-600 hover:bg-violet-700">
                              Join Class
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}