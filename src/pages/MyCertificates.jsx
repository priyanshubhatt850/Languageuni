import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  Share2,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function MyCertificates() {
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
    queryKey: ['my-certificates', user?.id],
    queryFn: () => WWClient.entities.Enrollment.filter({ 
      user_id: user?.id, 
      status: 'completed',
      certificate_issued: true 
    }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="MyCertificates" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Certificates
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your achievements and course completions
            </p>
          </motion.div>

          {enrollments.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates yet"
              description="Complete a course to earn your first certificate"
              action
              actionLabel="View My Courses"
              onAction={() => window.location.href = createPageUrl('MyLearning')}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment._id || enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-violet-500 to-purple-600 p-6">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBMMjAgMEwwIDIwTDIwIDIwTDIwIDQwTDQwIDIwTDIwIDIwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
                      
                      <div className="relative h-full flex flex-col items-center justify-center text-white text-center">
                        <Award className="w-12 h-12 mb-3" />
                        <h3 className="font-bold text-lg">Certificate of Completion</h3>
                        <p className="text-violet-200 text-sm mt-1">LinguaLearn</p>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/20 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {enrollment.course_title}
                      </h4>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Completed on {enrollment.completed_date 
                            ? format(new Date(enrollment.completed_date), 'MMM d, yyyy')
                            : 'N/A'
                          }
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}