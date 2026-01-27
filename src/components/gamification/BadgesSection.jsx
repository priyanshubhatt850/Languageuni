import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';

export default function BadgesSection({ userBadges = [], allBadges = [] }) {
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
  
  const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-amber-400 to-amber-500'
  };

  return (
    <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-600" />
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {allBadges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="relative group"
              >
                <div className={`
                  aspect-square rounded-2xl flex items-center justify-center text-4xl
                  ${isEarned 
                    ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg` 
                    : 'bg-slate-100 dark:bg-slate-800 opacity-40'
                  }
                  transition-all cursor-pointer
                `}>
                  {isEarned ? badge.icon : <Lock className="w-6 h-6 text-slate-400" />}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-xs rounded-lg p-3 whitespace-nowrap shadow-xl">
                    <p className="font-semibold mb-1">{badge.name}</p>
                    <p className="text-slate-300 text-xs">{badge.description}</p>
                    {isEarned && userBadge?.earned_date && (
                      <p className="text-slate-400 text-xs mt-1">
                        Earned {new Date(userBadge.earned_date).toLocaleDateString()}
                      </p>
                    )}
                    {!isEarned && badge.criteria && (
                      <p className="text-slate-400 text-xs mt-1">{badge.criteria}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Earned {userBadges.length} of {allBadges.length} badges
          </p>
        </div>
      </CardContent>
    </Card>
  );
}