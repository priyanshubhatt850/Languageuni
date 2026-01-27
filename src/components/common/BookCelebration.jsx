import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function triggerBookCelebration() {
  const duration = 4000;
  const end = Date.now() + duration;

  const celebrationLoop = () => {
    if (Date.now() > end) return;

    // Golden light rays burst
    confetti({
      particleCount: 4,
      angle: 45 + Math.random() * 90,
      spread: 20,
      origin: { x: 0.5, y: 0.4 },
      gravity: -0.1,
      decay: 0.88,
      startVelocity: 80,
      scalar: 2,
      colors: ['#FCD34D', '#FBBF24', '#F59E0B'],
      shapes: ['circle']
    });

    // Falling pages/books
    for (let i = 0; i < 3; i++) {
      confetti({
        particleCount: 2,
        angle: 80 + Math.random() * 20,
        spread: 25,
        origin: { x: Math.random() * 0.6 + 0.2, y: -0.2 },
        gravity: 0.8,
        decay: 0.96,
        startVelocity: 25 + Math.random() * 15,
        scalar: 1.5,
        colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#A78BFA'],
        shapes: ['square'],
        rotation: [
          { angle: Math.random() * 360, axis: 'z' },
          { angle: Math.random() * 360, axis: 'x' }
        ]
      });
    }

    // Sparkles
    confetti({
      particleCount: 8,
      angle: Math.random() * 360,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      gravity: 0.2,
      decay: 0.91,
      startVelocity: 35,
      scalar: 0.6,
      colors: ['#FBBF24', '#FCD34D', '#FDEACA'],
      shapes: ['star']
    });

    // Light stream upward
    if (Math.random() > 0.6) {
      confetti({
        particleCount: 5,
        angle: 60 + Math.random() * 60,
        spread: 30,
        origin: { x: 0.5, y: 0.8 },
        gravity: -0.3,
        decay: 0.89,
        startVelocity: 50,
        scalar: 1.2,
        colors: ['#60A5FA', '#93C5FD', '#BFDBFE'],
        shapes: ['circle']
      });
    }

    requestAnimationFrame(celebrationLoop);
  };

  celebrationLoop();
}

export default function BookCelebration({ trigger = false }) {
  useEffect(() => {
    if (trigger) {
      triggerBookCelebration();
    }
  }, [trigger]);

  return null;
}