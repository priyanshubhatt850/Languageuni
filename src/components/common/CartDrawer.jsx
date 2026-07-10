import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { X, Trash2, ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + (item.discount_price || item.price || 0), 0);

  const handleCheckoutClick = () => {
    setDrawerOpen(false);
    navigate('/Cart');
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999]"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl z-[1000] flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-violet-650 dark:text-violet-400 shadow-inner">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Your Cart</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Checkout program slots</p>
                </div>
                <span className="text-[10px] bg-violet-650 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                  {items.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 text-slate-400 hover:text-slate-650"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 p-4">
                  <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <ShoppingBag className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Your cart is empty</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 max-w-[240px] leading-relaxed">
                      Explore courses and add your first program to start learning languages today.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/CourseCatalog');
                    }}
                    className="bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold h-10 px-6 shadow-md shadow-violet-650/15"
                  >
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const id = item._id || item.id;
                    const price = item.discount_price || item.price || 0;

                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/10 border border-slate-150 dark:border-slate-800 text-left relative group overflow-hidden"
                      >
                        {/* Image / Flag container */}
                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0 text-3xl border border-slate-100 dark:border-slate-800">
                          {item.language_id?.flag || '📚'}
                        </div>

                        {/* Course details */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-violet-650 dark:text-violet-400 uppercase tracking-widest bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded border border-violet-100/40 dark:border-violet-900/30">
                            {item.language_id?.name || 'Language'}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-2">
                            {item.level_name} Course
                          </h4>
                          <p className="text-[10px] text-slate-505 dark:text-slate-400 truncate mt-0.5">
                            By {item.instructor_id?.full_name || 'Expert Instructor'}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              ${price}
                            </span>
                            {item.discount_price && (
                              <span className="text-[10px] text-slate-400 line-through font-semibold">
                                ${item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col justify-between items-end shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Summary Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Subtotal</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">${subtotal}</span>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold bg-violet-100/60 dark:bg-violet-950/50 text-violet-750 dark:text-violet-300 px-2.5 py-1 rounded-lg border border-violet-200/50 dark:border-violet-900/30">
                    Excludes Tax
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <Button
                    onClick={handleCheckoutClick}
                    className="w-full bg-violet-600 hover:bg-violet-750 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-650/15 transition-all active:scale-[0.98]"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-350 dark:hover:bg-slate-800"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
