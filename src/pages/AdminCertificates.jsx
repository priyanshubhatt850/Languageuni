import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import StatsCard from '@/components/common/StatsCard';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  Award,
  Search,
  Download,
  Eye,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCertificates() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['completed-enrollments'],
    queryFn: () => WWClient.entities.Enrollment.filter({ status: 'completed' }),
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const certificatesIssued = enrollments.filter(e => e.certificate_issued);

  const filteredCertificates = certificatesIssued.filter(cert =>
    cert.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCertificates" onLogout={handleLogout} />
      
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
                Certificate Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and track issued certificates
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Certificates"
              value={certificatesIssued.length.toString()}
              icon={Award}
              color="violet"
              delay={0}
            />
            <StatsCard
              title="This Month"
              value={certificatesIssued.filter(c => {
                if (!c.completed_date) return false;
                const date = new Date(c.completed_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length.toString()}
              icon={CheckCircle}
              color="green"
              delay={1}
            />
            <StatsCard
              title="Completion Rate"
              value={`${enrollments.length > 0 ? Math.round((certificatesIssued.length / enrollments.length) * 100) : 0}%`}
              icon={Award}
              color="blue"
              delay={2}
            />
            <StatsCard
              title="Pending Verification"
              value="0"
              icon={Award}
              color="orange"
              delay={3}
            />
          </div>

          {/* Search */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Issue Date</TableHead>
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
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No certificates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">
                          CERT-{cert.id?.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.user_name || 'Unknown'}</p>
                            <p className="text-sm text-slate-500">{cert.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cert.course_title}</TableCell>
                        <TableCell>
                          {cert.completed_date 
                            ? format(new Date(cert.completed_date), 'MMM d, yyyy')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Issued
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
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