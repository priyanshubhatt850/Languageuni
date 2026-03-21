import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, BookOpen, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentLiveSessions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['student-enrollments', user?._id],
    queryFn: () => WWClient.entities.Enrollment.filter({ user_id: user?._id, status: 'active' }),
    enabled: !!user?._id,
    initialData: []
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['enrolled-course-levels'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages-for-sessions'],
    queryFn: () => WWClient.entities.Language.list(),
    initialData: []
  });

  const { data: allSessions = [] } = useQuery({
    queryKey: ['teaching-sessions-student'],
    queryFn: () => WWClient.entities.TeachingSession.filter({ status: 'approved' }, '-session_date'),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['student-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  // Filter sessions for enrolled courses
  const enrolledCourseIds = enrollments.map(e => e.course_id);
  const relevantSessions = allSessions.filter(session => 
    enrolledCourseIds.includes(session.course_level_id) && session.meet_link
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="StudentLiveSessions" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Live Sessions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Join your instructor's live classes via Google Meet
            </p>
          </motion.div>

          {/* Sessions Grid */}
          {relevantSessions.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No Live Sessions Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your instructors haven't scheduled any live sessions yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relevantSessions.map((session, index) => {
                const courseLevel = courseLevels.find(c => c._id === session.course_level_id);
                const language = languages.find(l => l._id === courseLevel?.language_id);

                return (
                  <motion.div
                    key={session._id || session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden group hover:shadow-lg transition-all">
                      <div className="relative aspect-video bg-gradient-to-br from-emerald-500 to-teal-600">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Video className="w-16 h-16 mx-auto mb-2 opacity-80" />
                            <p className="text-xl font-bold">Live Class</p>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-500 text-white">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            LIVE
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {language && <span className="text-2xl">{language.flag}</span>}
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {courseLevel?.level_name || 'Language Course'}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.session_date), 'MMM d, yyyy')}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            {format(new Date(session.session_date), 'HH:mm')} ({session.hours_taught}h)
                          </div>
                        </div>

                        <Button
                          onClick={() => window.open(session.meet_link, '_blank')}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Join Google Meet
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}