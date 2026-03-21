import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Video,
  CalendarDays,
  FileText,
  BookOpen,
  Upload,
  Link as LinkIcon,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const contentTypes = ['live', 'recorded', 'mixed'];
const levels = ['A1', 'A2', 'B1', 'B2'];

export default function ManageCourse() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [currentLessonForMaterial, setCurrentLessonForMaterial] = useState(null);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    features: [],
    has_live_classes: true,
    has_recorded_lectures: true,
    includes_materials: true,
    level_structure: {}
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    order: 1,
    duration_minutes: 30,
    video_url: '',
    live_class_link: '',
    live_class_date: '',
    level: 'A1',
    has_recording: true,
    materials: [],
    practice_content: []
  });

  const [materialForm, setMaterialForm] = useState({
    name: '',
    url: '',
    type: 'pdf'
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

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await WWClient.entities.Course.filter({ id: courseId });
      const course = courses[0];
      if (course) {
        setCourseData({
          title: course.title || '',
          description: course.description || '',
          features: course.features || [],
          has_live_classes: course.has_live_classes !== false,
          has_recorded_lectures: course.has_recorded_lectures !== false,
          includes_materials: course.includes_materials !== false,
          level_structure: course.level_structure || {}
        });
      }
      return course;
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => WWClient.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Course.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course', courseId]);
      toast.success('Course updated successfully');
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: (data) => WWClient.entities.Lesson.create({ ...data, course_id: courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      setLessonDialogOpen(false);
      resetLessonForm();
      toast.success('Lesson created successfully');
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => WWClient.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      setLessonDialogOpen(false);
      setEditingLesson(null);
      resetLessonForm();
      toast.success('Lesson updated successfully');
    }
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => WWClient.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      toast.success('Lesson deleted successfully');
    }
  });

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      type: 'video',
      order: lessons.length + 1,
      duration_minutes: 30,
      video_url: '',
      live_class_link: '',
      live_class_date: '',
      level: 'A1',
      has_recording: true,
      materials: [],
      practice_content: []
    });
  };

  const handleSaveCourse = () => {
    updateCourseMutation.mutate(courseData);
  };

  const handleSaveLesson = () => {
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson._id || editingLesson.id, data: lessonForm });
    } else {
      createLessonMutation.mutate(lessonForm);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      type: lesson.type || 'video',
      order: lesson.order || 1,
      duration_minutes: lesson.duration_minutes || 30,
      video_url: lesson.video_url || '',
      live_class_link: lesson.live_class_link || '',
      live_class_date: lesson.live_class_date || '',
      level: lesson.level || 'A1',
      has_recording: lesson.has_recording !== false,
      materials: lesson.materials || [],
      practice_content: lesson.practice_content || []
    });
    setLessonDialogOpen(true);
  };

  const handleAddMaterial = () => {
    if (materialForm.name && materialForm.url) {
      setLessonForm({
        ...lessonForm,
        materials: [...lessonForm.materials, { ...materialForm }]
      });
      setMaterialForm({ name: '', url: '', type: 'pdf' });
      setMaterialDialogOpen(false);
    }
  };

  const handleRemoveMaterial = (index) => {
    setLessonForm({
      ...lessonForm,
      materials: lessonForm.materials.filter((_, i) => i !== index)
    });
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || courseLoading) return <LoadingPage />;
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found</p>
      </div>
    );
  }

  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorCourses" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('InstructorCourses')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Manage Course
              </h1>
              <p className="text-slate-600 dark:text-slate-400">{course.title}</p>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-white dark:bg-slate-800 mb-6">
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="content">Content & Lessons</TabsTrigger>
              <TabsTrigger value="structure">Level Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Course Title</Label>
                    <Input
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Content Features</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={courseData.has_live_classes}
                        onCheckedChange={(checked) => setCourseData({ ...courseData, has_live_classes: checked })}
                      />
                      <label className="text-sm">Live classes via Google Meet</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={courseData.has_recorded_lectures}
                        onCheckedChange={(checked) => setCourseData({ ...courseData, has_recorded_lectures: checked })}
                      />
                      <label className="text-sm">Recorded video lectures</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={courseData.includes_materials}
                        onCheckedChange={(checked) => setCourseData({ ...courseData, includes_materials: checked })}
                      />
                      <label className="text-sm">Study materials and books</label>
                    </div>
                  </div>

                  <Button onClick={handleSaveCourse} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lessons & Content</CardTitle>
                  <Button onClick={() => { resetLessonForm(); setEditingLesson(null); setLessonDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </CardHeader>
                <CardContent>
                  {sortedLessons.length === 0 ? (
                    <p className="text-center py-8 text-slate-500">No lessons yet. Create your first lesson.</p>
                  ) : (
                    <div className="space-y-3">
                      {sortedLessons.map((lesson) => (
                        <div key={lesson._id || lesson.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">#{lesson.order}</Badge>
                                <Badge>{lesson.level}</Badge>
                                {lesson.type === 'live' && <CalendarDays className="w-4 h-4 text-violet-500" />}
                                {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                                {lesson.type === 'reading' && <FileText className="w-4 h-4 text-green-500" />}
                              </div>
                              <h4 className="font-semibold text-slate-900 dark:text-white">{lesson.title}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{lesson.description}</p>
                              {lesson.live_class_link && (
                                <div className="mt-2 text-sm text-violet-600">
                                  Live link: {lesson.live_class_link}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditLesson(lesson)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteLessonMutation.mutate(lesson._id || lesson.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structure">
              <Card>
                <CardHeader>
                  <CardTitle>Course Structure by Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Define the structure and content for each CEFR level
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {levels.map(level => (
                      <div key={level} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">{level} Level</h3>
                        <div className="space-y-2">
                          <Label className="text-xs">Lessons Count</Label>
                          <Input
                            type="number"
                            value={courseData.level_structure[level]?.lessons_count || 0}
                            onChange={(e) => setCourseData({
                              ...courseData,
                              level_structure: {
                                ...courseData.level_structure,
                                [level]: {
                                  ...courseData.level_structure[level],
                                  lessons_count: Number(e.target.value)
                                }
                              }
                            })}
                          />
                          <Label className="text-xs">Practice Exercises</Label>
                          <Input
                            type="number"
                            value={courseData.level_structure[level]?.practice_exercises || 0}
                            onChange={(e) => setCourseData({
                              ...courseData,
                              level_structure: {
                                ...courseData.level_structure,
                                [level]: {
                                  ...courseData.level_structure[level],
                                  practice_exercises: Number(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveCourse} className="w-full mt-4">
                    <Save className="w-4 h-4 mr-2" />
                    Save Structure
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Lesson Dialog */}
          <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="live">Live Class</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={lessonForm.level} onValueChange={(v) => setLessonForm({ ...lessonForm, level: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={lessonForm.duration_minutes}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {lessonForm.type === 'video' && (
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {lessonForm.type === 'live' && (
                  <>
                    <div className="space-y-2">
                      <Label>Google Meet Link</Label>
                      <Input
                        value={lessonForm.live_class_link}
                        onChange={(e) => setLessonForm({ ...lessonForm, live_class_link: e.target.value })}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Live Class Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={lessonForm.live_class_date}
                        onChange={(e) => setLessonForm({ ...lessonForm, live_class_date: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={lessonForm.has_recording}
                        onCheckedChange={(checked) => setLessonForm({ ...lessonForm, has_recording: checked })}
                      />
                      <label className="text-sm">Has recorded version</label>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Study Materials</Label>
                    <Button size="sm" variant="outline" onClick={() => setMaterialDialogOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Material
                    </Button>
                  </div>
                  {lessonForm.materials.length > 0 && (
                    <div className="space-y-2">
                      {lessonForm.materials.map((material, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-sm">{material.name} ({material.type})</span>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveMaterial(idx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveLesson}>
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Material Dialog */}
          <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Study Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Material Name</Label>
                  <Input
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    placeholder="e.g., Vocabulary List"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={materialForm.url}
                    onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={materialForm.type} onValueChange={(v) => setMaterialForm({ ...materialForm, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMaterial}>Add Material</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}