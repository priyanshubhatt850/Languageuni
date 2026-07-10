import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { BookOpen } from 'lucide-react';

export default function BookFlyingAnimation() {
  const { flyingBooks, setFlyingBooks } = useCart();
  const [cartCoords, setCartCoords] = useState({ x: 0, y: 0 });

  // Update target cart icon coordinates dynamically
  useEffect(() => {
    const updateCoords = () => {
      const el = document.getElementById('navbar-cart-icon');
      if (el) {
        const rect = el.getBoundingClientRect();
        setCartCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [flyingBooks]);

  const handleAnimationComplete = (id) => {
    setFlyingBooks(prev => prev.filter(item => item.id !== id));
    
    // Add brief success pulse to navbar cart icon
    const el = document.getElementById('navbar-cart-icon');
    if (el) {
      el.classList.add('animate-bounce-twice', 'shadow-violet-500/50');
      setTimeout(() => {
        el.classList.remove('animate-bounce-twice', 'shadow-violet-500/50');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {flyingBooks.map((book) => {
          const targetX = cartCoords.x || window.innerWidth - 100;
          const targetY = cartCoords.y || 50;

          return (
            <motion.div
              key={book.id}
              initial={{
                x: book.startX,
                y: book.startY,
                scale: 0.2,
                rotate: 0,
                opacity: 0,
                filter: 'blur(2px)'
              }}
              animate={{
                x: [book.startX, (book.startX + targetX) / 2, targetX],
                y: [book.startY, book.startY - 180, targetY], // curved peak arch path
                scale: [0.3, 1.2, 0.2],
                rotate: [0, 45, 360],
                opacity: [0, 1, 1, 0],
                filter: ['blur(1px)', 'blur(0px)', 'blur(1px)']
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.1,
                ease: [0.25, 0.1, 0.25, 1], // easeInOut-ish
                times: [0, 0.4, 1]
              }}
              onAnimationComplete={() => handleAnimationComplete(book.id)}
              className="absolute w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/30 flex items-center justify-center border border-white/20"
            >
              <BookOpen className="w-6 h-6 text-white" />
              {/* Sparkle particles trailing */}
              <span className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping -top-1 -left-1" />
              <span className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping -bottom-1 -right-1" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
