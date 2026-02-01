import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/components/ui/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeChat from '@/components/common/PracticeChat';
import MaterialViewer from '@/components/learning/MaterialViewer';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  PenTool,
  FileText,
  Video,
  Calendar,
  Download,
  Lock,
  CheckCircle,
  Users,
  Clock,
  Star,
  Award,
  Target,
  Moon,
  Sun,
  Play,
  Bot,
  GraduationCap,
  Zap,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { loadScript } from "@paypal/paypal-js";
import CryptoJS from "crypto-js";

const materialIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  grammar: FileText,
  vocabulary: FileText,
  video: Video,
  live_session: Calendar
};
const KEY = import.meta.env.VITE_MATERIAL_ENCRYPTION_KEY

const decryptMaterials = (materials) => {
  if (!materials?.content || !materials?.iv) return [];

  try {
    const key = CryptoJS.enc.Utf8.parse(KEY); // SAME key
    const iv = CryptoJS.enc.Hex.parse(materials.iv);
    const ciphertext = CryptoJS.enc.Hex.parse(materials.content);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    const text = decrypted.toString(CryptoJS.enc.Utf8);

    if (!text) {
      throw new Error("Empty decrypt result");
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("Decrypt failed:", err);
    return [];
  }
};



export default function LevelDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [showPracticeChat, setShowPracticeChat] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [showPayPal, setShowPayPal] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const paypalContainerRef = useRef(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await WWClient.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Only fetch courseData after user is loaded
  const [userLoaded, setUserLoaded] = useState(false);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await WWClient.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setUserLoaded(true);
      }
    };
    loadUser();
  }, []);

  // Unified API call for all course details, enabled only after user is loaded
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['level-detail', levelId, user?._id],
    queryFn: async () => {
      return WWClient.entities.Enrollment.getwithparams('getCoursematerialDetails', {
        levelId
      });
    },
    enabled: !!levelId && userLoaded,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  // Extract unified data
  const level = courseData?.level;
  const language = courseData?.language;
  const materials = decryptMaterials(courseData?.materials) || [];
  console.log(materials, "these are materials ")
  const enrollment = courseData?.enrollment;
  const hasAccess = courseData?.hasAccess;

  const enrollMutation = useMutation({
    mutationFn: () => WWClient.entities.Enrollment.create({
      user_id: user._id,
      course_id: levelId,
      instructor_id: level.instructor_id,
      payment_amount: level.discount_price || level.price,
      payment_status: 'completed',
      status: 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);

      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          shapes: ['square'],
          scalar: 1.2,
          gravity: 0.8,
          drift: 0.5
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          shapes: ['square'],
          scalar: 1.2,
          gravity: 0.8,
          drift: -0.5
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      }());
    }
  });
  const startPaypalMutation = useMutation({
    mutationFn: ({ amount, levelId, redirectRoute }) => WWClient.entities.Enrollment.postwithparams('startPaypalPayment', {
      amount,
      levelId,
      redirectRoute
    })
  })
  // Load PayPal SDK dynamically
  useEffect(() => {
    loadScript({ "client-id": "AZ9mQV1dm76WOaOQfKRdJq0nZ8I7B9DtW9Xnv25aB2OOJYhA-7Dl00p0PxY704pVZBtR1zE3VRw_pyDl" }); // Replace YOUR_PAYPAL_CLIENT_ID with your actual PayPal client ID
  }, []);

  // Render PayPal buttons when modal is shown
  useEffect(() => {
    if (!showPayPal || !window.paypal || !paypalContainerRef.current) return;

    window.paypal
      .Buttons({
        createOrder: async (data, actions) => {
          const response = await startPaypalMutation.mutateAsync({
            amount: level.discount_price || level.price,
            levelId: levelId,
            redirectRoute: `LevelDetail?id=${levelId}`, // ✅ FIXED
            instructor_id: level.instructor_id
          });
          return response.paypal.id; // must return PayPal orderId
        },

        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          enrollMutation.mutate();
          setShowPayPal(false);
        },

        onCancel: () => {
          setShowPayPal(false);
        },

        onError: (err) => {
          console.error("PayPal error:", err);
          setShowPayPal(false);
        },
      })
      .render(paypalContainerRef.current);

    // 🧹 cleanup (important if showPayPal toggles)
    return () => {
      paypalContainerRef.current.innerHTML = "";
    };
  }, [showPayPal, levelId]);

  if (!level || !language) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="hover:bg-violet-100 dark:hover:bg-violet-900/30"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.material_type]) {
      acc[material.material_type] = [];
    }
    acc[material.material_type].push(material);
    return acc;
  }, {});

  const features = [
    {
      icon: Video,
      label: 'HD Video Lessons',
      description: 'High-quality recorded lectures available 24/7'
    },
    {
      icon: Calendar,
      label: 'Live Classes',
      description: 'Interactive sessions with expert instructors'
    },
    {
      icon: GraduationCap,
      label: 'Certificate',
      description: 'Earn an official certificate upon completion'
    },
    {
      icon: Shield,
      label: 'Lifetime Access',
      description: 'Access all materials forever with no time limit'
    },
  ];

  const toggleCardFlip = (idx) => {
    setFlippedCards(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-violet-100 dark:hover:bg-violet-900/30"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">Language Uni</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-slate-400"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {user && (
                <Link to={createPageUrl(
                  user?.role === 'admin' ? 'AdminDashboard' :
                    user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                )}>
                  <Button className="bg-violet-600 hover:bg-violet-700">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden py-24">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2),transparent_60%)]" />
          <motion.div
            animate={{ y: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 right-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 left-0 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Main Content - 3 columns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3 space-y-10"
            >
              {/* Badge & Title */}
              <div className="space-y-8">
                <motion.div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, mass: 1.5, duration: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-purple-500/40 blur-2xl rounded-full" />
                    <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl relative">
                      <span className="text-6xl">{language.flag}</span>
                    </div>
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge className="mb-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 font-semibold">
                        {level.level_type === 'exam' ? <Award className="w-3 h-3 mr-2" /> : <Target className="w-3 h-3 mr-2" />}
                        {level.level_type === 'exam' ? 'Exam Prep' : `Level ${level.level_name}`}
                      </Badge>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                    <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                      Master {level.level_name}
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-slate-100 leading-relaxed max-w-3xl">
                    {level.description || 'Comprehensive language course designed for fluency and confidence'}
                  </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  {[
                    { icon: Clock, label: `${level.duration_hours || 0} Hours`, color: 'from-blue-400' },
                    { icon: Users, label: `${level.enrolled_count || 0} Students`, color: 'from-purple-400' },
                    { icon: BookOpen, label: `${materials.length} Materials`, color: 'from-pink-400' },
                    ...(level.rating > 0 ? [{ icon: Star, label: `${level.rating.toFixed(1)} Rating`, color: 'from-amber-300' }] : [])
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className="flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
                      >
                        <StatIcon className={`w-5 h-5 text-white`} fill={stat.color === 'from-amber-300' ? 'currentColor' : 'none'} />
                        <span className="font-semibold text-white text-sm">{stat.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Course Features Grid with Flip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="perspective-1000 h-32">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, rotateY: flippedCards[idx] ? 180 : 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.6, rotateY: { duration: 0.6 } }}
                        className="relative w-full h-full transform-style-3d cursor-pointer"
                        onClick={() => toggleCardFlip(idx)}
                      >
                        {/* Front Side */}
                        <div className="absolute inset-0 backface-hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col items-center justify-center">
                          <feature.icon className="w-8 h-8 mb-2 text-white" />
                          <p className="text-sm text-white/90 font-medium text-center">{feature.label}</p>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 flex items-center justify-center">
                          <p className="text-xs text-white/95 text-center leading-relaxed">{feature.description}</p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Premium Pricing Card - 2 columns */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="lg:sticky lg:top-24">
                <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl">
                  {/* Course Image */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                    {level.thumbnail_url ? (
                      <>
                        <img
                          src={
                            level.thumbnail_url.startsWith('data:image')
                              ? level.thumbnail_url
                              : `data:image/jpeg;base64,${level.thumbnail_url}`
                          }
                          alt={level.level_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl cursor-pointer">
                            <Play className="w-8 h-8 text-violet-600 ml-1" />
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl">{language.flag}</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-8 space-y-8">
                    {/* Pricing Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Price</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${level.discount_price || level.price}
                        </span>
                        {level.discount_price && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm font-bold py-2 px-3">
                            Save {Math.round(((level.price - level.discount_price) / level.price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      {level.discount_price && (
                        <p className="text-sm text-slate-400 line-through">${level.price}</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">✓ One-time payment  ✓ Lifetime access  ✓ No hidden fees</p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      {isEnrolled ? (
                        <>
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-14 text-base font-bold shadow-xl" disabled>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Enrolled Successfully
                            </Button>
                          </motion.div>
                          {/* <Button
                            className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 h-14 text-base font-bold shadow-xl group"
                            onClick={() => setShowPracticeChat(true)}
                          >
                            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                            Practice with AI
                          </Button> */}
                        </>
                      ) : user ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 h-14 text-base font-bold shadow-2xl"
                            onClick={() => setShowPayPal(true)}
                            disabled={enrollMutation.isPending}
                          >
                            {enrollMutation.isPending ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <Zap className="w-5 h-5 mr-2" />
                                Start Learning Now
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 h-14 text-base font-bold shadow-2xl"
                          onClick={() => WWClient.auth.redirectToLogin()}
                        >
                          Sign In to Enroll
                        </Button>
                      )}
                    </motion.div>

                    {/* What's Included */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">
                        This course includes:
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{level.duration_hours || 0} hours of content</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{materials.length} learning materials</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Live sessions with instructors</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>AI-powered practice assistant</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Lifetime access</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Learning Goals */}
          {level.learning_goals && level.learning_goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    What You'll Master
                  </h2>
                  <p className="text-white/90">Skills you'll gain from this course</p>
                </div>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    {level.learning_goals.map((goal, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl border border-violet-200/50 dark:border-violet-800/50 hover:shadow-lg transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{goal}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Study Materials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  Course Materials & Resources
                </h2>
                <p className="text-white/90">Comprehensive learning materials for every skill</p>
              </div>
              <CardContent className="p-8">
                {Object.keys(groupedMaterials).length === 0 ? (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block"
                    >
                      <BookOpen className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Materials Coming Soon!
                    </h3>
                    <p className="text-slate-500">
                      We're preparing amazing study materials for you
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue={Object.keys(groupedMaterials)[0]} className="w-full">
                    <div className="relative mb-6">
                      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <TabsList className="inline-flex gap-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 min-w-min">
                          {Object.keys(groupedMaterials).map(type => {
                            const Icon = materialIcons[type];
                            const count = groupedMaterials[type].length;
                            return (
                              <TabsTrigger
                                key={type}
                                value={type}
                                className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg rounded-lg px-4 py-2 whitespace-nowrap flex-shrink-0"
                              >
                                <Icon className="w-5 h-5" />
                                <span className="capitalize font-semibold">{type.replace('_', ' ')}</span>
                                <Badge variant="secondary" className="ml-1">{count}</Badge>
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>
                      </div>
                    </div>

                    {Object.entries(groupedMaterials).map(([type, items]) => (
                      <TabsContent key={type} value={type} className="space-y-4 mt-8">
                        {items.map((material, idx) => {
                          // Only allow access if hasAccess or material.is_free_preview
                          const canAccess = hasAccess || material.is_free_preview;
                          const Icon = materialIcons[material.material_type];

                          return (
                            <motion.div
                              key={material.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group"
                            >
                              <Card className={`border-0 shadow-md hover:shadow-xl transition-all overflow-hidden ${canAccess ? 'hover:-translate-y-1' : 'opacity-75'
                                }`}>
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${canAccess
                                        ? 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800'
                                        }`}>
                                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${canAccess ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'
                                          }`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 mb-2 flex-wrap">
                                          <h4 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white break-words">
                                            {material.title}
                                          </h4>
                                          {material.is_free_preview && (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs whitespace-nowrap">
                                              <Zap className="w-3 h-3 mr-1" />
                                              Free Preview
                                            </Badge>
                                          )}
                                        </div>
                                        {material.description && (
                                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                                            {material.description}
                                          </p>
                                        )}
                                        {material.duration_minutes > 0 && (
                                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {material.duration_minutes} minutes
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {canAccess ? (
                                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        {material.material_type === 'live_session' ? (
                                          <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg text-sm sm:text-base w-full sm:w-auto" asChild>
                                            <a href={material.live_session_link} target="_blank" rel="noopener noreferrer">
                                              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                              Join Live
                                            </a>
                                          </Button>
                                        ) : ['video', 'listening', 'reading', 'grammar', 'vocabulary', 'writing'].includes(material.material_type) ? (
                                          <>
                                            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg text-sm sm:text-base w-full sm:w-auto" onClick={() => setSelectedMaterial(material)}>
                                              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                              View
                                            </Button>
                                            {material.file_url && (
                                              <Button size="lg" variant="outline" className="border-2 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-sm sm:text-base w-full sm:w-auto" asChild>
                                                <a href={material.file_url} download>
                                                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                  Download
                                                </a>
                                              </Button>
                                            )}
                                          </>
                                        ) : (
                                          <Button size="lg" variant="outline" className="border-2 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-sm sm:text-base w-full sm:w-auto" asChild>
                                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                              Download
                                            </a>
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 sm:gap-3 text-slate-400 justify-center sm:justify-start">
                                        <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                                        <span className="text-xs sm:text-sm font-medium">Enroll to unlock</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Material Viewer Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <MaterialViewer
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />
        )}
      </AnimatePresence>

      {/* AI Practice Chat Modal */}
      <AnimatePresence>
        {showPracticeChat && isEnrolled && (
          <PracticeChat
            level={level}
            language={language}
            onClose={() => setShowPracticeChat(false)}
          />
        )}
      </AnimatePresence>

      {/* PayPal Modal */}
      <AnimatePresence>
        {showPayPal && window.paypal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-violet-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-[3px]"
            onClick={() => setShowPayPal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative bg-gradient-to-br from-white via-violet-50 to-purple-100 dark:from-slate-900 dark:via-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800 rounded-2xl p-0 shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Top Bar */}
              <div className="flex items-center justify-between px-8 pt-7 pb-2 border-b border-violet-100 dark:border-violet-900 bg-gradient-to-r from-violet-100/60 via-white/80 to-purple-100/60 dark:from-violet-950/40 dark:to-purple-950/40 rounded-t-2xl">
                <h3 className="text-2xl font-extrabold text-violet-800 dark:text-violet-200 tracking-tight flex items-center gap-2">
                  <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-7 h-7 mr-1" />
                  Secure Payment
                </h3>
                <button
                  className="ml-2 rounded-full p-1.5 hover:bg-violet-100 dark:hover:bg-violet-900 transition"
                  aria-label="Close"
                  onClick={() => setShowPayPal(false)}
                  type="button"
                >
                  <svg className="w-5 h-5 text-violet-500 dark:text-violet-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-8 py-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 shadow text-white text-lg font-bold">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.667 20.667c-2.3 0-3.934-1.634-3.934-3.934V7.267c0-2.3 1.634-3.934 3.934-3.934h8.666c2.3 0 3.934 1.634 3.934 3.934v9.466c0 2.3-1.634 3.934-3.934 3.934H7.667zm0-1.5h8.666c1.5 0 2.434-.934 2.434-2.434V7.267c0-1.5-.934-2.434-2.434-2.434H7.667c-1.5 0-2.434.934-2.434 2.434v9.466c0 1.5.934 2.434 2.434 2.434z" /></svg>
                  </span>
                  <span className="text-violet-700 dark:text-violet-200 font-semibold text-lg">
                    Pay for <span className="font-bold">{level?.level_name}</span>
                  </span>
                </div>
                <div className="mb-6">
                  <span className="block text-4xl font-extrabold text-violet-700 dark:text-violet-200 tracking-tight">
                    ${level?.discount_price || level?.price}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                    One-time payment, no hidden fees.
                  </span>
                </div>
                <div ref={paypalContainerRef}></div>
                <Button
                  variant="outline"
                  className="w-full mt-8 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-200 font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/30 transition"
                  onClick={() => setShowPayPal(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}