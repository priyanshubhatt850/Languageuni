import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WWClient } from '@/api/WWClient'
import { Play, Download, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function MaterialCard({ material, levelId, onView, onBookmarkChange, isBookmarked }) {
  const [bookmarking, setBookmarking] = useState(false);

  const handleToggleBookmark = async () => {
    try {
      setBookmarking(true);
      if (isBookmarked) {
        // Remove bookmark
        const existing = await WWClient.entities.StudentMaterialBookmark.filter({
          user_id: (await WWClient.auth.me()).id,
          material_id: material.id,
          level_id: levelId
        });
        if (existing.length > 0) {
          await WWClient.entities.StudentMaterialBookmark.delete(existing[0].id);
          toast.success('Removed from bookmarks');
        }
      } else {
        // Add bookmark
        await WWClient.entities.StudentMaterialBookmark.create({
          user_id: (await WWClient.auth.me()).id,
          material_id: material.id,
          level_id: levelId,
          is_bookmarked: true
        });
        toast.success('Added to bookmarks');
      }
      onBookmarkChange?.();
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = material.file_url;
    a.download = material.title || 'material';
    a.click();
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
            <p className="text-xs text-slate-500 mt-1 capitalize">{material.material_type.replace('_', ' ')}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleBookmark}
            disabled={bookmarking}
            className={isBookmarked ? 'text-amber-500' : 'text-slate-400'}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {material.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {material.description}
          </p>
        )}
        {material.duration_minutes > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span>⏱️ {material.duration_minutes} min</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => onView(material)}
          >
            <Play className="w-4 h-4 mr-2" />
            View
          </Button>
          {material.file_url && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}