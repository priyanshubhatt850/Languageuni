import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { Button } from '@/components/ui/button';

export default function VideoModal({ video, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="p-6">
            <VideoPlayer
              videoUrl={video.file_url}
              title={video.title}
              duration={video.duration_minutes}
            />
            
            {video.description && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                <p className="text-slate-300">{video.description}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}