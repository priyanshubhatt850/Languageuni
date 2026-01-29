import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  GraduationCap,
  Award,
  Link as LinkIcon,
  ArrowRight,
  Check,
  Upload,
  Camera,
  Phone,
  FileText
} from 'lucide-react';

export default function InstructorOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: languages = [] } = useQuery({
    queryKey: ['available-languages'],
    queryFn: () => WWClient.entities.Language.filter({ is_active: true }, 'name'),
    initialData: []
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    phone_number: '',
    resume_url: '',
    languages_taught: [],
    qualifications: [],
    years_experience: 0,
    social_links: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const [qualificationInput, setQualificationInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        display_name: userData?.full_name || ''
      }));
    };
    loadUser();
  }, []);

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Create instructor profile
      await WWClient.entities.InstructorProfile.create({
        ...data,
        user_id: user.id,
        user_email: user.email,
        verification_status: 'pending'
      });

      // Update instructor counts for selected languages
      for (const langId of data.languages_taught) {
        const lang = languages.find(l => l._id === langId);
        if (lang) {
          await WWClient.entities.Language.update(langId, {
            instructor_count: (lang.instructor_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      toast.success('Profile created successfully!');
      navigate(createPageUrl('InstructorDashboard'));
    }
  });

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, qualificationInput.trim()]
      });
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index)
    });
  };

  const toggleLanguage = (langId) => {
    if (formData.languages_taught.includes(langId)) {
      setFormData({
        ...formData,
        languages_taught: formData.languages_taught.filter(l => l !== langId)
      });
    } else {
      setFormData({
        ...formData,
        languages_taught: [...formData.languages_taught, langId]
      });
    }
  };

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await WWClient.integrations.Core.UploadFile( file );
      setFormData({ ...formData, avatar_url: file_url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      const { file_url } = await WWClient.integrations.Core.UploadFile( file );
      setFormData({ ...formData, resume_url: file_url });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    // International phone number validation supporting multiple countries
    const internationalPhoneRegex = /^[\+]?(?:[\d\s\-\(\)]{7,})[\d]$|^[\+]?[1-9]\d{1,14}$/;
    
    // More flexible validation - accepts various international formats
    const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Check if it starts with + or a digit
    if (!cleanedPhone.match(/^[\+]?[0-9]/)) return false;
    
    // Check minimum length (at least 7 digits after cleaning)
    const digitsOnly = cleanedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7) return false;
    
    // Maximum length for international numbers (15 digits per E.164 standard)
    if (digitsOnly.length > 15) return false;
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.display_name) {
      toast.error('Please enter your display name');
      return;
    }
    if (currentStep === 1 && !formData.phone_number) {
      toast.error('Please enter your phone number');
      return;
    }
    if (currentStep === 1 && !validatePhoneNumber(formData.phone_number)) {
      toast.error('Please enter a valid international phone number (e.g., +1 555 000 0000, +1 (555) 000-0000, or 555-000-0000)');
      return;
    }
    if (currentStep === 2 && formData.languages_taught.length === 0) {
      toast.error('Please select at least one language you teach');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = () => {
    if (!formData.resume_url) {
      toast.error('Please upload your resume');
      return;
    }
    if (formData.qualifications.length === 0) {
      toast.error('Please add at least one qualification');
      return;
    }
    createProfileMutation.mutate(formData);
  };

  const stepProgress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Instructor Profile</h1>
          <p className="text-slate-300">Step {currentStep} of 3</p>
          <Progress value={stepProgress} className="mt-4 h-2" />
        </motion.div>

        <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Teaching Expertise'}
              {currentStep === 3 && 'Qualifications & Experience'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-slate-200">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full bg-slate-700/50 border-2 border-slate-600 overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            {uploadingImage ? (
                              'Uploading...'
                            ) : (
                              <>
                                <Camera className="w-4 h-4 mr-2" />
                                Upload Photo
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Display Name *</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="How you want to be known"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell students about yourself and your teaching philosophy..."
                    rows={5}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Years of Teaching Experience</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="e.g., +1 (555) 000-0000 or +44 20 7946 0958"
                      className={`pl-10 bg-slate-700/50 border-slate-600 text-white ${
                        formData.phone_number && !validatePhoneNumber(formData.phone_number)
                          ? 'border-red-500 border-2'
                          : ''
                      }`}
                    />
                  </div>
                  {formData.phone_number && !validatePhoneNumber(formData.phone_number) && (
                    <p className="text-xs text-red-400">Please enter a valid phone number. Examples: +1 (555) 000-0000, +44 20 7946 0958, +91 98765 43210</p>
                  )}
                  <p className="text-xs text-slate-400">Supports international formats from any country</p>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-slate-200">Languages You Teach *</Label>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search languages..."
                    className="bg-slate-700/50 border-slate-600 text-white mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {filteredLanguages.map(lang => (
                      <Badge
                        key={lang.id}
                        onClick={() => toggleLanguage(lang._id)}
                        className={`cursor-pointer justify-center py-2 ${
                          formData.languages_taught.includes(lang._id)
                            ? 'bg-violet-600 hover:bg-violet-700'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {formData.languages_taught.includes(lang._id) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {lang.flag} {lang.name}
                      </Badge>
                    ))}
                  </div>
                  {filteredLanguages.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4">No languages found</p>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-slate-200">Resume/CV *</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        className="hidden"
                        id="resume-upload"
                        disabled={uploadingResume}
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingResume}
                          className={`w-full cursor-pointer ${
                            !formData.resume_url ? 'border-red-500 text-red-400' : ''
                          }`}
                          asChild
                        >
                          <span>
                            {uploadingResume ? (
                              'Uploading...'
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Resume (PDF)
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-slate-400 mt-1">PDF only, max 5MB</p>
                    </div>
                    {formData.resume_url && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                        <FileText className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {!formData.resume_url && currentStep === 3 && (
                    <p className="text-xs text-amber-400">Resume is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Qualifications & Certifications *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={qualificationInput}
                      onChange={(e) => setQualificationInput(e.target.value)}
                      placeholder="e.g., TEFL Certified"
                      className="bg-slate-700/50 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
                    />
                    <Button onClick={handleAddQualification} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.qualifications.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.qualifications.map((qual, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-violet-400" />
                            <span className="text-white">{qual}</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveQualification(idx)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-200">Social Links (Optional)</Label>
                  <Input
                    value={formData.social_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="LinkedIn URL"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Input
                    value={formData.social_links.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    placeholder="Personal Website"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createProfileMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  {createProfileMutation.isPending ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}