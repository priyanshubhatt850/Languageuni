import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Plus, Clock, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

export default function InstructorLogHours() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    student_ids: [],
    course_level_id: '',
    session_date: '',
    hours_taught: '',
    notes: ''
  });
  const [studentInput, setStudentInput] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: instructor = null } = useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await WWClient.entities.InstructorProfile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user?.id,
    initialData: null
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['instructor-sessions', instructor?.user_id],
    queryFn: () => WWClient.entities.TeachingSession.filter({ instructor_id: instructor?.user_id }, '-session_date'),
    enabled: !!instructor?.user_id,
    initialData: []
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['instructor-enrollments', instructor?.user_id],
    queryFn: async () => {
      if (!instructor?.user_id) return [];
      return WWClient.entities.Enrollment.filter({ instructor_id: instructor.user_id });
    },
    enabled: !!instructor?.user_id,
    initialData: []
  });

  // Filter to only show unique students (no duplicates)
  const enrollments = React.useMemo(() => {
    const seen = new Set();
    return allEnrollments.filter(e => {
      if (seen.has(e.user_id)) return false;
      seen.add(e.user_id);
      return true;
    });
  }, [allEnrollments]);

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-sessions'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['course-levels-for-sessions'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const { data: wallet = null } = useQuery({
    queryKey: ['instructor-wallet', instructor?.user_id],
    queryFn: async () => {
      if (!instructor?.user_id) return null;
      const wallets = await WWClient.entities.InstructorWallet.filter({ 
        instructor_id: instructor.user_id 
      });
      return wallets[0] || null;
    },
    enabled: !!instructor?.user_id,
    initialData: null
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data) => {
      const amountEarned = parseFloat(data.hours_taught) * (instructor?.hourly_rate || 0);
      const sessionPromises = data.student_ids.map(studentId =>
        WWClient.entities.TeachingSession.create({
          instructor_id: instructor.user_id,
          student_id: studentId,
          course_level_id: data.course_level_id,
          session_date: data.session_date,
          hours_taught: parseFloat(data.hours_taught),
          hourly_rate: instructor?.hourly_rate || 0,
          amount_earned: amountEarned,
          notes: data.notes,
          status: 'pending'
        })
      );
      return Promise.all(sessionPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-wallet'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Teaching sessions logged (pending admin approval)');
    },
    onError: () => {
      toast.error('Failed to log teaching sessions');
    }
  });

  const resetForm = () => {
    setFormData({
      student_ids: [],
      course_level_id: '',
      session_date: '',
      hours_taught: '',
      notes: ''
    });
    setStudentInput('');
  };

  const handleAddStudent = () => {
    if (studentInput && !formData.student_ids.includes(studentInput)) {
      setFormData({
        ...formData,
        student_ids: [...formData.student_ids, studentInput]
      });
      setStudentInput('');
    }
  };

  const handleRemoveStudent = (studentId) => {
    setFormData({
      ...formData,
      student_ids: formData.student_ids.filter(id => id !== studentId)
    });
  };

  const handleLogSession = () => {
    if (formData.student_ids.length === 0 || !formData.course_level_id || !formData.session_date || !formData.hours_taught) {
      toast.error('Please fill in all required fields and add at least one student');
      return;
    }

    if (parseFloat(formData.hours_taught) <= 0) {
      toast.error('Hours taught must be greater than 0');
      return;
    }

    createSessionMutation.mutate(formData);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || !instructor) return <LoadingPage />;

  const paginatedSessions = sessions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const approvedSessions = sessions.filter(s => s.status === 'approved');
  const totalEarned = approvedSessions.reduce((sum, s) => sum + (s.amount_earned || 0), 0);
  const pendingApproval = pendingSessions.reduce((sum, s) => sum + (s.amount_earned || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorEarnings" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Log Teaching Hours
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Log your teaching sessions and track earnings
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Approved Sessions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{approvedSessions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{pendingSessions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-emerald-600">${wallet?.balance.toFixed(2) || '0.00'}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-violet-600">${totalEarned.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {pendingApproval > 0 && (
            <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-200">Pending Approval</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    You have ${pendingApproval.toFixed(2)} in sessions waiting for admin approval
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Log Session Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 mb-6">
                <Plus className="w-4 h-4 mr-2" />
                Log Teaching Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Teaching Session</DialogTitle>
                <DialogDescription>
                  Record a teaching session. Hours will be pending admin approval before payment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Students * (Add multiple if needed)</Label>
                  <div className="flex gap-2">
                    <Select value={studentInput} onValueChange={setStudentInput}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {enrollments.map(enrollment => {
                          const student = users.find(u => u.id === enrollment.user_id);
                          const isSelected = formData.student_ids.includes(enrollment.user_id);
                          return (
                            <SelectItem key={enrollment.id} value={enrollment.user_id} disabled={isSelected}>
                              {student?.full_name} ({student?.email})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddStudent} type="button" className="bg-violet-600 hover:bg-violet-700">
                      Add
                    </Button>
                  </div>
                  {formData.student_ids.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-slate-500 font-medium">Selected Students ({formData.student_ids.length}):</p>
                      {formData.student_ids.map((studentId) => {
                        const student = users.find(u => u.id === studentId);
                        return (
                          <div key={studentId} className="flex items-center justify-between p-2 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-200 dark:border-violet-800">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{student?.full_name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveStudent(studentId)}
                              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Course Level *</Label>
                  <Select value={formData.course_level_id} onValueChange={(v) => setFormData({ ...formData, course_level_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.filter(c => c.instructor_id === instructor.user_id).map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.level_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Session Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hours Taught *</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.hours_taught}
                    onChange={(e) => setFormData({ ...formData, hours_taught: e.target.value })}
                    placeholder="e.g., 1.5"
                  />
                  {formData.hours_taught && (
                    <p className="text-sm text-slate-500">
                      Estimated earnings: ${(parseFloat(formData.hours_taught) * (instructor?.hourly_rate || 0)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about the session..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleLogSession}
                  disabled={createSessionMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {createSessionMutation.isPending ? 'Logging...' : 'Log Session'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sessions Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No sessions logged yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSessions.map((session) => {
                      const student = users.find(u => u.id === session.student_id);
                      const course = courseLevels.find(c => c.id === session.course_level_id);
                      return (
                        <TableRow key={session.id}>
                          <TableCell>{format(new Date(session.session_date), 'MMM d, yyyy HH:mm')}</TableCell>
                          <TableCell>{student?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{course?.level_name || 'N/A'}</TableCell>
                          <TableCell>{session.hours_taught}h</TableCell>
                          <TableCell>${session.hourly_rate}/h</TableCell>
                          <TableCell className="font-medium">${session.amount_earned?.toFixed(2) || '0.00'}</TableCell>
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
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {sessions.length > ITEMS_PER_PAGE && (
            <div className="mt-6 flex gap-2 justify-center">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}