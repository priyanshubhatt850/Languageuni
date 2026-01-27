import React, { useEffect, useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressCard from '@/components/progress/ProgressCard';
import { BarChart3, TrendingUp, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentProgress() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['student-progress', user?.id],
    queryFn: async () => {
      const progress = await WWClient.entities.StudentCourseLevelProgress.filter(
        { user_id: user?.id },
        '-updated_date'
      );
      
      // Fetch language and course level details for each progress record
      const enrichedProgress = await Promise.all(
        progress.map(async (p) => {
          const language = await WWClient.entities.Language.filter({ id: p.language_id });
          const courseLevel = await WWClient.entities.CourseLevel.filter({ id: p.course_level_id });
          
          return {
            ...p,
            language: language[0]?.name || 'Unknown',
            courseName: courseLevel[0]?.level_name || 'Unknown'
          };
        })
      );
      
      return enrichedProgress;
    },
    enabled: !!user?.id
  });

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  if (progressLoading) {
    return <LoadingSpinner />;
  }

  // Calculate overall statistics
  const totalCourses = progressData?.length || 0;
  const completedCourses = progressData?.filter(p => p.status === 'completed').length || 0;
  const averageScore = progressData && progressData.length > 0
    ? Math.round((progressData.reduce((sum, p) => sum + p.overall_quiz_score, 0) / progressData.length))
    : 0;
  const totalTimeSpent = progressData?.reduce((sum, p) => sum + p.time_spent_minutes, 0) || 0;

  const inProgressCourses = progressData?.filter(p => p.status === 'in_progress') || [];
  const completedCoursesList = progressData?.filter(p => p.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Your Learning Progress</h1>
          <p className="text-muted-foreground mt-2">Track your performance across all courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-3xl font-bold mt-1">{totalCourses}</p>
                </div>
                <Award className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-1">{completedCourses}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold mt-1">{averageScore}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-3xl font-bold mt-1">{Math.round(totalTimeSpent / 60)}h</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Tab */}
        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCoursesList.length})</TabsTrigger>
            <TabsTrigger value="all">All Courses ({totalCourses})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgressCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressCourses.map(progress => (
                  <ProgressCard 
                    key={progress.id} 
                    progress={progress}
                    courseName={progress.courseName}
                    language={progress.language}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No courses in progress. Start learning today!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCoursesList.map(progress => (
                  <ProgressCard 
                    key={progress.id} 
                    progress={progress}
                    courseName={progress.courseName}
                    language={progress.language}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No completed courses yet. Keep learning!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {progressData && progressData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.map(progress => (
                  <ProgressCard 
                    key={progress.id} 
                    progress={progress}
                    courseName={progress.courseName}
                    language={progress.language}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No courses enrolled yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}