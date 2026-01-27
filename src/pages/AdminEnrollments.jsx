import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminEnrollments() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editFormData, setEditFormData] = useState({
    start_date: '',
    end_date: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => WWClient.entities.Enrollment.list('-enrolled_date'),
    initialData: []
  });

  const { data: courselevels = [] } = useQuery({
    queryKey: ['course-levels-for-enrollments'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-enrollments'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages-for-enrollments'],
    queryFn: () => WWClient.entities.Language.list(),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Enrollment.update(data.id, {
      start_date: data.start_date || null,
      end_date: data.end_date || null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      toast.success('Enrollment dates updated');
      setEditingEnrollment(null);
    },
    onError: () => {
      toast.error('Failed to update enrollment');
    }
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId) => WWClient.entities.Enrollment.delete(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      toast.success('Enrollment deleted');
    },
    onError: () => {
      toast.error('Failed to delete enrollment');
    }
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = users.find(u => u.id === enrollment.user_id);
    const course = courselevels.find(c => c.id === enrollment.course_id);
    
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      student?.full_name?.toLowerCase().includes(searchLower) ||
      student?.email?.toLowerCase().includes(searchLower) ||
      course?.level_name?.toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedEnrollments = filteredEnrollments.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEditFormData({
      start_date: enrollment.start_date || '',
      end_date: enrollment.end_date || ''
    });
  };

  const handleSaveChanges = () => {
    if (!editingEnrollment) return;
    updateEnrollmentMutation.mutate({
      id: editingEnrollment.id,
      start_date: editFormData.start_date,
      end_date: editFormData.end_date
    });
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminStudents" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Enrollment Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage student enrollments and set access dates for each course
            </p>
          </motion.div>

          {/* Search */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by student, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Enrollments Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Access From</TableHead>
                    <TableHead>Access Until</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEnrollments.map((enrollment) => {
                      const student = users.find(u => u.id === enrollment.user_id);
                      const course = courselevels.find(c => c.id === enrollment.course_id);
                      
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {student?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-slate-500">{student?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course?.level_name || 'N/A'}</p>
                              <p className="text-xs text-slate-500">
                                {languages.find(l => l.id === course?.language_id)?.flag} {languages.find(l => l.id === course?.language_id)?.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={enrollment.status === 'active' ? 'default' : 'secondary'}
                              className={enrollment.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}
                            >
                              {enrollment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {enrollment.start_date 
                              ? format(new Date(enrollment.start_date), 'MMM d, yyyy')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {enrollment.end_date 
                              ? format(new Date(enrollment.end_date), 'MMM d, yyyy')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {format(new Date(enrollment.enrolled_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Dialog open={editingEnrollment?.id === enrollment.id}>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onClick={() => handleEditClick(enrollment)}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Edit Access Dates
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Enrollment Dates</DialogTitle>
                                      <DialogDescription>
                                        Set the access period for {student?.full_name}'s {course?.level_name} course
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Access From (Start Date)</Label>
                                        <Input
                                          type="date"
                                          value={editFormData.start_date}
                                          onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Access Until (End Date)</Label>
                                        <Input
                                          type="date"
                                          value={editFormData.end_date}
                                          onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                        />
                                      </div>
                                      <div className="flex gap-3 pt-4">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setEditingEnrollment(null)}
                                          className="flex-1"
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          onClick={handleSaveChanges}
                                          disabled={updateEnrollmentMutation.isPending}
                                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                          {updateEnrollmentMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <DropdownMenuItem 
                                  onClick={() => deleteEnrollmentMutation.mutate(enrollment.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredEnrollments.length > 0 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEnrollments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}