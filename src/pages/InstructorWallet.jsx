import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Wallet as WalletIcon,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function InstructorWallet() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState({
    account_number: '',
    bank_name: '',
    paypal_email: '',
    notes: ''
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

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['instructor-wallet', user?._id],
    queryFn: async () => {
      const wallets = await WWClient.entities.Wallet.filter({ instructor_id: user?._id });
      if (wallets.length === 0) {
        return await WWClient.entities.Wallet.create({ 
          instructor_id: user?._id,
          balance: 0,
          total_earned: 0,
          total_withdrawn: 0
        });
      }
      return wallets[0];
    },
    enabled: !!user?.id
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['instructor-withdrawals', user?.id],
    queryFn: () => WWClient.entities.WithdrawalRequest.filter({ instructor_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (data) => {
      if (parseFloat(amount) > wallet.balance) {
        throw new Error('Insufficient balance');
      }
      return await WWClient.entities.WithdrawalRequest.create({
        instructor_id: user.id,
        wallet_id: wallet.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-withdrawals']);
      setWithdrawDialogOpen(false);
      setAmount('');
      setPaymentDetails({
        account_number: '',
        bank_name: '',
        paypal_email: '',
        notes: ''
      });
      toast.success('Withdrawal request submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || walletLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorWallet" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Wallet
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your earnings and withdrawals
            </p>
          </motion.div>

          {/* Wallet Balance */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <WalletIcon className="w-8 h-8" />
                  <Badge className="bg-white/20 text-white border-0">Available</Badge>
                </div>
                <p className="text-sm opacity-80 mb-1">Current Balance</p>
                <p className="text-4xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</p>
                <Button 
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={!wallet?.balance || wallet?.balance <= 0}
                  className="w-full mt-4 bg-white text-violet-700 hover:bg-white/90"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${wallet?.total_earned?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Total Withdrawn</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${wallet?.total_withdrawn?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal History */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No withdrawal requests yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          {new Date(withdrawal.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${withdrawal.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {withdrawal.payment_method?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[withdrawal.status]}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {withdrawal.admin_notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Withdrawal Dialog */}
          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Available balance: ${wallet?.balance?.toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={0}
                      max={wallet?.balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'bank_transfer' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={paymentDetails.bank_name}
                        onChange={(e) => setPaymentDetails({...paymentDetails, bank_name: e.target.value})}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={paymentDetails.account_number}
                        onChange={(e) => setPaymentDetails({...paymentDetails, account_number: e.target.value})}
                        placeholder="Enter account number"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="paypal_email">PayPal Email</Label>
                    <Input
                      id="paypal_email"
                      type="email"
                      value={paymentDetails.paypal_email}
                      onChange={(e) => setPaymentDetails({...paymentDetails, paypal_email: e.target.value})}
                      placeholder="Enter PayPal email"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentDetails.notes}
                    onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
                    placeholder="Add any additional notes"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createWithdrawalMutation.mutate()}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet?.balance || createWithdrawalMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {createWithdrawalMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}