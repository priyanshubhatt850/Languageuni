import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/components/ui/ThemeProvider';
import LandingNavbar from '@/components/common/LandingNavbar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeChat from '@/components/common/PracticeChat';
import MaterialViewer from '@/components/learning/MaterialViewer';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
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
  Sparkles,
  X,
  Check,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { loadScript } from "@paypal/paypal-js";
import { initiateRazorpayPayment, getRazorpayErrorMessage } from '@/lib/razorpay';
import CryptoJS from "crypto-js";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const materialIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  grammar: FileText,
  vocabulary: FileText,
  video: Video,
  live_session: Calendar
};
const KEY = import.meta.env.VITE_MATERIAL_ENCRYPTION_KEY;

const decryptMaterials = (materials) => {
  if (!materials?.content || !materials?.iv) return [];

  try {
    const key = CryptoJS.enc.Utf8.parse(KEY);
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
  const { items, addToCart, setDrawerOpen } = useCart();
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
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setAuthLoading(true);
      const data = await WWClient.functions.invoke('verifyGoogleToken', {
        googletoken: credentialResponse.credential,
        service_type: 'student'
      });

      if (data?.success) {
        const userData = await WWClient.auth.me();
        setUser(userData);
        setShowAuthModal(false);
        toast.success('Signed in successfully!');
        queryClient.invalidateQueries(['level-detail', levelId]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed. Please try again.');
  };

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

  const level = courseData?.level;
  const language = courseData?.language;
  const materials = decryptMaterials(courseData?.materials) || [];
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
      queryClient.invalidateQueries(['level-detail', levelId]);
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
  });

  useEffect(() => {
    loadScript({ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID });
  }, []);

  useEffect(() => {
    if (!showPayPal || !window.paypal || !paypalContainerRef.current) return;

    window.paypal
      .Buttons({
        createOrder: async (data, actions) => {
          const response = await startPaypalMutation.mutateAsync({
            amount: level.discount_price || level.price,
            levelId: levelId,
            redirectRoute: `LevelDetail?id=${levelId}`,
            instructor_id: level.instructor_id
          });
          return response.paypal.id;
        },

        onApprove: async (data, actions) => {
          await actions.order.capture();
          enrollMutation.mutate();
          setShowPayPal(false);
          setPaymentMethod(null);
          toast.success("PayPal enrollment completed successfully!");
        },

        onCancel: () => {
          setShowPayPal(false);
          setPaymentMethod(null);
          toast.info("Payment cancelled.");
        },

        onError: (err) => {
          console.error("PayPal error:", err);
          setShowPayPal(false);
          setPaymentMethod(null);
          toast.error("PayPal error occurred. Please try again.");
        },
      })
      .render(paypalContainerRef.current);

    return () => {
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = "";
      }
    };
  }, [showPayPal, levelId]);

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
      const response = await verifyRazorpayPaymentMutation.mutateAsync({
        ...paymentData,
        transactionId: razorpayTransactionId
      });

      if (response.success) {
        enrollMutation.mutate();
        setShowRazorpay(false);
        setPaymentMethod(null);
        toast.success("Razorpay payment verification success! Enrolled!");
      } else {
        toast.error('Payment verification failed: ' + response.message);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  const handleRazorpayPaymentFailure = (error) => {
    const errorMessage = getRazorpayErrorMessage(error);
    toast.error('Payment failed: ' + errorMessage);
    setShowRazorpay(false);
    setPaymentMethod(null);
  };

  const [razorpayTransactionId, setRazorpayTransactionId] = useState(null);

  const handleInitiateRazorpayPayment = async () => {
    try {
      if (!user || !user.email) {
        toast.error('User email information missing. Please log in again.');
        return;
      }

      const orderResponse = await createRazorpayOrderMutation.mutateAsync({
        amount: level.discount_price || level.price,
        levelId: levelId
      });

      if (!orderResponse.success) {
        toast.error('Failed to create payment order: ' + orderResponse.message);
        return;
      }

      setRazorpayTransactionId(orderResponse.transactionId);

      await initiateRazorpayPayment({
        orderId: orderResponse.orderId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        user: {
          name: user.full_name || user.email,
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
      toast.error('Error preparing payment. Please try again.');
      setShowRazorpay(false);
      setPaymentMethod(null);
    }
  };

  useEffect(() => {
    if (showRazorpay && paymentMethod === 'razorpay' && user) {
      handleInitiateRazorpayPayment();
    }
  }, [showRazorpay, paymentMethod, user]);

  if (isLoading) return <LoadingPage />;

  if (!level || !language) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <LandingNavbar showBack={true} />
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

  const isLevelInCart = items.some(item => (item._id || item.id) === (level?._id || level?.id));

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300 pb-24 lg:pb-12">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-100/20 dark:bg-emerald-950/5 rounded-full blur-3xl pointer-events-none" />

        <LandingNavbar showBack={true} openPortal={() => setShowAuthModal(true)} />

        {/* Hero & Learning Overview */}
        <section className="py-12 md:py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column (Main Hero) */}
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-605 dark:text-emerald-450 flex items-center justify-center font-black text-2xl shrink-0">
                      {language?.code?.toUpperCase() || language?.name?.substring(0, 2).toUpperCase() || 'FR'}
                    </div>
                    <div>
                      <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-605 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-black uppercase tracking-wider">
                        CEFR Level {level.level_name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      Master {language?.name} {level.level_name}
                    </h1>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                      {level.level_type || 'Curriculum Level'}
                    </p>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl text-left">
                      {level.description || `Embark on the ${level.level_name} syllabus. Master grammar models, reading comprehension, and practice speaking fluently.`}
                    </p>
                  </div>

                  {/* 1. CEFR Timeline Roadmap (Signature Element) */}
                  <div className="py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">CEFR Language Path</p>
                    <div className="flex items-center justify-between max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
                        const isCurrent = level.level_name?.toUpperCase() === lvl;
                        return (
                          <div key={lvl} className="flex flex-col items-center gap-1.5 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent 
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-110 ring-4 ring-violet-500/10 font-black' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-550'
                            }`}>
                              {lvl}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-violet-600 dark:text-violet-400 font-black' : 'text-slate-400'}`}>
                              {isCurrent ? 'Current' : lvl}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Learning Levels Overview Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-2.5 text-left transition-all hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Duration</span>
                      </div>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{level.duration_hours || 0}h</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-2.5 text-left transition-all hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Students</span>
                      </div>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{level.enrolled_count || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-2.5 text-left transition-all hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Materials</span>
                      </div>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{materials.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Sidebar (Desktop - Sticky Column) */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card className="border border-slate-150 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-md">
                    {/* Course Image */}
                    <div className="aspect-video relative m-4 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-105 dark:border-slate-700">
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

                    <CardContent className="p-6 pt-2 space-y-6 text-left">
                      {/* Pricing */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price</p>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            ${level.discount_price || level.price}
                          </span>
                          {level.discount_price && (
                            <Badge variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-xs py-0.5 px-2 font-bold">
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
                        <div className="space-y-3">
                          <Button className="w-full bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 cursor-default shadow-md shadow-emerald-500/10">
                            <CheckCircle className="w-5 h-5" /> Enrolled
                          </Button>
                          <Button 
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2"
                            onClick={() => setShowPracticeChat(true)}
                          >
                            <Bot className="w-5 h-5" /> AI Practice Partner
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {isLevelInCart ? (
                            <Button
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl h-12 font-bold flex items-center justify-center gap-2 transition-all"
                              onClick={() => setDrawerOpen(true)}
                            >
                              <Check className="w-5 h-5 text-emerald-600" /> Added (Go to Cart)
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                              onClick={(e) => addToCart(level, e)}
                            >
                              <ShoppingBag className="w-4 h-4 text-slate-350" /> Add to Cart
                            </Button>
                          )}

                          {/* Buy Now Button */}
                          {user ? (
                            <Button
                              className="w-full bg-violet-600 hover:bg-violet-755 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                              onClick={() => setPaymentMethod('select')}
                              disabled={enrollMutation.isPending || createRazorpayOrderMutation.isPending}
                            >
                              {enrollMutation.isPending || createRazorpayOrderMutation.isPending ? 'Processing...' : (
                                <>
                                  Buy Now <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-violet-600 hover:bg-violet-755 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                              onClick={() => setShowAuthModal(true)}
                            >
                              Sign In to Buy Now <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Trust Highlights */}
                      <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-400 py-3 border-t border-b border-slate-100 dark:border-slate-800/80">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-slate-400" /> Secure payment</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-slate-400" /> Lifetime access</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-slate-400" /> 30-day guarantee</span>
                      </div>

                      {/* Includes Checklist */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Course Includes:</h4>
                        <div className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{level.duration_hours || 0} hours syllabus duration</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{materials.length} secured study items</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>AI Conversational partner access</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Official levels certificate</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-10 space-y-12">
          {/* Learning Goals */}
          {level.learning_goals && level.learning_goals.length > 0 && (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl">
              <div className="bg-slate-50/50 dark:bg-slate-850/50 p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Target className="w-5 h-5 text-violet-650 dark:text-violet-400" />
                  What You'll Master
                </h2>
              </div>
              <CardContent className="p-6 text-left">
                <div className="grid md:grid-cols-2 gap-3.5">
                  {level.learning_goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-350 text-sm font-semibold">{goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Decrypter Layout & Study Materials download cards grid */}
          <Card className="border border-slate-200/60 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl">
            <div className="bg-slate-50/50 dark:bg-slate-850/50 p-6 border-b border-slate-100 dark:border-slate-805/65 text-left flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  Syllabus Study Materials
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decrypted & Secured Files</p>
              </div>

              {/* Decrypter status badge visual indicator */}
              {hasAccess ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Shield className="w-3.5 h-3.5" />
                  Decrypted Unlocked
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  Encrypted content
                </div>
              )}
            </div>

            <CardContent className="p-6 text-left">
              {Object.keys(groupedMaterials).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-700 dark:text-slate-350 mb-2">
                    Materials Coming Soon
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    The files are being compiled. Stay tuned!
                  </p>
                </div>
              ) : (
                <Tabs defaultValue={Object.keys(groupedMaterials)[0]} className="w-full">
                  <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl gap-1 inline-flex flex-wrap border border-slate-200/40 dark:border-slate-800">
                    {Object.keys(groupedMaterials).map(type => {
                      const Icon = materialIcons[type] || FileText;
                      const count = groupedMaterials[type].length;
                      return (
                        <TabsTrigger
                          key={type}
                          value={type}
                          className="gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-650 dark:data-[state=active]:text-white data-[state=active]:shadow-sm py-2.5 px-4 text-xs font-bold transition-all capitalize"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{type.replace('_', ' ')}</span>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full font-black text-slate-755 dark:text-slate-300">
                            {count}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.entries(groupedMaterials).map(([type, itemsList]) => (
                    <TabsContent key={type} value={type} className="mt-0">
                      {/* Grid representation of materials cards */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {itemsList.map((material) => {
                          const canAccess = hasAccess || material.is_free_preview;
                          const Icon = materialIcons[material.material_type] || FileText;

                          return (
                            <div
                              key={material._id || material.id}
                              className={`group border border-slate-200 dark:border-slate-800/70 rounded-2xl p-5 transition-all bg-white dark:bg-slate-900/40 flex flex-col justify-between gap-4 ${
                                canAccess
                                  ? 'hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800/60'
                                  : 'opacity-70 bg-slate-50/50 dark:bg-slate-950/20'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    canAccess
                                      ? 'bg-violet-50 text-violet-605 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/30'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                  }`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  {material.is_free_preview && (
                                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-extrabold py-0.5 px-2.5">
                                      Free Preview
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1.5 text-left">
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight line-clamp-1">
                                    {material.title}
                                  </h4>
                                  {material.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                      {material.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                                {material.duration_minutes > 0 && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{material.duration_minutes} mins duration</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {canAccess ? (
                                    <div className="flex gap-2 w-full">
                                      {material.material_type === 'live_session' ? (
                                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold h-9 px-4 w-full" asChild>
                                          <a href={material.live_session_link} target="_blank" rel="noopener noreferrer">
                                            <Play className="w-4 h-4 mr-1.5" /> Join Live
                                          </a>
                                        </Button>
                                      ) : (
                                        <>
                                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold h-9 px-4 flex-1" onClick={() => setSelectedMaterial(material)}>
                                            <Play className="w-4 h-4 mr-1.5" /> View
                                          </Button>
                                          {material.file_url && (
                                            <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl h-9 px-3 font-bold" asChild>
                                              <a href={material.file_url} download>
                                                <Download className="w-4 h-4" />
                                              </a>
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-550 pr-2 w-full justify-center py-1">
                                      <Lock className="w-3.5 h-3.5 text-slate-350" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">Unlock via enrollment</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Floating Checkout Bar */}
        {!isEnrolled && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all duration-300">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Price</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ${level.discount_price || level.price}
                  </span>
                  {level.discount_price && (
                    <span className="text-xs text-slate-400 line-through">
                      ${level.price}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                {isLevelInCart ? (
                  <Button
                    size="sm"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30 rounded-xl h-11 px-3 font-bold"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 rounded-xl h-11 px-3"
                    onClick={(e) => addToCart(level, e)}
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                  </Button>
                )}
                {user ? (
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-755 text-white rounded-xl h-11 px-5 font-bold flex-1 max-w-[160px]"
                    onClick={() => setPaymentMethod('select')}
                  >
                    Buy Now
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-755 text-white rounded-xl h-11 px-5 font-bold flex-1 max-w-[160px]"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
              onClick={() => setPaymentMethod(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Branded decorative top border */}
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-650 via-purple-600 to-indigo-650" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Select Payment Method
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure Checkout</p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-all"
                    onClick={() => setPaymentMethod(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-4">
                  {/* Razorpay Option */}
                  <button
                    className={`w-full p-4 border rounded-2xl transition-all duration-300 text-left flex items-center gap-4 group relative ${
                      paymentMethod === 'razorpay'
                        ? 'border-violet-600 bg-violet-50/20 dark:bg-violet-950/20 ring-1 ring-violet-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-violet-350 dark:hover:border-violet-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/30'
                    }`}
                    onClick={() => {
                      setPaymentMethod('razorpay');
                      setShowRazorpay(true);
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-100/50 dark:bg-violet-950/40 text-violet-605 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/50 dark:border-violet-900/30 group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                        <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        Razorpay
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 font-bold uppercase">Cards, UPI</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Debit/Credit Card, UPI, Wallets, NetBanking</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 'razorpay' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-350 dark:border-slate-700'
                    }`}>
                      {paymentMethod === 'razorpay' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>

                  {/* PayPal Option */}
                  <button
                    className={`w-full p-4 border rounded-2xl transition-all duration-300 text-left flex items-center gap-4 group relative ${
                      paymentMethod === 'paypal'
                        ? 'border-violet-600 bg-violet-50/20 dark:bg-violet-950/20 ring-1 ring-violet-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-violet-350 dark:hover:border-violet-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/30'
                    }`}
                    onClick={() => {
                      setPaymentMethod('paypal');
                      setShowPayPal(true);
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-105/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/30 group-hover:scale-105 transition-transform duration-300">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.06 8.09c0-3.32-2.39-5.18-5.74-5.18h-5.9c-.43 0-.79.31-.86.73L5.3 17.68c-.06.33.19.64.53.64h3.18c.37 0 .69-.26.75-.62l.84-5.32c.07-.43.44-.74.87-.74h1.75c3.08 0 5.49-1.25 6.19-4.83.21-1.07.65-2.72.65-2.72z" opacity="0.4"/>
                        <path d="M17.15 11.45c0-3.32-2.39-5.18-5.74-5.18H5.51c-.43 0-.79.31-.86.73L2.39 21.04c-.06.33.19.64.53.64h3.18c.37 0 .69-.26.75-.62l.84-5.32c.07-.43.44-.74.87-.74h1.75c3.08 0 5.49-1.25 6.19-4.83.21-1.07.65-2.72.65-2.72z"/>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        PayPal
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 font-bold uppercase">International</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secure credit card and PayPal checkout</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 'paypal' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-350 dark:border-slate-700'
                    }`}>
                      {paymentMethod === 'paypal' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>

                  {/* Price Info */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/85 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60">
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                      <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-650 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                        ${level?.discount_price || level?.price}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>One-Time Purchase • Secured SSL</span>
                      </div>
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
              onClick={() => {
                setShowPayPal(false);
                setPaymentMethod(null);
              }}
            >
              <div
                className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Branded decorative top border */}
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Complete Your Enrollment
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure PayPal Payment</p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-all"
                    onClick={() => {
                      setShowPayPal(false);
                      setPaymentMethod(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 py-6 text-left space-y-6">
                  {/* Course Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-105/60 dark:border-slate-800/60 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level Details</p>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">Master {language?.name} {level?.level_name}</h4>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-650 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                        ${level?.discount_price || level?.price}
                      </span>
                      {level?.discount_price && (
                        <span className="text-[10px] text-slate-400 line-through">${level?.price}</span>
                      )}
                    </div>
                  </div>

                  {/* PayPal Container */}
                  <div ref={paypalContainerRef} className="mb-4 min-h-[150px] bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"></div>

                  {/* Cancel Button */}
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl h-11 font-bold"
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

        {/* Auth Dialog */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="w-[92vw] max-w-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 shadow-xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-left">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-605 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <span>Sign In to Purchase</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs text-left pt-2 font-medium">
                Sign in with Google as a student to buy and unlock this level.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 flex flex-col items-center">
              <div className="flex justify-center w-full min-h-[44px]">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme={theme === 'dark' ? 'filled_blue' : 'outline'}
                  size="large"
                  width="280px"
                />
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowAuthModal(false)}
                className="w-full max-w-[280px] text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl h-11 border border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
}