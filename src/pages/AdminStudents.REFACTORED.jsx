/**
 * REFACTORED AdminStudents Page Example
 * 
 * Demonstrates the new professional API approach with:
 * - Aggregated data fetching (single endpoint instead of 3 separate calls)
 * - Professional error handling
 * - Built-in pagination
 * - Type-safe data
 */

import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useStudents, useUpdateStudent } from '@/hooks/useApi'; // NEW: Use aggregated hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  BookOpen,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '@/components/common/Pagination';
import { useNotifications } from '@/hooks/useApi'; // NEW: Aggregated notifications hook

const ITEMS_PER_PAGE = 10;

export default function AdminStudents() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // NEW: Single hook instead of 3 separate useQuery calls
  // This includes students + enrollments + progress data automatically
  const { 
    data: studentsResponse, 
    isLoading,
    isError,
    error
  } = useStudents({ 
    page: currentPage, 
    limit: ITEMS_PER_PAGE, 
    search: searchTerm 
  });

  // NEW: Aggregated notifications with built-in filtering
  const { data: notificationsResponse } = useNotifications(user?._id, 10);
  const notifications = notificationsResponse?.data || [];

  // Update mutation for student operations
  const updateMutation = useUpdateStudent();

  const students = studentsResponse?.data?.students || [];
  const pagination = studentsResponse?.data?.pagination || {};

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (isLoading && !students.length) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminStudents" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Students</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and monitor student accounts</p>
          </motion.div>

          {/* Error State */}
          {isError && (
            <Card className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">
                  Error loading students: {error?.message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Certificates</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback>{student.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.full_name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{student.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {student.enrollment_count || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {student.courses_in_progress || 0} in progress
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.certificates_count > 0 ? 'default' : 'secondary'}>
                              <Award className="w-3 h-3 mr-1" />
                              {student.certificates_count || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {student.created_date ? format(new Date(student.created_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Mail className="w-4 h-4" />
                                  Send Email
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="mt-4 flex justify-center">
                <div className="text-slate-600">Loading more data...</div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
