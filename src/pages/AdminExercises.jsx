import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import QuizGenerator from '@/components/ai/QuizGenerator';

export default function AdminExercises() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'multiple_choice',
    difficulty: 'medium',
    time_limit_minutes: 10,
    points: 10,
    content: { instruction: '', items: [] },
    is_active: true
  });
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: level } = useQuery({
    queryKey: ['level', levelId],
    queryFn: () => WWClient.entities.CourseLevel.filter({ id: levelId }).then(res => res[0]),
    enabled: !!levelId
  });

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', levelId],
    queryFn: () => WWClient.entities.Exercise.filter({ level_id: levelId }),
    enabled: !!levelId,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingExercise) {
        return WWClient.entities.Exercise.update(editingExercise.id, data);
      }
      return WWClient.entities.Exercise.create({ ...data, level_id: levelId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises', levelId]);
      setDialogOpen(false);
      resetForm();
      toast.success(editingExercise ? 'Exercise updated' : 'Exercise created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.Exercise.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises', levelId]);
      toast.success('Exercise deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'multiple_choice',
      difficulty: 'medium',
      time_limit_minutes: 10,
      points: 10,
      content: { instruction: '', items: [] },
      is_active: true
    });
    setEditingExercise(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content.instruction) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleApplyAI = (generatedExercise) => {
    setFormData(generatedExercise);
    setShowAIGenerator(false);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  if (!levelId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={[]} />
          <main className="p-8 text-center">
            <p className="text-slate-600">No course level selected. Please select a level first.</p>
            <Link to={createPageUrl('AdminCourseLevels')}>
              <Button className="mt-4">Go to Course Levels</Button>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  if (!level) return <LoadingPage />;

  const typeIcons = {
    multiple_choice: '◉',
    fill_blank: '_',
    matching: '↔',
    short_answer: '✎',
    listening: '🔊',
    speaking: '🎤'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Practice Exercises
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {level?.level_name} - Create interactive learning activities
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-6">
            <Button 
              variant="outline"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="border-violet-300 text-violet-600 hover:bg-violet-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {showAIGenerator ? 'Hide' : 'Generate with AI'}
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Exercise
            </Button>
          </div>

          {showAIGenerator && (
            <div className="mb-6">
              <QuizGenerator levelId={levelId} onApply={handleApplyAI} />
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : exercises.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500">
                No exercises yet. Create your first exercise!
              </div>
            ) : (
              exercises.map((exercise, idx) => (
                <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{typeIcons[exercise.type]}</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">{exercise.title}</h3>
                          </div>
                          <p className="text-xs text-slate-500">{exercise.type.replace('_', ' ')}</p>
                        </div>
                        <Badge variant={exercise.is_active ? 'default' : 'secondary'} className="text-xs">
                          {exercise.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{exercise.description}</p>
                      <div className="flex gap-1 mb-3 text-xs">
                        <Badge variant="outline">{exercise.difficulty}</Badge>
                        <Badge variant="outline">{exercise.points}pts</Badge>
                        <Badge variant="outline">{exercise.time_limit_minutes}min</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setFormData(exercise); setEditingExercise(exercise); setDialogOpen(true); }}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-red-600" onClick={() => { setExerciseToDelete(exercise); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Exercise</DialogTitle>
              </DialogHeader>
              <p className="text-slate-600">Delete "{exerciseToDelete?.title}"? This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => { deleteMutation.mutate(exerciseToDelete.id); setDeleteDialogOpen(false); }}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingExercise ? 'Edit Exercise' : 'Create Exercise'}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Exercise Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Verb Conjugation Practice" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this exercise" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                        <SelectItem value="matching">Matching</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="speaking">Speaking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Limit (minutes)</Label>
                    <Input type="number" value={formData.time_limit_minutes} onChange={(e) => setFormData({ ...formData, time_limit_minutes: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input type="number" value={formData.points} onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructions *</Label>
                  <Textarea value={formData.content.instruction} onChange={(e) => setFormData({ ...formData, content: { ...formData.content, instruction: e.target.value } })} placeholder="Provide clear instructions for the exercise" rows={3} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {saveMutation.isPending ? 'Saving...' : 'Save Exercise'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}