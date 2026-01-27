import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Shield,
  Globe,
  Camera,
  Save
} from 'lucide-react';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function StudentSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    preferred_language: '',
    timezone: 'UTC',
    dark_mode: false,
    notification_preferences: {
      email: true,
      in_app: true
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        preferred_language: userData.preferred_language || '',
        timezone: userData.timezone || 'UTC',
        dark_mode: userData.dark_mode || false,
        notification_preferences: userData.notification_preferences || {
          email: true,
          in_app: true
        }
      });
      setLoading(false);
    };
    loadUser();
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => WWClient.auth.updateMe(data),
    onSuccess: () => {
      toast.success('Settings saved successfully');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="StudentSettings" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your account settings and preferences
            </p>
          </motion.div>

          <div className="max-w-3xl space-y-6">
            {/* Profile Section */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-2xl">
                      {formData.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email} disabled className="bg-slate-50" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    <Select 
                      value={formData.preferred_language} 
                      onValueChange={(v) => setFormData({ ...formData, preferred_language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(v) => setFormData({ ...formData, timezone: v })}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-600" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={formData.notification_preferences?.email}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notification_preferences: {
                        ...formData.notification_preferences,
                        email: checked
                      }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">In-App Notifications</p>
                    <p className="text-sm text-slate-500">Receive notifications in the app</p>
                  </div>
                  <Switch
                    checked={formData.notification_preferences?.in_app}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notification_preferences: {
                        ...formData.notification_preferences,
                        in_app: checked
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-600" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>
                  Customize how the app looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-slate-500">Use dark theme</p>
                  </div>
                  <Switch
                    checked={formData.dark_mode}
                    onCheckedChange={(checked) => setFormData({ ...formData, dark_mode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}