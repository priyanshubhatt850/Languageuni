import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Volume1, Maximize2, 
  Settings, RotateCcw, SkipForward, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VideoPlayer({ videoUrl, title, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [lastAction, setLastAction] = useState(null); // 'play' | 'pause' | 'skip'
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle controls auto-hide
  const triggerShowControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    triggerShowControls();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts if user is not typing in an input/textarea
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'm':
          e.preventDefault();
          handleMute();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(5);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-5);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <p className="text-slate-500 dark:text-slate-400 font-semibold">Video URL not available</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setLastAction('pause');
      } else {
        videoRef.current.play();
        setLastAction('play');
      }
      setIsPlaying(!isPlaying);
      triggerShowControls();
      
      // Clear last action after anim completes
      setTimeout(() => setLastAction(null), 600);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    triggerShowControls();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    triggerShowControls();
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(totalTime, videoRef.current.currentTime + seconds));
      setLastAction(seconds > 0 ? 'forward' : 'rewind');
      setTimeout(() => setLastAction(null), 600);
      triggerShowControls();
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
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
    triggerShowControls();
  };

  const handleSpeedChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    triggerShowControls();
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
    <div 
      ref={containerRef}
      onMouseMove={triggerShowControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="group relative w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
    >
      <div className="relative aspect-video w-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          onClick={handlePlayPause}
          className="w-full h-full object-contain cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Center state change feedback animation */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute pointer-events-none w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white z-20"
            >
              {lastAction === 'play' && <Play className="w-8 h-8 fill-white ml-1" />}
              {lastAction === 'pause' && <Pause className="w-8 h-8 fill-white" />}
              {lastAction === 'forward' && <SkipForward className="w-8 h-8 fill-white" />}
              {lastAction === 'rewind' && <RotateCcw className="w-8 h-8" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Controls Overlay */}
        <div 
          className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Title Overlay */}
          {title && (
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent text-white text-left">
              <h3 className="font-bold text-lg tracking-tight truncate">{title}</h3>
              {duration && (
                <p className="text-xs text-slate-350 mt-0.5">{duration} mins duration</p>
              )}
            </div>
          )}

          {/* Bottom Panel */}
          <div className="p-4 sm:p-6 space-y-3.5">
            {/* Timeline Progress Slider */}
            <div className="flex items-center gap-3 group/progress">
              <input
                type="range"
                min="0"
                max={totalTime || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700 accent-violet-500 hover:h-2 transition-all duration-150"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(currentTime / (totalTime || 1)) * 100}%, #334155 ${(currentTime / (totalTime || 1)) * 100}%, #334155 100%)`
                }}
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-white hover:bg-white/10 rounded-full hover:scale-105 active:scale-95 transition-all"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </Button>

                {/* Skip Backward/Forward */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:flex"
                  onClick={() => handleSkip(-5)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:flex"
                  onClick={() => handleSkip(5)}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Volume Section */}
                <div className="flex items-center gap-1.5 group/volume ml-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                    onClick={handleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : volume > 0.5 ? (
                      <Volume2 className="w-4 h-4" />
                    ) : volume > 0 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {/* Sliding Volume Bar */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/volume:w-16 focus:w-16 h-1 rounded-full appearance-none cursor-pointer bg-slate-700 accent-white transition-all duration-300 overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #334155 ${(isMuted ? 0 : volume) * 100}%, #334155 100%)`
                    }}
                  />
                </div>

                {/* Time Indicator */}
                <span className="text-xs font-semibold text-slate-300 ml-2 select-none">
                  {formatTime(currentTime)} <span className="text-slate-500">/</span> {formatTime(totalTime)}
                </span>
              </div>

              {/* Right Side Options */}
              <div className="flex items-center gap-1.5">
                {/* Speed Controller */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg px-2 h-9 flex items-center gap-1"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900/95 border-slate-800 text-slate-200 backdrop-blur-md rounded-xl p-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer hover:bg-violet-600 focus:bg-violet-600 transition-colors ${
                          playbackRate === rate ? 'bg-violet-650 text-white font-bold' : ''
                        }`}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={handleFullscreen}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}