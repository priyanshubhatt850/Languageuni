import React, { useState, useEffect } from 'react';
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
import { Switch } from "@/components/ui/switch";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BookOpen, 
  Headphones, 
  PenTool, 
  FileText, 
  Video, 
  Calendar,
  Upload
} from 'lucide-react';

const materialIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  grammar: FileText,
  vocabulary: FileText,
  video: Video,
  live_session: Calendar
};

export default function AdminStudyMaterials() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    level_id: '',
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

  const { data: materials = [] } = useQuery({
    queryKey: ['all-study-materials'],
    queryFn: () => WWClient.entities.StudyMaterial.list(),
    initialData: []
  });

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

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
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
      queryClient.invalidateQueries(['all-study-materials']);
      setDialogOpen(false);
      resetForm();
      toast.success(editingMaterial ? 'Material updated' : 'Material created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.StudyMaterial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-study-materials']);
      toast.success('Material deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      level_id: '',
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
      level_id: material.level_id || '',
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

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || material.level_id === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminStudyMaterials" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Study Materials
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage learning resources for each level
              </p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </motion.div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(level => {
                      const language = languages.find(l => l.id === level.language_id);
                      return (
                        <SelectItem key={level.id} value={level.id}>
                          {language?.flag} {language?.name} - {level.level_name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Free Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No materials found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map(material => {
                      const level = levels.find(l => l.id === material.level_id);
                      const language = languages.find(l => l.id === level?.language_id);
                      const Icon = materialIcons[material.material_type];
                      
                      return (
                        <TableRow key={material.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{material.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {language?.flag} {language?.name} - {level?.level_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{material.material_type}</Badge>
                          </TableCell>
                          <TableCell>{material.duration_minutes || 0} min</TableCell>
                          <TableCell>
                            {material.is_free_preview ? (
                              <Badge className="bg-green-100 text-green-700">Free</Badge>
                            ) : (
                              <Badge variant="secondary">Paid</Badge>
                            )}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Course Level *</Label>
                  <Select value={formData.level_id} onValueChange={(v) => setFormData({ ...formData, level_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => {
                        const language = languages.find(l => l.id === level.language_id);
                        return (
                          <SelectItem key={level.id} value={level.id}>
                            {language?.flag} {language?.name} - {level.level_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

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
                  disabled={saveMutation.isPending || !formData.level_id || !formData.title}
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