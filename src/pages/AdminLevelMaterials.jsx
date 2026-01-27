import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Switch } from "@/components/ui/switch";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Headphones, 
  PenTool, 
  FileText, 
  Video, 
  Calendar,
  Upload,
  Download,
  Sparkles
} from 'lucide-react';
import LessonSummaryGenerator from '@/components/ai/LessonSummaryGenerator';

const materialIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  grammar: FileText,
  vocabulary: FileText,
  video: Video,
  live_session: Calendar
};

export default function AdminLevelMaterials() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [formData, setFormData] = useState({
    level_id: levelId || '',
    title: '',
    description: '',
    material_type: 'reading',
    file_url: '',
    live_session_link: '',
    scheduled_date: '',
    duration_minutes: 0,
    is_free_preview: false,
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

  const { data: level } = useQuery({
    queryKey: ['course-level', levelId],
    queryFn: async () => {
      const levels = await WWClient.entities.CourseLevel.filter({ id: levelId });
      return levels[0];
    },
    enabled: !!levelId
  });

  const { data: language } = useQuery({
    queryKey: ['language', level?.language_id],
    queryFn: async () => {
      const langs = await WWClient.entities.Language.filter({ id: level.language_id });
      return langs[0];
    },
    enabled: !!level?.language_id
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['level-materials', levelId],
    queryFn: () => WWClient.entities.StudyMaterial.filter({ level_id: levelId }, 'display_order'),
    enabled: !!levelId,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingMaterial) {
        return WWClient.entities.StudyMaterial.update(editingMaterial._id, data);
      }
      return WWClient.entities.StudyMaterial.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['level-materials']);
      setDialogOpen(false);
      resetForm();
      toast.success(editingMaterial ? 'Material updated' : 'Material created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.StudyMaterial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['level-materials']);
      toast.success('Material deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      level_id: levelId || '',
      title: '',
      description: '',
      material_type: 'reading',
      file_url: '',
      live_session_link: '',
      scheduled_date: '',
      duration_minutes: 0,
      is_free_preview: false,
      display_order: 0
    });
    setEditingMaterial(null);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      level_id: material.level_id || levelId,
      title: material.title || '',
      description: material.description || '',
      material_type: material.material_type || 'reading',
      file_url: material.file_url || '',
      live_session_link: material.live_session_link || '',
      scheduled_date: material.scheduled_date || '',
      duration_minutes: material.duration_minutes || 0,
      is_free_preview: material.is_free_preview || false,
      display_order: material.display_order || 0
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await WWClient.integrations.Core.UploadFile( file );
      setFormData({ ...formData, file_url });
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleApplySummary = (summary) => {
    setFormData({
      ...formData,
      title: summary.title,
      description: summary.brief_summary
    });
    setShowAISummary(false);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || !level || !language) return <LoadingPage />;

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.material_type]) {
      acc[material.material_type] = [];
    }
    acc[material.material_type].push(material);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{language.flag}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {language.name} {level.level_name} - Study Materials
                  </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage learning resources for this level
                </p>
              </div>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>

            {materials.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No materials yet
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Add study materials for this level
                  </p>
                  <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Material
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMaterials).map(([type, items]) => {
                  const Icon = materialIcons[type];
                  return (
                    <Card key={type}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold capitalize">
                            {type.replace('_', ' ')}
                          </h3>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                        <div className="space-y-3">
                          {items.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-slate-900 dark:text-white">
                                    {material.title}
                                  </h4>
                                  {material.is_free_preview && (
                                    <Badge className="bg-green-100 text-green-700">Free Preview</Badge>
                                  )}
                                </div>
                                {material.description && (
                                  <p className="text-sm text-slate-500">{material.description}</p>
                                )}
                                {material.duration_minutes > 0 && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    {material.duration_minutes} minutes
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(material)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm('Delete this material?')) {
                                      deleteMutation.mutate(material.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{editingMaterial ? 'Edit Material' : 'Add New Material'}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAISummary(!showAISummary)}
                    className="border-amber-300 text-amber-600 hover:bg-amber-50"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Summary
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {showAISummary && (
                  <LessonSummaryGenerator onApply={handleApplySummary} />
                )}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Basic Grammar Rules"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Material Type *</Label>
                    <Select value={formData.material_type} onValueChange={(v) => setFormData({ ...formData, material_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="live_session">Live Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {formData.material_type === 'live_session' ? (
                  <>
                    <div className="space-y-2">
                      <Label>Google Meet Link</Label>
                      <Input
                        value={formData.live_session_link}
                        onChange={(e) => setFormData({ ...formData, live_session_link: e.target.value })}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scheduled Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>File</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.file_url}
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        placeholder="https://... or upload file"
                      />
                      <div>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          disabled={uploadingFile}
                        />
                        <label htmlFor="file-upload">
                          <Button type="button" variant="outline" disabled={uploadingFile} asChild>
                            <span>
                              {uploadingFile ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" />Upload</>}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Free Preview</Label>
                  <Switch
                    checked={formData.is_free_preview}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free_preview: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => saveMutation.mutate(formData)} 
                  disabled={saveMutation.isPending || !formData.title}
                >
                  {saveMutation.isPending ? 'Saving...' : editingMaterial ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}