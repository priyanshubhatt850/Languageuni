import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  DollarSign,
  Eye
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const ITEMS_PER_PAGE = 10;

export default function AdminInstructors() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('hourly');
  const [salaryAmount, setSalaryAmount] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [revenueShare, setRevenueShare] = useState(70);
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

  const { data: instructorProfiles = [], isLoading } = useQuery({
    queryKey: ['admin-instructors'],
    queryFn: () => WWClient.entities.InstructorProfile.list(),
    initialData: []
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => WWClient.entities.Course.list(),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, revenue_share_percentage }) => 
      WWClient.entities.InstructorProfile.update(id, { 
        verification_status: status,
        ...(revenue_share_percentage && { revenue_share_percentage })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-instructors']);
      setViewDialogOpen(false);
    }
  });

  const updateSalaryMutation = useMutation({
    mutationFn: ({ id, payment_type, monthly_salary, hourly_rate }) => 
      WWClient.entities.InstructorProfile.update(id, { 
        payment_type,
        monthly_salary: monthly_salary || 0,
        hourly_rate: hourly_rate || 0
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-instructors']);
      setSalaryDialogOpen(false);
      toast.success('Payment settings updated successfully');
    }
  });

  const filteredInstructors = instructorProfiles.filter(instructor => {
    const matchesSearch = instructor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instructor.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedInstructors = filteredInstructors.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInstructorCourseCount = (userId) => 
    courses.filter(c => c.instructor_id === userId).length;

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminInstructors" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Instructor Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Review and manage instructor accounts
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Instructors', value: instructorProfiles.length, color: 'violet' },
              { label: 'Pending Review', value: instructorProfiles.filter(i => i.verification_status === 'pending').length, color: 'amber' },
              { label: 'Approved', value: instructorProfiles.filter(i => i.verification_status === 'approved').length, color: 'emerald' },
              { label: 'Rejected', value: instructorProfiles.filter(i => i.verification_status === 'rejected').length, color: 'red' },
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
                    placeholder="Search instructors..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Instructors Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Payment</TableHead>
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
                  ) : paginatedInstructors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No instructors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInstructors.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={instructor.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-700">
                                {instructor.display_name?.charAt(0) || 'I'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {instructor.display_name}
                              </p>
                              <p className="text-sm text-slate-500">{instructor.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {instructor.languages_taught?.slice(0, 2).map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                            {instructor.languages_taught?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{instructor.languages_taught.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{instructor.years_experience || 0} years</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            {getInstructorCourseCount(instructor.user_id)}
                          </div>
                        </TableCell>
                        <TableCell>{instructor.total_students || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {instructor.average_rating?.toFixed(1) || '0.0'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {instructor.payment_type === 'monthly' 
                            ? `$${instructor.monthly_salary || 0}/mo`
                            : `$${instructor.hourly_rate || 0}/hr`
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[instructor.verification_status]}>
                            {instructor.verification_status}
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
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedInstructor(instructor);
                                  setPaymentType(instructor.payment_type || 'hourly');
                                  setSalaryAmount(instructor.monthly_salary || 0);
                                  setHourlyRate(instructor.hourly_rate || 0);
                                  setSalaryDialogOpen(true);
                                }}
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Set Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedInstructor(instructor);
                                setRevenueShare(instructor.revenue_share_percentage || 70);
                                setViewDialogOpen(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {instructor.verification_status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => updateStatusMutation.mutate({ 
                                      id: instructor._id, 
                                      status: 'approved' 
                                    })}
                                    className="text-emerald-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateStatusMutation.mutate({ 
                                      id: instructor._id, 
                                      status: 'rejected' 
                                    })}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
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

          {filteredInstructors.length > 0 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredInstructors.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Set Payment Dialog */}
          <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Set Payment Settings</DialogTitle>
                <DialogDescription>
                  Configure payment type and rate for {selectedInstructor?.display_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Salary</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === 'monthly' ? (
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="salary"
                        type="number"
                        min={0}
                        value={salaryAmount}
                        onChange={(e) => setSalaryAmount(Number(e.target.value))}
                        className="pl-9"
                        placeholder="Enter monthly salary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="hourly">Hourly Rate (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="hourly"
                        type="number"
                        min={0}
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="pl-9"
                        placeholder="Enter hourly rate"
                      />
                    </div>
                    {selectedInstructor?.total_hours_taught > 0 && (
                      <p className="text-sm text-slate-500">
                        Total hours taught: {selectedInstructor.total_hours_taught}h
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    updateSalaryMutation.mutate({
                      id: selectedInstructor?.id,
                      payment_type: paymentType,
                      monthly_salary: paymentType === 'monthly' ? salaryAmount : 0,
                      hourly_rate: paymentType === 'hourly' ? hourlyRate : 0
                    });
                  }}
                  disabled={updateSalaryMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {updateSalaryMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View/Edit Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Instructor Details</DialogTitle>
              </DialogHeader>
              {selectedInstructor && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedInstructor.avatar_url} />
                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xl">
                        {selectedInstructor.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{selectedInstructor.display_name}</p>
                      <p className="text-slate-500">{selectedInstructor.user_email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-500">Experience</Label>
                      <p className="font-medium">{selectedInstructor.years_experience || 0} years</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Total Earnings</Label>
                      <p className="font-medium">${selectedInstructor.total_earnings || 0}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-500">Bio</Label>
                    <p className="text-slate-900 dark:text-white">{selectedInstructor.bio || 'No bio provided'}</p>
                  </div>

                  <div>
                    <Label className="text-slate-500">Languages Taught</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedInstructor.languages_taught?.map(lang => (
                        <Badge key={lang} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-500">Qualifications</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedInstructor.qualifications?.map((qual, i) => (
                        <Badge key={i} variant="outline">{qual}</Badge>
                      )) || <span className="text-slate-400">None listed</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Revenue Share Percentage</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={revenueShare}
                        onChange={(e) => setRevenueShare(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateStatusMutation.mutate({ 
                    id: selectedInstructor?.id, 
                    status: selectedInstructor?.verification_status,
                    revenue_share_percentage: revenueShare
                  })}
                  disabled={updateStatusMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}