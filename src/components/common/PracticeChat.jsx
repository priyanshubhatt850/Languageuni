import React, { useState, useEffect, useRef } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  MessageCircle,
  X,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function PracticeChat({ level, language, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    initializeConversation();
    initializeSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Speak the latest AI message and auto-restart listening
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.spoken) {
        speakText(lastMessage.content);
        lastMessage.spoken = true;
      }
    }
  }, [messages, voiceEnabled]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        
        // Auto-send the message
        if (conversation && transcript.trim()) {
          setIsSending(true);
          try {
            await WWClient.agents.addMessage(conversation, {
              role: 'user',
              content: transcript
            });
          } catch (error) {
            console.error('Failed to send message:', error);
          } finally {
            setIsSending(false);
          }
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const conv = await WWClient.agents.createConversation({
        agent_name: 'language_practice',
        metadata: {
          level_id: level._id || level.id,
          level_name: level.level_name,
          language: language.name,
          language_flag: language.flag
        }
      });
      setConversation(conv);

      const unsubscribe = WWClient.agents.subscribeToConversation(conv._id || conv.id, (data) => {
        setMessages(data.messages || []);
      });

      // Send initial context message
      await WWClient.agents.addMessage(conv, {
        role: 'user',
        content: `I'm learning ${language.name} at level ${level.level_name}. Can you help me practice?`
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening || isSpeaking) return;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const speakText = (text) => {
    if (!synthRef.current || !voiceEnabled) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-restart listening after AI finishes speaking
      if (voiceEnabled && recognitionRef.current && !isListening) {
        setTimeout(() => {
          if (!isListening && voiceEnabled) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        }, 500);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleVoice = () => {
    if (voiceEnabled && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };



  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
      >
        <Avatar className={`w-8 h-8 ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
          <AvatarFallback className="text-white">
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl h-[80vh] flex flex-col border-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  AI Practice Tutor
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {language.flag} {language.name}
                  </Badge>
                </h3>
                <p className="text-sm text-slate-500">Level {level.level_name} Practice</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVoice}
                className={voiceEnabled ? 'text-blue-600' : 'text-slate-400'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Starting your practice session...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <ScrollArea className="w-full max-w-2xl h-full mb-6" ref={scrollRef}>
                  <AnimatePresence>
                    {messages.map((message, idx) => (
                      message.role !== 'system' && <MessageBubble key={idx} message={message} />
                    ))}
                  </AnimatePresence>
                </ScrollArea>

                <div className="w-full max-w-md text-center">
                  {!recognitionRef.current ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                      <p className="text-red-600 dark:text-red-400">
                        Voice not supported in your browser
                      </p>
                    </div>
                  ) : isListening ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      <div className="w-32 h-32 mx-auto mb-6 relative">
                        <motion.div
                          className="absolute inset-0 bg-blue-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.2, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Mic className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Listening...
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Speak in {language.name}
                      </p>
                      <Button
                        onClick={stopListening}
                        size="lg"
                        variant="outline"
                        className="border-2"
                      >
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </motion.div>
                  ) : isSpeaking ? (
                    <div>
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Volume2 className="w-12 h-12 text-white animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Tutor Speaking...
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Listen carefully
                      </p>
                    </div>
                  ) : isSending ? (
                    <div>
                      <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Processing...
                      </h3>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={startListening}
                      >
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Tap to Speak
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Have a conversation in {language.name}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}