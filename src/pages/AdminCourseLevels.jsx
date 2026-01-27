import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, GraduationCap, TrendingUp, Users } from 'lucide-react';

export default function AdminCourseLevels() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [formData, setFormData] = useState({
    language_id: '',
    level_name: '',
    level_type: 'standard',
    description: '',
    learning_goals: [],
    price: 0,
    discount_price: null,
    duration_hours: 0,
    instructor_id: '',
    thumbnail_url: '',
    status: 'draft',
    display_order: 0
  });
  const [goalInput, setGoalInput] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);



  const { data: levels = [] } = useQuery({
    queryKey: ['all-course-levels'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => WWClient.entities.Language.list(),
    initialData: []
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['approved-instructors'],
    queryFn: async () => {
      const profiles = await WWClient.entities.InstructorProfile.filter({ verification_status: 'approved' });
      return profiles;
    },
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingLevel) {
        return WWClient.entities.CourseLevel.update(editingLevel._id, data);
      }
      return WWClient.entities.CourseLevel.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-course-levels']);
      setDialogOpen(false);
      resetForm();
      toast.success(editingLevel ? 'Level updated' : 'Level created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.CourseLevel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-course-levels']);
      toast.success('Level deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      language_id: '',
      level_name: '',
      level_type: 'standard',
      description: '',
      learning_goals: [],
      price: 0,
      discount_price: null,
      duration_hours: 0,
      instructor_id: '',
      thumbnail_url: '',
      status: 'draft',
      display_order: 0
    });
    setEditingLevel(null);
  };

  const handleEdit = (level) => {
    setEditingLevel(level);
    setFormData({
      language_id: level.language_id || '',
      level_name: level.level_name || '',
      level_type: level.level_type || 'standard',
      description: level.description || '',
      learning_goals: level.learning_goals || [],
      price: level.price || 0,
      discount_price: level.discount_price || null,
      duration_hours: level.duration_hours || 0,
      instructor_id: level.instructor_id || '',
      thumbnail_url: level.thumbnail_url || '',
      status: level.status || 'draft',
      display_order: level.display_order || 0
    });
    setDialogOpen(true);
  };

  const handleAddGoal = () => {
    if (goalInput.trim()) {
      setFormData({
        ...formData,
        learning_goals: [...formData.learning_goals, goalInput.trim()]
      });
      setGoalInput('');
    }
  };

  const handleRemoveGoal = (index) => {
    setFormData({
      ...formData,
      learning_goals: formData.learning_goals.filter((_, i) => i !== index)
    });
  };

  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.level_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || level.language_id === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Languages & Course Levels
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Select a language to manage its levels and study materials
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((lang, index) => {
              const langLevels = levels.filter(l => l.language_id === lang._id);
              return (
                <motion.div
                  key={lang.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl(`AdminLanguageLevels?languageId=${lang._id}`)}>
                    <Card className="border-0 shadow-md hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                              <span className="text-2xl">{lang.flag}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {lang.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {langLevels.length} level{langLevels.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Badge variant={lang.is_active ? 'default' : 'secondary'} className="text-xs">
                            {lang.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-slate-600 dark:text-slate-400">Instructors</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{lang.instructor_count || 0}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-cyan-600" />
                              <span className="text-xs text-slate-600 dark:text-slate-400">Learners</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{lang.learner_count || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm font-semibold">Manage Levels</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLevel ? 'Edit Level' : 'Add New Level'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select value={formData.language_id} onValueChange={(v) => setFormData({ ...formData, language_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level Name *</Label>
                    <Input
                      value={formData.level_name}
                      onChange={(e) => setFormData({ ...formData, level_name: e.target.value })}
                      placeholder="e.g., A1, TEF"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.level_type} onValueChange={(v) => setFormData({ ...formData, level_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (CEFR)</SelectItem>
                        <SelectItem value="exam">Exam Prep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Learning Goals</Label>
                  <div className="flex gap-2">
                    <Input
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="Add learning goal..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                    />
                    <Button type="button" onClick={handleAddGoal}>Add</Button>
                  </div>
                  {formData.learning_goals.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.learning_goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-sm">{goal}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveGoal(idx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Price</Label>
                    <Input
                      type="number"
                      value={formData.discount_price || ''}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assign Instructor</Label>
                  <Select value={formData.instructor_id} onValueChange={(v) => setFormData({ ...formData, instructor_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map(inst => (
                        <SelectItem key={inst.id} value={inst.user_id}>
                          {inst.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingLevel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}