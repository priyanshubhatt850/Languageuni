import React, { useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings,
  Globe,
  CreditCard,
  Mail,
  Shield,
  Save
} from 'lucide-react';

export default function AdminSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'LinguaLearn',
    siteDescription: 'Master any language with expert instructors',
    supportEmail: 'support@linguallearn.com',
    defaultCurrency: 'USD',
    defaultRevenueShare: 70,
    enableRegistration: true,
    enableInstructorSignup: true,
    requireEmailVerification: true,
    maintenanceMode: false
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminSettings" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Platform Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Configure your learning platform settings
            </p>
          </motion.div>

          <div className="max-w-3xl space-y-6">
            {/* General Settings */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-600" />
                  <CardTitle>General Settings</CardTitle>
                </div>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Site Description</Label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-violet-600" />
                  <CardTitle>Payment Settings</CardTitle>
                </div>
                <CardDescription>Configure payment and revenue settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Instructor Revenue Share (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.defaultRevenueShare}
                      onChange={(e) => setSettings({ ...settings, defaultRevenueShare: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Settings */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-600" />
                  <CardTitle>Registration & Security</CardTitle>
                </div>
                <CardDescription>User registration and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Enable User Registration</p>
                    <p className="text-sm text-slate-500">Allow new users to sign up</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Enable Instructor Signup</p>
                    <p className="text-sm text-slate-500">Allow users to apply as instructors</p>
                  </div>
                  <Switch
                    checked={settings.enableInstructorSignup}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableInstructorSignup: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Require Email Verification</p>
                    <p className="text-sm text-slate-500">Users must verify email before accessing courses</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-600" />
                  <CardTitle>Maintenance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Maintenance Mode</p>
                    <p className="text-sm text-slate-500">Temporarily disable access to the platform</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}