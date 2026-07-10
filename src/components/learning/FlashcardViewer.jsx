import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, HelpCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardViewer({ deck }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = deck?.cards?.[currentIndex];

  const nextCard = () => {
    if (currentIndex < (deck?.cards?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (!deck?.cards?.length) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-550 dark:text-slate-400 font-bold">No flashcards available in this deck</p>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / deck.cards.length) * 100;

  return (
    <div className="space-y-6">
      {/* 3D Card Perspective Styling Injection */}
      <style>{`
        .perspective-container {
          perspective: 1500px;
        }
        .card-3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        .card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Main Flashcard Arena */}
      <div className="perspective-container h-80 w-full select-none">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
          className="card-3d-wrapper"
        >
          {/* FRONT CARD FACE */}
          <div className="card-face">
            <Card 
              className="h-full cursor-pointer bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 border border-slate-200 dark:border-slate-850 hover:border-violet-350 dark:hover:border-violet-850 shadow-lg hover:shadow-xl rounded-3xl transition-all flex flex-col justify-between overflow-hidden"
              onClick={() => setIsFlipped(true)}
            >
              {/* Header Info */}
              <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-100/50 dark:bg-violet-950/40 px-2.5 py-1 rounded-full">
                  Term / Question
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Card {currentIndex + 1} of {deck.cards.length}
                </span>
              </div>

              {/* Main Content */}
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                  {card?.front}
                </p>
                {card?.example && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic max-w-sm">
                    "{card.example}"
                  </p>
                )}
              </CardContent>

              {/* Footer Hint */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 text-center flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>Tap Card to Reveal Translation</span>
              </div>
            </Card>
          </div>

          {/* BACK CARD FACE */}
          <div className="card-face card-back">
            <Card 
              className="h-full cursor-pointer bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-850 hover:border-emerald-350 dark:hover:border-emerald-850 shadow-lg hover:shadow-xl rounded-3xl transition-all flex flex-col justify-between overflow-hidden"
              onClick={() => setIsFlipped(false)}
            >
              {/* Header Info */}
              <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100/50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Definition / Answer
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Card {currentIndex + 1} of {deck.cards.length}
                </span>
              </div>

              {/* Main Content */}
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-snug tracking-tight">
                  {card?.back}
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  You discovered the definition! Practice recalling this item.
                </p>
              </CardContent>

              {/* Footer Hint */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 text-center flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tap Card to Return to Question</span>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Progress & Deck Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-850 rounded-2xl">
        {/* Progress bar */}
        <div className="w-full sm:w-1/2 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-violet-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 shrink-0 select-none">
            {currentIndex + 1} / {deck.cards.length}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 select-none">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevCard} 
            disabled={currentIndex === 0}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            disabled={currentIndex === 0 && !isFlipped}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-1.5 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextCard} 
            disabled={currentIndex === deck.cards.length - 1}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}