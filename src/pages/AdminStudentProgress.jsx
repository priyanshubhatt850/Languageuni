import React, { useEffect, useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStudentProgress() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await WWClient.auth.me();
      if (userData?.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { data: allProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['admin-all-student-progress', filterStatus, filterLanguage],
    queryFn: async () => {
      let allProgressRecords = [];
      
      // Fetch all progress records
      const progressRecords = await WWClient.entities.StudentCourseLevelProgress.list('-updated_date', 1000);
      
      // Filter by status and language
      let filtered = progressRecords;
      if (filterStatus !== 'all') {
        filtered = filtered.filter(p => p.status === filterStatus);
      }
      if (filterLanguage !== 'all') {
        filtered = filtered.filter(p => p.language_id === filterLanguage);
      }

      // Enrich with user and course details
      const enriched = await Promise.all(
        filtered.map(async (p) => {
          try {
            const userList = await WWClient.entities.User.filter({ id: p.user_id });
            const courseLevel = await WWClient.entities.CourseLevel.filter({ id: p.course_level_id });
            const language = await WWClient.entities.Language.filter({ id: p.language_id });

            return {
              ...p,
              studentName: userList[0]?.full_name || 'Unknown',
              studentEmail: userList[0]?.email || 'Unknown',
              courseName: courseLevel[0]?.level_name || 'Unknown',
              languageName: language[0]?.name || 'Unknown'
            };
          } catch (e) {
            return p;
          }
        })
      );

      return enriched;
    },
    enabled: !!user?.id
  });

  const { data: languages } = useQuery({
    queryKey: ['languages-filter'],
    queryFn: () => WWClient.entities.Language.list('-display_order', 50),
  });

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  // Filter by search term
  const filtered = allProgress?.filter(p =>
    p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  // Statistics
  const stats = {
    totalRecords: allProgress?.length || 0,
    completedCount: allProgress?.filter(p => p.status === 'completed').length || 0,
    averageScore: allProgress && allProgress.length > 0
      ? Math.round(allProgress.reduce((sum, p) => sum + p.overall_quiz_score, 0) / allProgress.length)
      : 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Student Progress Monitoring</h1>
          <p className="text-muted-foreground mt-2">Track and analyze student performance across all courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Progress Records</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalRecords}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Courses</p>
                  <p className="text-3xl font-bold mt-1">{stats.completedCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                  <p className="text-3xl font-bold mt-1">{stats.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or course..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages?.map(lang => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Progress Details</CardTitle>
            <CardDescription>Showing {filtered.length} results</CardDescription>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <LoadingSpinner />
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Course Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Progress</TableHead>
                      <TableHead className="text-right">Quiz Score</TableHead>
                      <TableHead className="text-right">Exercise Score</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(progress => (
                      <TableRow key={progress.id}>
                        <TableCell className="font-medium">{progress.studentName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{progress.studentEmail}</TableCell>
                        <TableCell>{progress.languageName}</TableCell>
                        <TableCell>{progress.courseName}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[progress.status]}>
                            {progress.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{progress.progress_percentage}%</TableCell>
                        <TableCell className="text-right">{Math.round(progress.overall_quiz_score)}%</TableCell>
                        <TableCell className="text-right">{Math.round(progress.overall_exercise_score)}%</TableCell>
                        <TableCell className="text-sm">
                          {progress.last_activity_date 
                            ? format(new Date(progress.last_activity_date), 'MMM d, yyyy')
                            : 'No activity'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No progress records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}