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
import { Checkbox } from "@/components/ui/checkbox";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const categories = ['General', 'Business', 'Conversation', 'Grammar', 'Vocabulary', 'Exam Prep'];

export default function AdminManageCourse() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const isEdit = !!courseId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    level: 'A1',
    category: 'General',
    price: 0,
    discount_price: null,
    instructor_id: '',
    duration_hours: 0,
    total_lessons: 0,
    status: 'draft',
    features: [],
    has_live_classes: true,
    has_recorded_lectures: true,
    includes_materials: true,
    thumbnail_url: ''
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
        setFormData({
          title: course.title || '',
          description: course.description || '',
          language: course.language || '',
          level: course.level || 'A1',
          category: course.category || 'General',
          price: course.price || 0,
          discount_price: course.discount_price || null,
          instructor_id: course.instructor_id || '',
          duration_hours: course.duration_hours || 0,
          total_lessons: course.total_lessons || 0,
          status: course.status || 'draft',
          features: course.features || [],
          has_live_classes: course.has_live_classes !== false,
          has_recorded_lectures: course.has_recorded_lectures !== false,
          includes_materials: course.includes_materials !== false,
          thumbnail_url: course.thumbnail_url || ''
        });
      }
      return course;
    },
    enabled: isEdit
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => WWClient.entities.Language.filter({ is_active: true }, 'display_order'),
    initialData: []
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['approved-instructors'],
    queryFn: async () => {
      const profiles = await WWClient.entities.InstructorProfile.filter({ verification_status: 'approved' });
      const userIds = profiles.map(p => p.user_id);
      const users = await Promise.all(userIds.map(id => WWClient.entities.User.filter({ id })));
      return profiles.map((profile, idx) => ({
        ...profile,
        full_name: users[idx][0]?.full_name || 'Unknown'
      }));
    },
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
      if (isEdit) {
        return WWClient.entities.Course.update(courseId, data);
      } else {
        return WWClient.entities.Course.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      toast.success(isEdit ? 'Course updated successfully' : 'Course created successfully');
      navigate(createPageUrl('AdminCourses'));
    }
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.language || !formData.instructor_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || (isEdit && courseLoading)) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourses" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('AdminCourses')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Course' : 'Create New Course'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isEdit ? 'Update course information' : 'Add a new course to the platform'}
              </p>
            </div>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Course Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Spanish for Beginners"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the course..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(v) => setFormData({ ...formData, language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.id} value={lang.name}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(v) => setFormData({ ...formData, level: v })}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label>Assign Instructor *</Label>
                  <Select 
                    value={formData.instructor_id} 
                    onValueChange={(v) => setFormData({ ...formData, instructor_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map(instructor => (
                        <SelectItem key={instructor.id} value={instructor.user_id}>
                          {instructor.display_name} ({instructor.full_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Only approved instructors are shown</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Price ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.discount_price || ''}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Course Features</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.has_live_classes}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_live_classes: checked })}
                    />
                    <label className="text-sm">Live classes via Google Meet</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.has_recorded_lectures}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_recorded_lectures: checked })}
                    />
                    <label className="text-sm">Recorded video lectures</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.includes_materials}
                      onCheckedChange={(checked) => setFormData({ ...formData, includes_materials: checked })}
                    />
                    <label className="text-sm">Study materials and books</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(createPageUrl('AdminCourses'))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}