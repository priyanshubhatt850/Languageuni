import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search
} from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function AdminWithdrawals() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => WWClient.entities.WithdrawalRequest.list('-created_date'),
    initialData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: instructorProfiles = [] } = useQuery({
    queryKey: ['instructor-profiles'],
    queryFn: () => WWClient.entities.InstructorProfile.list(),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, wallet_id, amount }) => {
      await WWClient.entities.WithdrawalRequest.update(id, {
        status,
        admin_notes: adminNotes,
        processed_date: new Date().toISOString()
      });

      if (status === 'completed') {
        const wallet = await WWClient.entities.Wallet.get(wallet_id);
        await WWClient.entities.Wallet.update(wallet_id, {
          balance: wallet.balance - amount,
          total_withdrawn: wallet.total_withdrawn + amount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-withdrawals']);
      setViewDialogOpen(false);
      setAdminNotes('');
      toast.success('Withdrawal request updated');
    },
    onError: () => {
      toast.error('Failed to update withdrawal request');
    }
  });

  const getUserInfo = (userId) => {
    const userInfo = allUsers.find(u => u.id === userId);
    const profile = instructorProfiles.find(p => p.user_id === userId);
    return {
      name: profile?.display_name || userInfo?.full_name || 'Unknown',
      email: userInfo?.email || '',
      avatar: profile?.avatar_url || ''
    };
  };

  const filteredWithdrawals = withdrawals.filter(request => {
    const userInfo = getUserInfo(request.instructor_id);
    const matchesSearch = userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length;
  const completedCount = withdrawals.filter(w => w.status === 'completed').length;

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminWithdrawals" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Withdrawal Requests
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Review and manage instructor withdrawal requests
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Requests', value: withdrawals.length, color: 'violet' },
              { label: 'Pending', value: pendingCount, color: 'amber' },
              { label: 'Approved', value: approvedCount, color: 'blue' },
              { label: 'Completed', value: completedCount, color: 'emerald' },
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawals Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
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
                  ) : filteredWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No withdrawal requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWithdrawals.map((request) => {
                      const userInfo = getUserInfo(request.instructor_id);
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={userInfo.avatar} />
                                <AvatarFallback className="bg-violet-100 text-violet-700">
                                  {userInfo.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {userInfo.name}
                                </p>
                                <p className="text-sm text-slate-500">{userInfo.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(request.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${request.amount?.toFixed(2)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {request.payment_method?.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[request.status]}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes(request.admin_notes || '');
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Review Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Review Withdrawal Request</DialogTitle>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getUserInfo(selectedRequest.instructor_id).avatar} />
                      <AvatarFallback className="bg-violet-100 text-violet-700">
                        {getUserInfo(selectedRequest.instructor_id).name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{getUserInfo(selectedRequest.instructor_id).name}</p>
                      <p className="text-sm text-slate-500">{getUserInfo(selectedRequest.instructor_id).email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-500">Amount</Label>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        ${selectedRequest.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Method</Label>
                      <p className="font-medium capitalize">
                        {selectedRequest.payment_method?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-500">Payment Details</Label>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 mt-1 space-y-1 text-sm">
                      {selectedRequest.payment_details?.bank_name && (
                        <p><strong>Bank:</strong> {selectedRequest.payment_details.bank_name}</p>
                      )}
                      {selectedRequest.payment_details?.account_number && (
                        <p><strong>Account:</strong> {selectedRequest.payment_details.account_number}</p>
                      )}
                      {selectedRequest.payment_details?.paypal_email && (
                        <p><strong>PayPal:</strong> {selectedRequest.payment_details.paypal_email}</p>
                      )}
                      {selectedRequest.payment_details?.notes && (
                        <p><strong>Notes:</strong> {selectedRequest.payment_details.notes}</p>
                      )}
                    </div>
                  </div>

                  {selectedRequest.status !== 'pending' && selectedRequest.admin_notes && (
                    <div>
                      <Label className="text-slate-500">Previous Admin Notes</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mt-1">
                        {selectedRequest.admin_notes}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="admin_notes">Admin Notes</Label>
                    <Textarea
                      id="admin_notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes (optional)"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="flex gap-2">
                {selectedRequest?.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ 
                        id: selectedRequest.id, 
                        status: 'rejected',
                        wallet_id: selectedRequest.wallet_id,
                        amount: selectedRequest.amount
                      })}
                      disabled={updateStatusMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => updateStatusMutation.mutate({ 
                        id: selectedRequest.id, 
                        status: 'approved',
                        wallet_id: selectedRequest.wallet_id,
                        amount: selectedRequest.amount
                      })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedRequest?.status === 'approved' && (
                  <Button 
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: 'completed',
                      wallet_id: selectedRequest.wallet_id,
                      amount: selectedRequest.amount
                    })}
                    disabled={updateStatusMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}