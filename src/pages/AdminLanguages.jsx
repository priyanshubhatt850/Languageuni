import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminLanguages() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    code: '',
    is_active: true,
    display_order: 0
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

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => WWClient.entities.Language.list(),
    initialData: []
  });
 console.log('languages', languages);
  const totalPages = Math.ceil(languages.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedLanguages = languages.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Language.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['languages']);
      setDialogOpen(false);
      resetForm();
      toast.success('Language added successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => WWClient.entities.Language.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['languages']);
      setDialogOpen(false);
      setEditingLanguage(null);
      resetForm();
      toast.success('Language updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.Language.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['languages']);
      toast.success('Language deleted successfully');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      flag: '',
      code: '',
      is_active: true,
      display_order: 0
    });
  };

  const handleEdit = (language) => {
    setEditingLanguage(language);
    setFormData({
      name: language.name || '',
      flag: language.flag || '',
      code: language.code || '',
      is_active: language.is_active !== false,
      display_order: language.display_order || 0
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.flag) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingLanguage) {
      updateMutation.mutate({ id: editingLanguage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminLanguages" onLogout={handleLogout} />
      
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
                Language Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage available languages on the platform
              </p>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setEditingLanguage(null);
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Language
            </Button>
          </motion.div>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flag</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Instructors</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : paginatedLanguages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No languages added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLanguages.map((language) => (
                      <TableRow key={language.id}>
                        <TableCell>
                          <span className="text-3xl">{language.flag}</span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {language.name}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {language.code || 'N/A'}
                        </TableCell>
                        <TableCell>{language.instructor_count || 0}</TableCell>
                        <TableCell>{language.learner_count || 0}</TableCell>
                        <TableCell>{language.display_order || 0}</TableCell>
                        <TableCell>
                          <Badge variant={language.is_active ? 'default' : 'secondary'}>
                            {language.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(language)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setLanguageToDelete(language);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {languages.length > 0 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={languages.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Language</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete <strong>{languageToDelete?.name}</strong>? This action cannot be undone.
                </p>
                {languageToDelete?.instructor_count > 0 || languageToDelete?.learner_count > 0 ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                    ⚠️ This language has {languageToDelete?.instructor_count || 0} instructor(s) and {languageToDelete?.learner_count || 0} learner(s) associated.
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    deleteMutation.mutate(languageToDelete.id);
                    setDeleteDialogOpen(false);
                  }}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Language'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLanguage ? 'Edit Language' : 'Add New Language'}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Language Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Spanish"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Flag Emoji *</Label>
                  <Input
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="🇪🇸"
                    maxLength={4}
                  />
                  <p className="text-xs text-slate-500">
                    Copy flag emoji from emojipedia.org
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Language Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., es, en, fr"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active Status</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingLanguage ? 'Update' : 'Add Language'
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}