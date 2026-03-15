import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BookOpen,
  ArrowRight,
  Check,
  Upload,
  User
} from 'lucide-react';

const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];
const proficiencyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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

  const interestOptions = ['Business', 'Travel', 'Conversation', 'Grammar', 'Exam Preparation', 'Cultural Studies'];

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
      const { file_url } = await WWClient.integrations.Core.UploadFile( file );
      setAvatarUrl(file_url);
      toast.success('Profile picture uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language you want to learn');
      return;
    }

    // Save preferences to user metadata
    await WWClient.auth.updateMe({
      onboarding_completed: true,
      profileCompleted:true,
      learning_languages: selectedLanguages,
      learning_interests: interests,
      avatar_url: avatarUrl
    });

    toast.success('Welcome to Global Tongue!');
    navigate('/StudentDashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Global Tongue!</h1>
          <p className="text-slate-300">Let's personalize your learning journey</p>
        </motion.div>

        <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                    <User className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors">
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
              <p className="text-slate-400 text-sm mt-2">
                {uploading ? 'Uploading...' : 'Upload profile picture'}
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-white font-semibold mb-3">What languages do you want to learn?</h3>
              <div className="grid grid-cols-2 gap-2">
                {languages.map(lang => (
                <Badge
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`cursor-pointer justify-center py-3 text-sm ${
                    selectedLanguages.includes(lang)
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {selectedLanguages.includes(lang) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-white font-semibold mb-3">What are you interested in?</h3>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map(interest => (
                  <Badge
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`cursor-pointer justify-center py-3 text-sm ${
                      interests.includes(interest)
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {interests.includes(interest) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-lg py-6"
            >
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}