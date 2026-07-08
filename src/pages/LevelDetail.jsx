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
import { initiateRazorpayPayment, verifyRazorpayPayment, getRazorpayErrorMessage } from '@/lib/razorpay';
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
  const [showPayPal, setShowPayPal] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'paypal' or 'razorpay'
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
    // loadScript({ "client-id": "AZ9mQV1dm76WOaOQfKRdJq0nZ8I7B9DtW9Xnv25aB2OOJYhA-7Dl00p0PxY704pVZBtR1zE3VRw_pyDl" }); // Replace YOUR_PAYPAL_CLIENT_ID with your actual PayPal client ID
    loadScript({ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }); // Replace YOUR_PAYPAL_CLIENT_ID with your actual PayPal client ID

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

  // ============= RAZORPAY PAYMENT FLOW =============
  
  const createRazorpayOrderMutation = useMutation({
    mutationFn: ({ amount, levelId }) => WWClient.entities.razorpay.postwithparams('create-order', {
      amount,
      levelId,
      instructor_id: level?.instructor_id
    })
  });

  const verifyRazorpayPaymentMutation = useMutation({
    mutationFn: (paymentData) => WWClient.entities.Enrollment.postwithparams('razorpay/verify-payment', paymentData)
  });

  const handleRazorpayPaymentSuccess = async (paymentData) => {
    try {
      // Verify payment with backend
      const response = await verifyRazorpayPaymentMutation.mutateAsync({
        ...paymentData,
        transactionId: razorpayTransactionId
      });

      if (response.success) {
        // Update enrollment
        enrollMutation.mutate();
        setShowRazorpay(false);
        setPaymentMethod(null);
      } else {
        alert('Payment verification failed: ' + response.message);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification error. Please contact support.');
    }
  };

  const handleRazorpayPaymentFailure = (error) => {
    const errorMessage = getRazorpayErrorMessage(error);
    alert('Payment failed: ' + errorMessage);
    setShowRazorpay(false);
    setPaymentMethod(null);
  };

  const [razorpayTransactionId, setRazorpayTransactionId] = useState(null);

  const handleInitiateRazorpayPayment = async () => {
    try {
      if (!user || !user.email) {
        alert('User information missing. Please log in again.');
        return;
      }

      // Create order on backend
      const orderResponse = await createRazorpayOrderMutation.mutateAsync({
        amount: level.discount_price || level.price,
        levelId: levelId
      });

      if (!orderResponse.success) {
        alert('Failed to create payment order: ' + orderResponse.message);
        return;
      }

      // Store transaction ID for later verification
      setRazorpayTransactionId(orderResponse.transactionId);

      // Initiate Razorpay payment modal
      await initiateRazorpayPayment({
        orderId: orderResponse.orderId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        user: {
          name: user.name || user.email,
          email: user.email,
          phone: user.phone || ''
        },
        levelName: level.level_name,
        onPaymentSuccess: handleRazorpayPaymentSuccess,
        onPaymentFailure: handleRazorpayPaymentFailure,
        onPaymentClosed: () => {
          setShowRazorpay(false);
          setPaymentMethod(null);
        }
      });
    } catch (error) {
      console.error('Error preparing Razorpay payment:', error);
      alert('Error preparing payment. Please try again.');
      setShowRazorpay(false);
      setPaymentMethod(null);
    }
  };

  // Trigger Razorpay payment when showRazorpay is true and we have user data
  useEffect(() => {
    if (showRazorpay && paymentMethod === 'razorpay' && user) {
      handleInitiateRazorpayPayment();
    }
  }, [showRazorpay, paymentMethod, user]);

  if (!level || !language) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Course Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400">The course you're looking for doesn't exist.</p>
        </div>
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Professional Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <img src="/logo.png" alt="Global Tongue logo" className="w-8 h-8 object-contain rounded-lg" />
                <span className="font-semibold text-slate-900 dark:text-white">Global Tongue</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {user && (
                <Link to={createPageUrl(
                  user?.role === 'admin' ? 'AdminDashboard' :
                    user?.role === 'instructor' ? 'InstructorDashboard' : 'StudentDashboard'
                )}>
                  <Button className="bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Professional Hero Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl">
                    {language.flag}
                  </div>
                  <div>
                    <Badge className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {level.level_type === 'exam' ? 'Exam Prep' : `Level ${level.level_name}`}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    Master {level.level_name}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {level.description || 'Comprehensive language course designed for fluency and confidence'}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Duration</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{level.duration_hours || 0}h</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Students</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{level.enrolled_count || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Materials</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{materials.length}</p>
                  </div>
                  {level.rating > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Rating</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{level.rating.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Card - 1 column */}
            <div>
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg overflow-hidden">
                  {/* Course Image */}
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {level.thumbnail_url ? (
                      <img
                        src={
                          level.thumbnail_url.startsWith('data:image')
                            ? level.thumbnail_url
                            : `data:image/jpeg;base64,${level.thumbnail_url}`
                        }
                        alt={level.level_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {language.flag}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Pricing */}
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          ${level.discount_price || level.price}
                        </span>
                        {level.discount_price && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                            Save {Math.round(((level.price - level.discount_price) / level.price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      {level.discount_price && (
                        <p className="text-sm text-slate-400 line-through mt-1">${level.price}</p>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    {isEnrolled ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-12 font-semibold" disabled>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enrolled
                      </Button>
                    ) : user ? (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
                        onClick={() => setPaymentMethod('select')}
                        disabled={enrollMutation.isPending || createRazorpayOrderMutation.isPending}
                      >
                        {enrollMutation.isPending || createRazorpayOrderMutation.isPending ? 'Processing...' : 'Enroll Now'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
                        onClick={() => WWClient.auth.redirectToLogin()}
                      >
                        Sign In to Enroll
                      </Button>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      One-time payment • Lifetime access • No hidden fees
                    </p>

                    {/* Includes */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Course Includes:</h4>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{level.duration_hours || 0} hours of content</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{materials.length} learning materials</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Live sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Certificate on completion</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Lifetime access</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Learning Goals */}
          {level.learning_goals && level.learning_goals.length > 0 && (
            <div>
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 border-b border-blue-200 dark:border-blue-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    What You'll Learn
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {level.learning_goals.map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{goal}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Study Materials */}
          <div>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 border-b border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Course Materials
                </h2>
              </div>
              <CardContent className="p-6">
                {Object.keys(groupedMaterials).length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Materials Coming Soon
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      We're preparing course materials for you
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue={Object.keys(groupedMaterials)[0]} className="w-full">
                    <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex flex-wrap">
                      {Object.keys(groupedMaterials).map(type => {
                        const Icon = materialIcons[type];
                        const count = groupedMaterials[type].length;
                        return (
                          <TabsTrigger
                            key={type}
                            value={type}
                            className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 py-2"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                            <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                              {count}
                            </span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {Object.entries(groupedMaterials).map(([type, items]) => (
                      <TabsContent key={type} value={type} className="space-y-3">
                        {items.map((material, idx) => {
                          const canAccess = hasAccess || material.is_free_preview;
                          const Icon = materialIcons[material.material_type];

                          return (
                            <div
                              key={material._id || material.id}
                              className={`group border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-all ${
                                canAccess
                                  ? 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                                  : 'opacity-60'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    canAccess
                                      ? 'bg-blue-100 dark:bg-blue-900/30'
                                      : 'bg-slate-100 dark:bg-slate-800'
                                  }`}>
                                    <Icon className={`w-5 h-5 ${
                                      canAccess
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                                      <h4 className="font-medium text-slate-900 dark:text-white">
                                        {material.title}
                                      </h4>
                                      {material.is_free_preview && (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                          Free Preview
                                        </Badge>
                                      )}
                                    </div>
                                    {material.description && (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                        {material.description}
                                      </p>
                                    )}
                                    {material.duration_minutes > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {material.duration_minutes} min
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {canAccess ? (
                                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    {material.material_type === 'live_session' ? (
                                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                                        <a href={material.live_session_link} target="_blank" rel="noopener noreferrer">
                                          <Play className="w-4 h-4 mr-1" />
                                          Join
                                        </a>
                                      </Button>
                                    ) : ['video', 'listening', 'reading', 'grammar', 'vocabulary', 'writing'].includes(material.material_type) ? (
                                      <>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedMaterial(material)}>
                                          <Play className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                        {material.file_url && (
                                          <Button size="sm" variant="outline" asChild>
                                            <a href={material.file_url} download>
                                              <Download className="w-4 h-4 mr-1" />
                                              Download
                                            </a>
                                          </Button>
                                        )}
                                      </>
                                    ) : (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                          <Download className="w-4 h-4 mr-1" />
                                          Download
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-xs font-medium">Enroll to unlock</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
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

      {/* Payment Method Selector Modal */}
      <AnimatePresence>
        {paymentMethod === 'select' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setPaymentMethod(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Choose Payment Method
                </h3>
                <button
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setPaymentMethod(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-6">
                {/* Razorpay Option */}
                <button
                  className={`w-full p-4 mb-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                  onClick={() => {
                    setPaymentMethod('razorpay');
                    setShowRazorpay(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Razorpay</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Debit/Credit Card, UPI, Wallet</p>
                    </div>
                    <div className="text-2xl">💳</div>
                  </div>
                </button>

                {/* PayPal Option */}
                <button
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                  onClick={() => {
                    setPaymentMethod('paypal');
                    setShowPayPal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-900 dark:text-white">PayPal</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Secure PayPal checkout</p>
                    </div>
                    <div className="text-2xl">🅿️</div>
                  </div>
                </button>

                {/* Price Info */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Amount</p>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${level?.discount_price || level?.price}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      One-time payment • Lifetime access
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PayPal Modal */}
      <AnimatePresence>
        {showPayPal && paymentMethod === 'paypal' && window.paypal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowPayPal(false);
              setPaymentMethod(null);
            }}
          >
            <div
              className="relative bg-white dark:bg-slate-900 rounded-xl p-0 shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Complete Your Enrollment
                </h3>
                <button
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => {
                    setShowPayPal(false);
                    setPaymentMethod(null);
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4">
                {/* Course Summary */}
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Enrolling in</p>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{level?.level_name}</h4>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${level?.discount_price || level?.price}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    One-time payment • Lifetime access
                  </p>
                </div>

                {/* PayPal Container */}
                <div ref={paypalContainerRef} className="mb-6 min-h-[300px]"></div>

                {/* Cancel Button */}
                <Button
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => {
                    setShowPayPal(false);
                    setPaymentMethod(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}