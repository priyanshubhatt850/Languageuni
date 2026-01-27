import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  onAction 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={onAction} className="bg-violet-600 hover:bg-violet-700">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}