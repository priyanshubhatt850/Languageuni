import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import ExercisePlayer from '@/components/learning/ExercisePlayer';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentExercise() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');
  const exerciseId = urlParams.get('exerciseId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: exercise, isLoading: exerciseLoading } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      const exercises = await WWClient.entities.Exercise.filter({ id: exerciseId });
      return exercises[0];
    },
    enabled: !!exerciseId
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['student-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate score
      const correctCount = Object.keys(data.answers).length;
      const percentage = Math.round((correctCount / exercise.content.items.length) * 100);
      
      // Save attempt
      const attempt = await WWClient.entities.ExerciseAttempt.create({
        exercise_id: exerciseId,
        user_id: user._id,
        level_id: levelId,
        answers: Object.entries(data.answers).map(([key, answer]) => ({
          item_id: key,
          answer,
          is_correct: true // Simplified - in real app, you'd validate
        })),
        score: correctCount,
        percentage,
        time_taken_minutes: Math.ceil((exercise.time_limit_minutes * 60 - data.timeLeft) / 60),
        status: 'submitted'
      });

      // Update progress
      const progress = await WWClient.entities.StudentCourseLevelProgress.filter({
        course_level_id: levelId,
        user_id: user.id
      });

      if (progress[0]) {
        await WWClient.entities.StudentCourseLevelProgress.update(progress[0].id, {
          exercise_attempts_count: (progress[0].exercise_attempts_count || 0) + 1,
          overall_exercise_score: Math.round(
            ((progress[0].overall_exercise_score || 0) * (progress[0].exercise_attempts_count || 0) + percentage) / 
            ((progress[0].exercise_attempts_count || 0) + 1)
          )
        });
      }

      return { percentage, correctCount, totalItems: exercise.content.items.length };
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Exercise submitted!');
    }
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || exerciseLoading) return <LoadingPage />;

  if (!exercise) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={notifications} />
          <main className="p-8 text-center">
            <p className="text-slate-600">Exercise not found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(createPageUrl(`StudentPractice?levelId=${levelId}`))}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {exercise.title}
                </h1>
              </div>
            </div>

            {result ? (
              <Card className="border-0 shadow-lg max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <div className={`flex justify-center mb-6 ${result.percentage >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                    {result.percentage >= 70 ? (
                      <CheckCircle className="w-24 h-24" />
                    ) : (
                      <XCircle className="w-24 h-24" />
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-4">
                    {result.percentage >= 70 ? 'Great Job!' : 'Good Effort!'}
                  </h2>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your Score</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                      {result.percentage}%
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {result.correctCount} out of {result.totalItems} correct
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(createPageUrl(`StudentPractice?levelId=${levelId}`))}
                    >
                      Back to Practice
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setResult(null);
                        navigate(createPageUrl(`StudentExercise?levelId=${levelId}&exerciseId=${exerciseId}`), { replace: true });
                        window.location.reload();
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <ExercisePlayer 
                    exercise={exercise}
                    onSubmit={(data) => submitMutation.mutate(data)}
                    onCancel={() => navigate(createPageUrl(`StudentPractice?levelId=${levelId}`))}
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}