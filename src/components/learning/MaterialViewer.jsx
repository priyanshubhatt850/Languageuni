import React, { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

export default function MaterialViewer({ material, onClose }) {
  const renderContent = () => {
    switch (material.material_type) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={material.file_url}
            title={material.title}
            duration={material.duration_minutes}
          />
        );

      case 'listening':
        return (
          <AudioPlayer
            audioUrl={material.file_url}
            title={material.title}
            duration={material.duration_minutes}
          />
        );

      case 'reading':
      case 'grammar':
      case 'vocabulary':
        // Check if it's a PDF or other document
        if (material.file_url?.toLowerCase().includes('.pdf')) {
          return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <iframe
                src={`${material.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-96 md:h-[600px] rounded-lg border border-slate-300 dark:border-slate-700"
                title={material.title}
              />
            </div>
          );
        } else {
          // Plain text or HTML content
          return (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-h-96 md:max-h-[600px] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="prose dark:prose-invert max-w-none">
                {material.file_url ? (
                  <iframe
                    src={material.file_url}
                    className="w-full h-96 md:h-[500px] rounded-lg"
                    title={material.title}
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">{material.description}</p>
                )}
              </div>
            </div>
          );
        }

      case 'writing':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              {material.file_url ? (
                <iframe
                  src={material.file_url}
                  className="w-full h-96 md:h-[500px] rounded-lg border border-slate-200 dark:border-slate-700"
                  title={material.title}
                />
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Writing Exercise
                  </h3>
                  {material.description && (
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {material.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'live_session':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {material.title}
              </h3>
              {material.scheduled_date && (
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Scheduled: {new Date(material.scheduled_date).toLocaleString()}
                </p>
              )}
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              asChild
            >
              <a href={material.live_session_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Join Live Session
              </a>
            </Button>
          </div>
        );

      default:
        return (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This material type is not supported for inline viewing
            </p>
            {material.file_url && (
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                asChild
              >
                <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{material.title}</h2>
            {material.duration_minutes > 0 && (
              <p className="text-white/80 text-sm mt-1">
                Duration: {material.duration_minutes} minutes
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {material.file_url && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                asChild
              >
                <a href={material.file_url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5" />
                </a>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {material.description && material.material_type !== 'writing' && (
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {material.description}
            </p>
          )}
          
          {renderContent()}
        </div>
      </motion.div>
    </motion.div>
  );
}