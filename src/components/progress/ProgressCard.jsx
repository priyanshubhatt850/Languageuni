import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen, BarChart3, Zap } from 'lucide-react';

export default function ProgressCard({ progress, courseName, language }) {
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{courseName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{language}</p>
          </div>
          <Badge className={statusColors[progress.status]}>
            {progress.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-semibold">{progress.progress_percentage}%</span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Lessons</p>
            <p className="text-lg font-semibold">{progress.total_lessons_completed}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Quiz Score</p>
            <p className="text-lg font-semibold">{Math.round(progress.overall_quiz_score)}%</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-2 text-center">
            <div className="flex justify-center mb-1">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Exercise Score</p>
            <p className="text-lg font-semibold">{Math.round(progress.overall_exercise_score)}%</p>
          </div>
        </div>

        {progress.last_activity_date && (
          <p className="text-xs text-muted-foreground text-center">
            Last activity: {format(new Date(progress.last_activity_date), 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}