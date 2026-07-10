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
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Your Cart</h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold text-slate-600 dark:text-slate-400">
                  {items.length} items
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Your cart is empty</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[250px]">
                      Explore courses and add your first program to start learning.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/CourseCatalog');
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold"
                  >
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                items.map((item) => {
                  const id = item._id || item.id;
                  const price = item.discount_price || item.price || 0;

                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/80 dark:border-slate-805"
                    >
                      {/* Image / Flag container */}
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0 text-3xl">
                        {item.language_id?.flag || '📚'}
                      </div>

                      {/* Course details */}
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          {item.language_id?.name || 'Language'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                          {item.level_name} Course
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                          By {item.instructor_id?.full_name || 'Expert Instructor'}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            ${price}
                          </span>
                          {item.discount_price && (
                            <span className="text-xs text-slate-400 line-through">
                              ${item.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-between items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Summary Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">${subtotal}</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <Button
                    onClick={handleCheckoutClick}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10 transition-all active:scale-[0.98]"
                  >
                    Go to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full rounded-xl h-12 font-bold"
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
