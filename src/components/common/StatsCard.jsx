import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon, 
  color = 'violet',
  delay = 0 
}) {
  const colorClasses = {
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              {change && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  changeType === 'increase' ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", colorClasses[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}