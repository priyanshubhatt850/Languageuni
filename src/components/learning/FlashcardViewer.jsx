import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

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
    return <div className="text-center py-8 text-slate-500">No cards available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="perspective">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="h-64"
        >
          <Card 
            className="h-full cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className="text-center p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {isFlipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {isFlipped ? card?.back : card?.front}
              </p>
              {card?.example && !isFlipped && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 italic">
                  "{card.example}"
                </p>
              )}
              <p className="text-xs text-slate-500 mt-4">Click to flip</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Card {currentIndex + 1} of {deck.cards.length}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevCard} disabled={currentIndex === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentIndex(0)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextCard} disabled={currentIndex === deck.cards.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}