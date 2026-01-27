import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, Plus, Sparkles, Upload, X } from 'lucide-react';
import CourseOutlineGenerator from '@/components/ai/CourseOutlineGenerator';

export default function AdminCreateLevel() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('id');
  const languageId = urlParams.get('languageId');
  const isEdit = !!levelId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    language_id: languageId || '',
    level_name: '',
    level_type: 'standard',
    description: '',
    learning_goals: [],
    price: 0,
    discount_price: null,
    duration_hours: 0,
    instructor_id: '',
    instructor_hourly_rate: null,
    thumbnail_url: '',
    status: 'draft',
    display_order: 0
  });
  const [goalInput, setGoalInput] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: level, isLoading: levelLoading } = useQuery({
    queryKey: ['course-level', levelId],
    queryFn: async () => {
      const levels = await WWClient.entities.CourseLevel.filter({ id: levelId });
      const level = levels[0];
      if (level) {
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
         instructor_hourly_rate: level.instructor_hourly_rate || null,
         thumbnail_url: level.thumbnail_url || '',
         status: level.status || 'draft',
         display_order: level.display_order || 0
       });
      }
      return level;
    },
    enabled: isEdit
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
    enabled: !!user?._id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return WWClient.entities.CourseLevel.update(levelId, data);
      }
      return WWClient.entities.CourseLevel.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-course-levels']);
      queryClient.invalidateQueries(['language-levels']);
      toast.success(isEdit ? 'Level updated' : 'Level created');
      navigate(createPageUrl(`AdminLanguageLevels?languageId=${formData.language_id}`));
    }
  });

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

  const handleApplyAI = (outline) => {
    setFormData({
      ...formData,
      description: outline.description,
      learning_goals: outline.learning_goals,
      duration_hours: outline.duration_hours
    });
    setShowAIGenerator(false);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const { file_url } = await WWClient.integrations.Core.UploadFile( file);
      setFormData({ ...formData, thumbnail_url: file_url });
      toast.success('Thumbnail uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.language_id || !formData.level_name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || (isEdit && levelLoading)) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Level' : 'Create New Level'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isEdit ? 'Update level information' : 'Add a new course level'}
              </p>
            </div>
          </div>

          <div className="max-w-4xl space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="border-violet-300 text-violet-600 hover:bg-violet-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showAIGenerator ? 'Hide' : 'Show'} AI Assistant
              </Button>
            </div>

            {showAIGenerator && (
              <CourseOutlineGenerator onApply={handleApplyAI} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Level Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language *</Label>
                  <Select value={formData.language_id} onValueChange={(v) => setFormData({ ...formData, language_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang._id} value={lang._id}>
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
                  placeholder="Brief description of the level"
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
                  <Button type="button" onClick={handleAddGoal}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.learning_goals.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.learning_goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded">
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
                      <SelectItem key={inst._id} value={inst.user_id}>
                        {inst.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instructor Hourly Rate (Course-specific)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.instructor_hourly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, instructor_hourly_rate: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Leave empty to use instructor's default rate"
                />
                <p className="text-xs text-slate-500">Optional: Override the instructor's default hourly rate for this course level</p>
              </div>

              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="space-y-3">
                  {formData.thumbnail_url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">{uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500">or paste URL below</p>
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Level' : 'Create Level'}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    </div>
  );
}