import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import FlashcardViewer from '@/components/learning/FlashcardViewer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function StudentFlashcards() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');
  const deckId = urlParams.get('deckId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ['flashcard-deck', deckId],
    queryFn: async () => {
      const decks = await WWClient.entities.Flashcard.filter({ id: deckId });
      return decks[0];
    },
    enabled: !!deckId
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['student-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?._id,
    initialData: []
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading || deckLoading) return <LoadingPage />;

  if (!deck) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={notifications} />
          <main className="p-8 text-center">
            <p className="text-slate-600">Flashcard deck not found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="student" currentPage="MyLearning" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(createPageUrl(`StudentPractice?levelId=${levelId}`))}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {deck.deck_name}
                </h1>
                {deck.description && (
                  <p className="text-slate-600 dark:text-slate-400">
                    {deck.description}
                  </p>
                )}
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <FlashcardViewer deck={deck} />
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}