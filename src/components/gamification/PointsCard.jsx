import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Crown } from 'lucide-react';

export default function PointsCard({ userPoints, rank = 1 }) {
  const totalPoints = userPoints?.total_points || 0;
  const level = userPoints?.level || 1;
  const currentRank = userPoints?.rank || 'Beginner';
  
  const pointsToNextLevel = level * 1000;
  const currentLevelPoints = totalPoints % 1000;
  const progress = (currentLevelPoints / pointsToNextLevel) * 100;

  const rankColors = {
    Beginner: 'from-slate-500 to-slate-600',
    Intermediate: 'from-emerald-500 to-emerald-600',
    Advanced: 'from-blue-500 to-blue-600',
    Expert: 'from-purple-500 to-purple-600',
    Master: 'from-amber-500 to-amber-600'
  };

  const rankIcons = {
    Beginner: '🌱',
    Intermediate: '⭐',
    Advanced: '💎',
    Expert: '👑',
    Master: '🏆'
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{rankIcons[currentRank]}</span>
              <span className="text-sm font-medium opacity-90">{currentRank}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{totalPoints.toLocaleString()}</span>
              <span className="text-violet-200">XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Crown className="w-4 h-4" />
            <span className="font-semibold">#{rank}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Level {level}</span>
            <span className="opacity-90">{currentLevelPoints} / {pointsToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">+50 XP today</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">On Fire! 🔥</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}