import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, Trash2, Heart, ArrowRight, BookOpen, Star, 
  ShieldCheck, Award, Smartphone, RefreshCw, Sparkles, Tag, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { WWClient } from '@/api/WWClient';
import { initiateRazorpayPayment, verifyRazorpayPayment, getRazorpayErrorMessage } from '@/lib/razorpay';

export default function Cart() {
  const { 
    items, wishlist, removeFromCart, saveForLater, moveToCart, clearCart 
  } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => sum + (item.discount_price || item.price || 0), 0);
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const tax = Math.round((subtotal - discountAmount) * 0.05); // 5% tax
  const total = subtotal - discountAmount + tax;

  // Load recommended courses
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const allLevels = await WWClient.entities.CourseLevel.filter({ status: 'published' });
        // Filter out courses already in cart
        const cartIds = items.map(i => i._id || i.id);
        const recommendations = allLevels
          .filter(level => !cartIds.includes(level._id || level.id))
          .slice(0, 3);
        setRecommendedCourses(recommendations);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }
    };
    fetchRecommendations();
  }, [items]);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'GLOBAL20') {
      setAppliedDiscount(20);
      setCouponApplied(true);
      setCouponError('');
      toast.success('GLOBAL20 coupon applied! 20% discount added.');
    } else {
      setCouponError('Invalid coupon code. Try GLOBAL20.');
      setAppliedDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setAppliedDiscount(0);
    setCouponCode('');
  };

  // --- Payment Checkout Actions ---
  const handleRazorpayCheckout = async () => {
    try {
      setIsProcessingCheckout(true);
      const res = await WWClient.custom.post('/cart/checkout/razorpay', {});
      
      if (!res.success) {
        throw new Error(res.message || "Failed to start Razorpay checkout");
      }

      await initiateRazorpayPayment({
        orderId: res.orderId,
        amount: res.amount,
        currency: res.currency,
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        onPaymentSuccess: async (paymentData) => {
          try {
            const verifyRes = await WWClient.custom.post('/cart/checkout/razorpay-verify', {
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
              transactionId: res.transactionId
            });
            if (verifyRes.success) {
              clearCart();
              toast.success("Checkout successful! Welcome to your courses.");
              navigate('/MyLearning');
            } else {
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (err) {
            toast.error("Verification failed: " + err.message);
          }
        },
        onPaymentFailure: (err) => {
          toast.error(getRazorpayErrorMessage(err));
        }
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handlePaypalCheckout = async () => {
    try {
      setIsProcessingCheckout(true);
      const res = await WWClient.custom.post('/cart/checkout/paypal', {
        redirectRoute: 'MyLearning'
      });

      if (res.success && res.link) {
        // Redirect to PayPal
        window.location.href = res.link;
      } else {
        toast.error(res.message || "Failed to setup PayPal checkout");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight text-left">Shopping Cart</h1>

        {items.length === 0 ? (
          /* Empty Cart Illustration & Messaging */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="relative w-40 h-40">
              {/* Floating animated book icon */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 rounded-full border border-violet-100 dark:border-violet-900/30"
              >
                <BookOpen className="w-20 h-20 text-violet-600 dark:text-violet-400" />
              </motion.div>
              <span className="absolute top-4 right-4 text-3xl">✨</span>
              <span className="absolute bottom-4 left-4 text-3xl">📚</span>
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Your learning cart is waiting</h2>
              <p className="text-slate-505 dark:text-slate-400 font-semibold text-sm">
                Discover language courses and levels to kickstart your learning journey.
              </p>
            </div>

            <Button
              onClick={() => navigate('/CourseCatalog')}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-violet-600/20"
            >
              Explore Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-md">
                <CardContent className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => {
                    const id = item._id || item.id;
                    const price = item.discount_price || item.price || 0;

                    return (
                      <div key={id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6">
                        {/* Course Flag Icon */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                          {item.language_id?.flag || '🇬🇧'}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                            {item.language_id?.name || 'Language'}
                          </span>
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-1">
                            {item.level_name} Course
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            By {item.instructor_id?.full_name || 'Expert Instructor'}
                          </p>

                          {/* Quick Rating */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {item.rating || '4.8'}
                            </span>
                            <span className="text-xs text-slate-400">(Guest Review)</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-4 mt-4">
                            <button
                              onClick={() => removeFromCart(id)}
                              className="text-xs font-bold text-red-500 hover:text-red-650 flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                            <button
                              onClick={() => saveForLater(item)}
                              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-750 flex items-center gap-1.5 transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5" /> Save for Later
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right sm:self-start">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            ${price}
                          </span>
                          {item.discount_price && (
                            <p className="text-xs text-slate-400 line-through mt-0.5">
                              ${item.price}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Save for Later (Wishlist) Section */}
              {wishlist.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Saved for Later</h2>
                  <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/40">
                    <CardContent className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                      {wishlist.map((item) => {
                        const id = item._id || item.id;
                        return (
                          <div key={id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-2xl w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                {item.language_id?.flag || '🏳️'}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                  {item.level_name} Course
                                </h4>
                                <p className="text-xs text-slate-500 truncate">
                                  {item.language_id?.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                onClick={() => moveToCart(id)}
                                className="bg-violet-50 text-violet-650 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 rounded-lg font-bold text-xs"
                              >
                                Move to Cart
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(id)}
                                className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Summary & Checkout Sidebar */}
            <div className="space-y-6 text-left">
              {/* Promo Coupon Card */}
              <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-md">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Promotions</h4>
                  </div>
                  
                  {couponApplied ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">GLOBAL20 Applied</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500">20% Off all courses</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Promo Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="rounded-xl border-slate-200"
                        />
                        <Button 
                          onClick={handleApplyCoupon}
                          className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold"
                        >
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 font-semibold">{couponError}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Try code <span className="text-violet-600 dark:text-violet-400 font-black">GLOBAL20</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Calculation details */}
              <Card className="border border-slate-100 dark:border-slate-850 shadow-sm rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-md overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Order Summary</h3>
                  
                  <div className="space-y-2.5 text-sm font-semibold text-slate-505 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-slate-900 dark:text-white">${subtotal}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount (20%)</span>
                        <span>-${discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Tax (5%)</span>
                      <span className="text-slate-900 dark:text-white">${tax}</span>
                    </div>
                    <Separator className="bg-slate-100 dark:bg-slate-800" />
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    {/* Razorpay Button */}
                    <Button
                      onClick={handleRazorpayCheckout}
                      disabled={isProcessingCheckout}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15"
                    >
                      Checkout with Razorpay <ArrowRight className="w-4 h-4" />
                    </Button>

                    {/* PayPal Button */}
                    <Button
                      onClick={handlePaypalCheckout}
                      disabled={isProcessingCheckout}
                      variant="outline"
                      className="w-full rounded-xl h-12 font-bold"
                    >
                      Checkout with PayPal
                    </Button>
                  </div>

                  {/* Trust badges */}
                  <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span>Certificate of Completion Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-500 flex-shrink-0" />
                      <span>Access on Mobile and Desktop Devices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Lifetime Access to Course Materials</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
