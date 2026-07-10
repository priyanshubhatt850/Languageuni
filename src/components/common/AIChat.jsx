import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, MessageCircle, RefreshCw, Sparkles, User } from 'lucide-react';
import { WWClient } from '@/api/WWClient';
import { toast } from 'sonner';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from backend on mount/open
  useEffect(() => {
    if (isOpen) {
      const loadHistory = async () => {
        try {
          const res = await WWClient.custom.get('/aichat/history');
          if (res?.success && res?.history?.messages) {
            setMessages(res.history.messages);
          }
        } catch (err) {
          console.error("Failed to load AI chat history:", err);
        }
      };
      loadHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userPrompt = inputMessage.trim();
    setInputMessage('');
    
    // Add user message locally
    setMessages(prev => [...prev, { sender: 'user', text: userPrompt, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await WWClient.custom.post('/aichat/message', { prompt: userPrompt });
      if (res?.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.response, timestamp: new Date() }]);
      } else {
        toast.error(res.message || "Failed to get tutor response");
      }
    } catch (err) {
      toast.error("Error communicating with AI tutor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      try {
        const res = await WWClient.custom.post('/aichat/clear');
        if (res?.success) {
          setMessages([]);
          toast.success("Conversation history cleared");
        }
      } catch (err) {
        toast.error("Failed to clear history");
      }
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-violet-500/20 z-[999] hover:shadow-violet-500/35 border border-white/10"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6 animate-pulse" />}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
      </motion.button>

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-24 right-6 w-full max-w-[380px] h-[500px] z-[998] pointer-events-auto"
          >
            <Card className="h-full border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col">
              {/* Header */}
              <CardHeader className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50/50 dark:from-violet-950/20 dark:to-indigo-950/20 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                      AI Language Coach <Sparkles className="w-3.5 h-3.5 text-violet-500 fill-violet-500" />
                    </CardTitle>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 text-slate-400 hover:text-slate-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>

              {/* Message scroll area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
                    <Bot className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Practice your language skills</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                        Send a message to practice conversation. I'll correct spelling and grammar errors!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 ${
                          isUser 
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350' 
                            : 'bg-violet-600 text-white'
                        }`}>
                          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-xs text-left ${
                          isUser 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-205 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl text-xs text-left bg-slate-100 dark:bg-slate-800 rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-violet-500 text-xs"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-9 w-9 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
