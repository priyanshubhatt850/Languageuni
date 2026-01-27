import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Save,
  Camera,
  Plus,
  X,
  Globe,
  Linkedin,
  Twitter
} from 'lucide-react';

const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];

export default function InstructorProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLanguage, setNewLanguage] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    languages_taught: [],
    qualifications: [],
    years_experience: 0,
    social_links: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: instructorProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      const profiles = await WWClient.entities.InstructorProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (instructorProfile) {
      setFormData({
        display_name: instructorProfile.display_name || user?.full_name || '',
        bio: instructorProfile.bio || '',
        languages_taught: instructorProfile.languages_taught || [],
        qualifications: instructorProfile.qualifications || [],
        years_experience: instructorProfile.years_experience || 0,
        social_links: instructorProfile.social_links || {
          linkedin: '',
          twitter: '',
          website: ''
        }
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        display_name: user.full_name || ''
      }));
    }
  }, [instructorProfile, user]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (instructorProfile) {
        return await WWClient.entities.InstructorProfile.update(instructorProfile.id, data);
      } else {
        return await WWClient.entities.InstructorProfile.create({
          ...data,
          user_id: user.id,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-profile']);
      toast.success('Profile saved successfully');
    }
  });

  const addLanguage = () => {
    if (newLanguage && !formData.languages_taught.includes(newLanguage)) {
      setFormData({
        ...formData,
        languages_taught: [...formData.languages_taught, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang) => {
    setFormData({
      ...formData,
      languages_taught: formData.languages_taught.filter(l => l !== lang)
    });
  };

  const addQualification = () => {
    if (newQualification && !formData.qualifications.includes(newQualification)) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification]
      });
      setNewQualification('');
    }
  };

  const removeQualification = (qual) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter(q => q !== qual)
    });
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || profileLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="instructor" currentPage="InstructorProfile" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Instructor Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your public profile and credentials
            </p>
          </motion.div>

          <div className="max-w-3xl space-y-6">
            {/* Verification Status */}
            {instructorProfile && (
              <Card className={`border-0 shadow-sm ${
                instructorProfile.verification_status === 'approved' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : instructorProfile.verification_status === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Verification Status
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {instructorProfile.verification_status === 'approved' 
                        ? 'Your profile is verified and visible to students'
                        : instructorProfile.verification_status === 'pending'
                        ? 'Your profile is under review'
                        : 'Your profile verification was rejected'
                      }
                    </p>
                  </div>
                  <Badge className={
                    instructorProfile.verification_status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : instructorProfile.verification_status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }>
                    {instructorProfile.verification_status}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Basic Info */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  <CardTitle>Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-2xl">
                      {formData.display_name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell students about yourself, your teaching style, and experience..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Languages You Teach</CardTitle>
                <CardDescription>Add the languages you can teach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.languages_taught.map((lang) => (
                    <Badge key={lang} variant="secondary" className="px-3 py-1">
                      {lang}
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select a language</option>
                    {languages
                      .filter(l => !formData.languages_taught.includes(l))
                      .map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))
                    }
                  </select>
                  <Button onClick={addLanguage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Qualifications & Certifications</CardTitle>
                <CardDescription>Add your teaching certifications and degrees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.qualifications.map((qual) => (
                    <Badge key={qual} variant="outline" className="px-3 py-1">
                      {qual}
                      <button
                        onClick={() => removeQualification(qual)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="e.g., TEFL Certified, MA in Linguistics"
                    onKeyPress={(e) => e.key === 'Enter' && addQualification()}
                  />
                  <Button onClick={addQualification} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Add your professional social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </Label>
                  <Input
                    value={formData.social_links?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" /> Twitter
                  </Label>
                  <Input
                    value={formData.social_links?.twitter || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Website
                  </Label>
                  <Input
                    value={formData.social_links?.website || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => saveMutation.mutate(formData)}
                disabled={saveMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}