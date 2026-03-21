import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '@/components/common/Pagination';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Star,
  ArrowLeft,
  Calendar,
  Target,
  Flame
} from 'lucide-react';

const rankColors = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-slate-300 to-slate-400',
  3: 'from-amber-600 to-amber-700',
};

const rankIcons = {
  1: Crown,
  2: Medal,
  3: Award,
};

const rankLabels = {
  'Beginner': { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Target },
  'Intermediate': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: TrendingUp },
  'Advanced': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: Zap },
  'Expert': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: Flame },
  'Master': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: Crown },
};

const ITEMS_PER_PAGE = 10;

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await WWClient.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const userPoints = await WWClient.entities.UserPoints.list('-total_points', 1000);
      const userIds = userPoints.map(up => up.user_id);
      const users = await WWClient.entities.User.filter({ id: { $in: userIds } });
      
      const combined = userPoints.map((points, index) => {
        const userData = users.find(u => u._id === points.user_id);
        return {
          ...points,
          rank: index + 1,
          user: userData,
        };
      });

      return combined;
    },
    staleTime: 2 * 60 * 1000,
  });

  const currentUserRank = leaderboardData?.find(item => item.user_id === user?._id);
  
  // Pagination for leaderboard (skip first 3 for podium)
  const leaderboardList = leaderboardData?.slice(3) || [];
  const totalPages = Math.ceil(leaderboardList.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedLeaderboard = leaderboardList.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                className="hover:bg-violet-100 dark:hover:bg-violet-900/30"
              >
                <Link to={createPageUrl('StudentDashboard')}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
              </div>
            </div>
            {user && (
              <Link to={createPageUrl('StudentDashboard')}>
                <Button className="bg-violet-600 hover:bg-violet-700">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl mb-6">
            <Trophy className="w-16 h-16 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Global Leaderboard
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Compete with learners worldwide and climb to the top!
          </p>
        </motion.div>

        {/* Current User Rank Card */}
        {currentUserRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-2 border-violet-600 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white">
                      <AvatarImage src={currentUserRank.user?.avatar_url} />
                      <AvatarFallback className="bg-white text-violet-600 text-xl font-bold">
                        {currentUserRank.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Your Rank</p>
                      <h3 className="text-3xl font-bold text-white">#{currentUserRank.rank}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm font-medium">Total XP</p>
                    <h3 className="text-3xl font-bold text-white">
                      {currentUserRank.total_points.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Timeframe Tabs */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => { setTimeframe(value); setCurrentPage(1); }}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Trophy className="w-4 h-4 mr-2" />
              All Time
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Zap className="w-4 h-4 mr-2" />
              This Week
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        {leaderboardData && leaderboardData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
              {/* 2nd Place */}
              <PodiumCard rank={2} data={leaderboardData[1]} />
              
              {/* 1st Place */}
              <PodiumCard rank={1} data={leaderboardData[0]} />
              
              {/* 3rd Place */}
              <PodiumCard rank={3} data={leaderboardData[2]} />
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6" />
              Top Players
            </h3>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  <AnimatePresence>
                    {paginatedLeaderboard.map((item, index) => (
                      <LeaderboardRow 
                        key={item.user_id} 
                        data={item} 
                        delay={index * 0.05}
                        isCurrentUser={item.user_id === user?._id}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {leaderboardList.length > 0 && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={leaderboardList.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PodiumCard({ rank, data }) {
  const Icon = rankIcons[rank];
  const RankBadge = rankLabels[data.rank]?.icon || Target;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={rank === 1 ? 'col-start-2' : ''}
    >
      <Card className={`border-0 shadow-2xl overflow-hidden ${rank === 1 ? 'scale-110' : ''}`}>
        <div className={`bg-gradient-to-br ${rankColors[rank]} p-6 text-white text-center relative`}>
          <div className="absolute top-2 right-2">
            <Icon className="w-8 h-8" />
          </div>
          <Avatar className={`mx-auto border-4 border-white shadow-xl ${rank === 1 ? 'w-24 h-24' : 'w-20 h-20'}`}>
            <AvatarImage src={data.user?.avatar_url} />
            <AvatarFallback className="text-2xl font-bold">
              {data.user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h3 className={`font-bold mt-3 ${rank === 1 ? 'text-2xl' : 'text-xl'}`}>
            #{rank}
          </h3>
        </div>
        <CardContent className="p-4 text-center">
          <p className="font-semibold text-slate-900 dark:text-white mb-2 truncate">
            {data.user?.full_name || 'Unknown User'}
          </p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge className={rankLabels[data.rank]?.color || 'bg-slate-100'}>
              Level {data.level}
            </Badge>
          </div>
          <div className="flex items-center justify-center gap-1 text-violet-600 dark:text-violet-400">
            <Zap className="w-4 h-4" />
            <span className="font-bold text-lg">
              {data.total_points.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">XP</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeaderboardRow({ data, delay, isCurrentUser }) {
  const RankBadge = rankLabels[data.rank]?.icon || Target;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
        isCurrentUser ? 'bg-violet-50 dark:bg-violet-950/20' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-12 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.rank}
          </span>
        </div>

        {/* Avatar & Name */}
        <Avatar className="w-12 h-12">
          <AvatarImage src={data.user?.avatar_url} />
          <AvatarFallback className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold">
            {data.user?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">
            {data.user?.full_name || 'Unknown User'}
            {isCurrentUser && (
              <Badge className="ml-2 bg-violet-600 text-white">You</Badge>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className={rankLabels[data.rank]?.color}>
              <RankBadge className="w-3 h-3 mr-1" />
              {data.rank}
            </Badge>
            <span className="text-slate-500">Level {data.level}</span>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-xl">
              {data.total_points.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500">XP</p>
        </div>
      </div>
    </motion.div>
  );
}