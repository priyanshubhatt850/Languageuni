import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Volume1, Settings, 
  RotateCcw, SkipForward, Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AudioPlayer({ audioUrl, title, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if inside text input fields
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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(totalTime, audioRef.current.currentTime + seconds));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalTime(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
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
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-950 rounded-2xl overflow-hidden shadow-2xl">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="p-5 sm:p-6 text-white space-y-4">
        {/* Equalizer Visualizer & Title Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-indigo-300 border border-white/5 shrink-0 shadow-inner">
              <Music className="w-5.5 h-5.5" />
            </div>
            <div className="text-left min-w-0">
              {title ? (
                <h3 className="font-bold text-sm sm:text-base tracking-tight truncate">{title}</h3>
              ) : (
                <h3 className="font-bold text-sm sm:text-base tracking-tight truncate text-slate-350">Language Lesson Audio</h3>
              )}
              {duration && (
                <p className="text-xs text-slate-400 font-medium">{duration} mins lesson</p>
              )}
            </div>
          </div>

          {/* Animated sound bars */}
          <div className="flex items-end gap-0.5 h-6 px-2 shrink-0">
            {[0.4, 0.8, 0.55, 0.9, 0.3].map((delay, index) => (
              <motion.span
                key={index}
                animate={isPlaying ? {
                  height: [4, 20, 4]
                } : {
                  height: 4
                }}
                transition={{
                  duration: 0.8 + delay * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delay * 0.2
                }}
                className="w-1 bg-gradient-to-t from-violet-500 to-fuchsia-400 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {/* Timeline slider */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={totalTime || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all accent-violet-400"
              style={{
                background: `linear-gradient(to right, #a78bfa 0%, #a78bfa ${(currentTime / (totalTime || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (totalTime || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Timer Display */}
          <div className="flex justify-between text-xs font-semibold text-slate-400 select-none">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Skip buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-slate-350 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => handleSkip(-5)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            {/* Play/Pause center toggle */}
            <Button
              size="icon"
              className="h-10 w-10 bg-white hover:bg-white/90 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950 text-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-slate-350 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => handleSkip(5)}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/volume">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-slate-350 hover:text-white hover:bg-white/10 rounded-full"
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

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 focus:w-16 h-1 rounded-full appearance-none cursor-pointer bg-white/20 accent-white transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Audio Speed Rate */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-xs font-bold text-slate-350 hover:text-white hover:bg-white/10 rounded-lg px-2 h-9 flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{playbackRate === 1 ? '1.0x' : `${playbackRate}x`}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 rounded-xl p-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer hover:bg-violet-600 focus:bg-violet-600 transition-colors ${
                      playbackRate === rate ? 'bg-violet-650 text-white font-bold' : ''
                    }`}
                  >
                    {rate === 1 ? '1.0x' : `${rate}x`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}