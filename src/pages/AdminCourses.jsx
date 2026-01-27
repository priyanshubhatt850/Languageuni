import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-700',
  archived: 'bg-red-100 text-red-700',
};

export default function AdminCourses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => WWClient.entities.Course.list('-created_date'),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId) => WWClient.entities.Course.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => WWClient.entities.Course.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
    }
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || course.language === languageFilter;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const languages = [...new Set(courses.map(c => c.language).filter(Boolean))];

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourses" onLogout={handleLogout} />
      
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
                Course Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage all courses on the platform
              </p>
            </div>
            <Link to={createPageUrl('AdminManageCourse')}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </motion.div>

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Courses Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                              <img
                                src={course.thumbnail_url || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop`}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {course.title}
                              </p>
                              <p className="text-sm text-slate-500">{course.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{course.instructor_name || 'N/A'}</TableCell>
                        <TableCell>{course.language}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.level}</Badge>
                        </TableCell>
                        <TableCell>
                          {course.discount_price ? (
                            <div>
                              <span className="font-medium">${course.discount_price}</span>
                              <span className="text-sm text-slate-400 line-through ml-1">
                                ${course.price}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">${course.price}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-400" />
                            {course.enrolled_count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {course.rating?.toFixed(1) || '0.0'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[course.status]}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl(`AdminManageCourse?id=${course.id}`)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Course
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl(`CourseDetails?id=${course.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Course
                                </Link>
                              </DropdownMenuItem>
                              {course.status === 'draft' && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'published' })}
                                >
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {course.status === 'published' && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'archived' })}
                                >
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
              </DialogHeader>
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate(selectedCourse?.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}