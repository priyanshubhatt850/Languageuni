import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoPlayer({ videoUrl, title, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const videoRef = React.useRef(null);

  if (!videoUrl) {
    return (
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Video URL not available</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setTotalTime(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative bg-slate-900">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Controls Overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 group">
          {/* Progress Bar */}
          <div className="w-full px-4 pb-16">
            <input
              type="range"
              min="0"
              max={totalTime || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / totalTime) * 100}%, #4b5563 ${(currentTime / totalTime) * 100}%, #4b5563 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="w-full px-4 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <span className="text-white text-xs font-medium">
                {formatTime(currentTime)} / {formatTime(totalTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Play Button Overlay (when paused) */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {title && (
        <div className="bg-white dark:bg-slate-800 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {duration && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Duration: {duration} minutes</p>
          )}
        </div>
      )}
    </div>
  );
}