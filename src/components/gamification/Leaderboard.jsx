import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Zap } from 'lucide-react';

export default function Leaderboard({ topUsers = [], currentUser, currentUserRank }) {
  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const getRankColor = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    if (position === 2) return 'bg-gradient-to-r from-slate-400 to-slate-500';
    if (position === 3) return 'bg-gradient-to-r from-amber-700 to-amber-800';
    return 'bg-slate-100 dark:bg-slate-800';
  };

  return (
    <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topUsers.map((user, index) => {
          const position = index + 1;
          const isCurrentUser = user.user_id === currentUser?.id;
          
          return (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-4 p-3 rounded-xl transition-all
                ${isCurrentUser 
                  ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500' 
                  : 'bg-slate-50 dark:bg-slate-800/50'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg
                ${getRankColor(position)}
              `}>
                {getRankIcon(position) || position}
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://i.pravatar.cc/100?u=${user.user_id}`} />
                <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                  {user.full_name || 'Anonymous'}
                  {isCurrentUser && (
                    <Badge className="bg-violet-600 text-white">You</Badge>
                  )}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.rank || 'Beginner'} • Level {user.level || 1}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold">
                  <Zap className="w-4 h-4" />
                  {user.total_points?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-slate-500">XP</p>
              </div>
            </motion.div>
          );
        })}
        
        {currentUserRank && currentUserRank > 10 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                #{currentUserRank}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://i.pravatar.cc/100?u=${currentUser?.id}`} />
                <AvatarFallback>{currentUser?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {currentUser?.full_name || 'You'}
                  <Badge className="ml-2 bg-violet-600 text-white">You</Badge>
                </p>
                <p className="text-sm text-slate-500">Your current rank</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}