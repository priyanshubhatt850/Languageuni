import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { motion } from 'framer-motion';
import {
  Search,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

export default function InstructorStudents() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

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

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['instructor-enrollments', user?.id],
    queryFn: () => WWClient.entities.Enrollment.filter({ instructor_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || enrollment.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorStudents" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Students
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track and manage your enrolled students
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Students', value: new Set(enrollments.map(e => e.user_id)).size },
              { label: 'Active Enrollments', value: enrollments.filter(e => e.status === 'active').length },
              { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length },
              { label: 'Avg Progress', value: `${Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / (enrollments.length || 1))}%` },
            ].map((stat) => (
              <Card key={stat.label} className="border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full md:w-60">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-violet-100 text-violet-700">
                                {enrollment.user_name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {enrollment.user_name || 'Student'}
                              </p>
                              <p className="text-sm text-slate-500">{enrollment.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span className="truncate max-w-[150px]">{enrollment.course_title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.enrolled_date 
                            ? format(new Date(enrollment.enrolled_date), 'MMM d, yyyy')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={enrollment.progress_percentage || 0} className="flex-1 h-2" />
                            <span className="text-sm text-slate-500 w-10">
                              {enrollment.progress_percentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            enrollment.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : enrollment.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}