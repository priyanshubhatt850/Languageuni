import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Mail,
  Lock,
  Chrome
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const roles = [
  {
    id: 'instructor',
    title: 'Instructor Partner',
    subtitle: 'Teach & Build Curriculum',
    description: 'Design courses, publish levels, track teaching analytics, and manage class structures.',
    icon: GraduationCap,
    color: 'from-violet-600 to-purple-650',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    iconColor: 'text-violet-400',
    btnBg: 'bg-violet-600 hover:bg-violet-700',
    route: 'InstructorDashboard'
  },
  {
    id: 'student',
    title: 'Student Learner',
    subtitle: 'Fluency & Practice Center',
    description: 'Immerse yourself in active study materials, track progress loops, and earn certifications.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-450',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    route: 'StudentDashboard'
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkUserAuth, user } = useAuth();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowOTPDialog(true);
    setOtpSent(false);
    setOTP('');
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await WWClient.functions.invoke('sendOTP', {
        email: email,
        service_type: selectedRole.id
      });
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (e) {
      toast.error('Failed to send OTP. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const data = await WWClient.functions.invoke('verifyOTP', {
        email,
        otp: otp.trim()
      });

      if (data?.success) {
        await checkUserAuth();
        const { role, profileCompleted } = data.user;

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
        } else if (role === 'student') {
          navigate(profileCompleted ? '/StudentDashboard' : '/StudentOnboarding');
        } else {
          navigate('/');
        }
        toast.success('OTP verified! Redirecting...');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (e) {
      toast.error('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await WWClient.functions.invoke('verifyGoogleToken', {
        googletoken: credentialResponse.credential,
        service_type: selectedRole.id
      });

      if (data?.success) {
        await checkUserAuth();
        const { role, profileCompleted } = data.user;

        if (role === 'instructor') {
          navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
        } else if (role === 'student') {
          navigate(profileCompleted ? '/StudentDashboard' : '/StudentOnboarding');
        } else {
          navigate('/');
        }
        toast.success('Google login successful!');
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glowing gradient elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-4xl w-full relative z-10 space-y-12">
          {/* Brand logo header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="Global Tongue logo" className="w-12 h-12 object-contain rounded-2xl shadow-lg shadow-violet-500/20" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Tongue</h1>
            </div>
            <p className="text-slate-400 font-medium text-sm">Select your gateway to begin</p>
          </motion.div>

          {/* Core Roles Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="h-full"
                >
                  <Card
                    className="border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer group hover:scale-[1.02] rounded-2xl h-full flex flex-col justify-between"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <CardContent className="p-6 flex flex-col h-full justify-between space-y-6">
                      <div className="space-y-4">
                        <div className={`w-14 h-14 rounded-2xl ${role.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Icon className={`w-7 h-7 ${role.iconColor}`} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-white tracking-tight">{role.title}</h3>
                          <p className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                            {role.subtitle}
                          </p>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-light">{role.description}</p>
                      </div>

                      <Button
                        className={`w-full ${role.btnBg} text-white font-bold h-11 rounded-xl shadow-md transition-all flex items-center justify-center`}
                      >
                        Enter Platform
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* OTP Auth Dialog */}
        <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
          <DialogContent className="sm:max-w-md border border-slate-850 bg-slate-900 text-white rounded-2xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2.5 text-base font-bold">
                {selectedRole && (
                  <>
                    <div className={`w-8 h-8 rounded-lg ${selectedRole.iconBg} border flex items-center justify-center shrink-0`}>
                      {React.createElement(selectedRole.icon, { className: `w-4.5 h-4.5 ${selectedRole.iconColor}` })}
                    </div>
                    <span>Login as {selectedRole.title}</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                {otpSent
                  ? 'Verify by entering the code sent to your email.'
                  : 'Receive a secure, passwordless one-time pass code.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-11 bg-slate-950 border-slate-800 text-sm text-white focus-visible:ring-violet-500 focus-visible:border-violet-500 rounded-xl"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className={`w-full bg-violet-600 hover:bg-violet-755 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-violet-650/10`}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="px-3 bg-slate-900 text-slate-500">Or Continue With</span>
                    </div>
                  </div>

                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      theme="dark"
                      size="large"
                      width="384px"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter Verification Code</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                        className="pl-11 h-11 bg-slate-950 border-slate-800 text-center text-xl tracking-[0.4em] font-mono font-bold text-white focus-visible:ring-violet-500 rounded-xl"
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                      />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Sent to: <span className="text-slate-350">{email}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 rounded-xl h-11 border-slate-800 hover:bg-slate-850 hover:text-white font-bold text-slate-300"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading}
                      className={`flex-1 bg-violet-600 hover:bg-violet-755 text-white font-bold h-11 rounded-xl transition-all shadow-md shadow-violet-650/10`}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSendOTP}
                    className="w-full text-xs font-semibold text-slate-400 hover:text-white"
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
}