import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Search, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Pagination from '@/components/common/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminApproveHours() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-teaching-sessions'],
    queryFn: () => WWClient.entities.TeachingSession.list('-session_date'),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-hours'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['course-levels-for-hours'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructor-profiles-for-hours'],
    queryFn: () => WWClient.entities.InstructorProfile.list(),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const approvalMutation = useMutation({
    mutationFn: ({ sessionId, action, rejectionReason }) =>
      WWClient.functions.invoke('processSessionApproval', {
        sessionId,
        action,
        rejectionReason
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-teaching-sessions'] });
      toast.success(response.data.message || 'Session processed successfully');
      setRejectionDialogOpen(false);
      setSelectedSession(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to process session');
    }
  });

  const filteredSessions = sessions.filter(session => {
    const instructor = instructors.find(i => i.user_id === session.instructor_id);
    const student = users.find(u => u.id === session.student_id);
    
    const matchesSearch = 
      instructor?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedSessions = filteredSessions.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const approvedSessions = sessions.filter(s => s.status === 'approved');
  const rejectedSessions = sessions.filter(s => s.status === 'rejected');
  const totalPending = pendingSessions.reduce((sum, s) => sum + (s.amount_earned || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminEarnings" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Approve Teaching Hours
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Review and approve instructor teaching sessions
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{pendingSessions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Pending Amount</p>
                <p className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedSessions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedSessions.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by instructor or student..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSessions.map((session) => {
                      const instructor = instructors.find(i => i.user_id === session.instructor_id);
                      const student = users.find(u => u.id === session.student_id);
                      const course = courseLevels.find(c => c.id === session.course_level_id);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {instructor?.display_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{student?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(session.session_date), 'MMM d, yyyy HH:mm')}</TableCell>
                          <TableCell>{session.hours_taught}h</TableCell>
                          <TableCell>${session.hourly_rate}/h</TableCell>
                          <TableCell className="font-bold">${session.amount_earned?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                session.status === 'approved'
                                  ? 'default'
                                  : session.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className={
                                session.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : session.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : ''
                              }
                            >
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {session.status === 'pending' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => approvalMutation.mutate({
                                      sessionId: session.id,
                                      action: 'approve'
                                    })}
                                    className="text-emerald-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSession(session);
                                      setRejectionDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredSessions.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSessions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Rejection Dialog */}
          <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Teaching Session</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium">Session Details</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Amount: ${selectedSession?.amount_earned?.toFixed(2)} ({selectedSession?.hours_taught}h × ${selectedSession?.hourly_rate}/h)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why you're rejecting this session..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setRejectionDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      toast.error('Please provide a rejection reason');
                      return;
                    }
                    approvalMutation.mutate({
                      sessionId: selectedSession.id,
                      action: 'reject',
                      rejectionReason
                    });
                  }}
                  disabled={approvalMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {approvalMutation.isPending ? 'Processing...' : 'Reject Session'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}