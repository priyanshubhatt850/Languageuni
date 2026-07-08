import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WWClient } from '@/api/WWClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BookOpen,
  ArrowRight,
  Check,
  Upload,
  User,
  Sparkles,
  Shield,
  GraduationCap
} from 'lucide-react';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';

const languagesList = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Portuguese', flag: '🇵🇹' },
  { name: 'Mandarin', flag: '🇨🇳' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Korean', flag: '🇰🇷' },
  { name: 'Arabic', flag: '🇸🇦' }
];

const interestOptions = ['Business', 'Travel', 'Conversation', 'Grammar', 'Exam Prep', 'Culture'];

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [interests, setInterests] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadImageToCloudinary(file, {
        folder: 'language-uni/student-avatars',
        tags: ['student', 'avatar']
      });
      setAvatarUrl(response.file_url);
      toast.success('Profile picture uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language you want to learn');
      return;
    }

    try {
      await WWClient.auth.updateMe({
        onboarding_completed: true,
        profileCompleted: true,
        learning_languages: selectedLanguages,
        learning_interests: interests,
        avatar_url: avatarUrl
      });

      toast.success('Welcome to Global Tongue!');
      navigate('/StudentDashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/30 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Welcome to Global Tongue!</h1>
          <p className="text-slate-500 text-sm font-medium">Let's personalize your language learning journey.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-slate-100 bg-white rounded-[28px] shadow-2xl shadow-emerald-950/5 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center py-2">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-550 font-bold mt-2.5">
                  {uploading ? 'Uploading avatar...' : 'Upload Profile Picture (Optional)'}
                </p>
              </div>

              {/* Target Languages */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">What languages do you want to learn?</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {languagesList.map(lang => {
                    const isSelected = selectedLanguages.includes(lang.name);
                    return (
                      <button
                        key={lang.name}
                        onClick={() => toggleLanguage(lang.name)}
                        className={`py-3 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350'
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">What are you interested in?</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {interestOptions.map(interest => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`py-3 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-emerald-605 border-emerald-605 text-white shadow-md shadow-emerald-600/10'
                            : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complete Onboarding Button */}
              <Button
                onClick={handleComplete}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold h-13 text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2 mt-4"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}