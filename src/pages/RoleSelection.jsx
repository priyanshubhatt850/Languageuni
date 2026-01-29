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
    title: 'Instructor',
    subtitle: 'Teach & Create Courses',
    description: 'Create courses, manage students, and track your teaching success',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600',
    route: 'InstructorDashboard'
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Learn & Grow',
    description: 'Access courses, track progress, and earn certificates',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600',
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
    await WWClient.functions.invoke('sendOTP', {
      email: email,
      service_type: selectedRole.id
    });

    setLoading(true);
    // Simulate sending OTP
    setOtpSent(true);
    setLoading(false);
    toast.success('OTP sent to your email!');
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    const data = await WWClient.functions.invoke('verifyOTP', {
      email,
      otp: otp.trim()
    });

    setLoading(true);

    if (data?.success) {
      await checkUserAuth();

      const { role, profileCompleted } = data.user;

      if (role === 'instructor') {
        navigate(profileCompleted ? '/InstructorDashboard' : '/InstructorOnboarding');
      }
      else if (role === 'student') {
        navigate(profileCompleted ? '/StudentDashboard' : '/StudentOnboarding');
      }
      else {
        // fallback (optional)
        navigate('/');
      }

      toast.success('OTP verified! Redirecting...');
    }


    // Simulate OTP verification
    // setTimeout(async () => {
    //   try {
    //     // Check if user is authenticated
    //     const isAuth = await WWClient.auth.isAuthenticated();

    //     if (isAuth) {
    //       // User is logged in, check profile completion
    //       const user = await WWClient.auth.me();

    //       // Check if profile is complete based on role
    //       if (selectedRole.id === 'instructor') {
    //         // Check if instructor profile exists
    //         const instructorProfiles = await WWClient.entities.InstructorProfile.filter({ user_id: user.id });
    //         if (instructorProfiles.length === 0) {
    //           // No profile, redirect to onboarding
    //           navigate(createPageUrl('InstructorOnboarding'));
    //           return;
    //         }
    //       } else if (selectedRole.id === 'student') {
    //         // Check if student completed onboarding
    //         if (!user.onboarding_completed) {
    //           // Not completed, redirect to onboarding
    //           navigate(createPageUrl('StudentOnboarding'));
    //           return;
    //         }
    //       }

    //       navigate(createPageUrl(selectedRole.route));
    //     } else {
    //       // Redirect to Base44 login with return URL
    //       WWClient.auth.redirectToLogin(createPageUrl(selectedRole.route));
    //     }
    //   } catch (error) {
    //     toast.error('Authentication failed. Please try again.');
    //     setLoading(false);
    //   }
    // }, 1500);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

        <div className="max-w-6xl w-full relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Language Uni</h1>
            </div>
            <p className="text-lg text-slate-300">Select your role to get started</p>
          </motion.div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="border-0 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group hover:scale-105"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-2xl ${role.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${role.iconColor}`} />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
                      <p className={`text-sm font-medium bg-gradient-to-r ${role.color} bg-clip-text text-transparent mb-3`}>
                        {role.subtitle}
                      </p>
                      <p className="text-sm text-slate-400 mb-4">{role.description}</p>

                      <Button
                        className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          {/* <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-slate-400 mt-8"
            >
              Don't have an account? <button className="text-violet-400 hover:text-violet-300 font-medium">Sign up</button>
            </motion.p> */}
        </div>

        {/* OTP Dialog */}
        <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRole && (
                  <>
                    {React.createElement(selectedRole.icon, { className: `w-5 h-5 ${selectedRole.iconColor}` })}
                    Login as {selectedRole.title}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {otpSent
                  ? 'Enter the 6-digit OTP sent to your email'
                  : 'Enter your email to receive an OTP'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${selectedRole?.color}`}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-400">Or</span>
                    </div>
                  </div>

                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="dark"
                    size="large"
                    width="100%"
                  />
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                        className="pl-10 text-center text-2xl tracking-widest font-mono"
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      OTP sent to {email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      className="flex-1"
                    >
                      Change Email
                    </Button>
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading}
                      className={`flex-1 bg-gradient-to-r ${selectedRole?.color}`}
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSendOTP}
                    className="w-full text-sm"
                    disabled={loading}
                  >
                    Resend OTP
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