import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  FileText,
  Video,
  Image,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminContent() {
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

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => WWClient.entities.Lesson.list('-created_date'),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const videoLessons = lessons.filter(l => l.type === 'video');
  const readingLessons = lessons.filter(l => l.type === 'reading');
  const quizLessons = lessons.filter(l => l.type === 'quiz');

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  const ContentCard = ({ lesson }) => (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        {lesson.type === 'video' ? (
          <Video className="w-12 h-12 text-slate-300" />
        ) : lesson.type === 'reading' ? (
          <FileText className="w-12 h-12 text-slate-300" />
        ) : (
          <FileText className="w-12 h-12 text-slate-300" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {lesson.type}
          </Badge>
          {lesson.is_free_preview && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">Free</Badge>
          )}
        </div>
        <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2 mb-2">
          {lesson.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {lesson.duration_minutes || 10} minutes
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminContent" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Content Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage course content and learning materials
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Video className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Videos</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{videoLessons.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reading</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{readingLessons.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Quizzes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{quizLessons.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Image className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{lessons.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-xl mb-6">
              <TabsTrigger value="all" className="rounded-lg">All Content</TabsTrigger>
              <TabsTrigger value="videos" className="rounded-lg">Videos</TabsTrigger>
              <TabsTrigger value="reading" className="rounded-lg">Reading</TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-lg">Quizzes</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {lessons.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No content yet"
                  description="Content will appear here when instructors create lessons"
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lessons.slice(0, 12).map((lesson) => (
                    <ContentCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos">
              {videoLessons.length === 0 ? (
                <EmptyState icon={Video} title="No videos" description="No video lessons available" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {videoLessons.map((lesson) => (
                    <ContentCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reading">
              {readingLessons.length === 0 ? (
                <EmptyState icon={FileText} title="No reading materials" description="No reading lessons available" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {readingLessons.map((lesson) => (
                    <ContentCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quizzes">
              {quizLessons.length === 0 ? (
                <EmptyState icon={FileText} title="No quizzes" description="No quiz lessons available" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quizLessons.map((lesson) => (
                    <ContentCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}