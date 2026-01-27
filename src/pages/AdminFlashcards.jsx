import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FlashcardDeckGenerator from '@/components/ai/FlashcardDeckGenerator';

export default function AdminFlashcards() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('levelId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);
  const [formData, setFormData] = useState({
    deck_name: '',
    description: '',
    category: 'vocabulary',
    difficulty: 'medium',
    cards: [],
    is_public: true
  });
  const [cardInput, setCardInput] = useState({ front: '', back: '', example: '' });
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: level } = useQuery({
    queryKey: ['level', levelId],
    queryFn: () => WWClient.entities.CourseLevel.filter({ id: levelId }).then(res => res[0]),
    enabled: !!levelId
  });

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['flashcards', levelId],
    queryFn: () => WWClient.entities.Flashcard.filter({ level_id: levelId }),
    enabled: !!levelId,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingDeck) {
        return WWClient.entities.Flashcard.update(editingDeck.id, data);
      }
      return WWClient.entities.Flashcard.create({ ...data, level_id: levelId, total_cards: data.cards.length });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcards', levelId]);
      setDialogOpen(false);
      resetForm();
      toast.success(editingDeck ? 'Deck updated' : 'Deck created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.Flashcard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcards', levelId]);
      toast.success('Deck deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      deck_name: '',
      description: '',
      category: 'vocabulary',
      difficulty: 'medium',
      cards: [],
      is_public: true
    });
    setCardInput({ front: '', back: '', example: '' });
    setEditingDeck(null);
  };

  const handleAddCard = () => {
    if (cardInput.front.trim() && cardInput.back.trim()) {
      setFormData({
        ...formData,
        cards: [...formData.cards, { id: Date.now().toString(), ...cardInput }]
      });
      setCardInput({ front: '', back: '', example: '' });
    }
  };

  const handleRemoveCard = (id) => {
    setFormData({
      ...formData,
      cards: formData.cards.filter(c => c.id !== id)
    });
  };

  const handleApplyAI = (generatedDeck) => {
    setFormData({
      deck_name: generatedDeck.deck_name,
      description: generatedDeck.description,
      category: generatedDeck.category || 'vocabulary',
      difficulty: generatedDeck.difficulty || 'medium',
      cards: generatedDeck.cards,
      is_public: true
    });
    setShowAIGenerator(false);
  };

  const handleSubmit = () => {
    if (!formData.deck_name || formData.cards.length === 0) {
      toast.error('Please add a deck name and at least one card');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  if (!levelId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={[]} />
          <main className="p-8 text-center">
            <p className="text-slate-600">No course level selected. Please select a level first.</p>
            <Link to={createPageUrl('AdminCourseLevels')}>
              <Button className="mt-4">Go to Course Levels</Button>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  if (!level) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Flashcard Decks
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {level?.level_name} - Manage vocabulary and learning decks
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-6">
            <Button 
              variant="outline"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="border-violet-300 text-violet-600 hover:bg-violet-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {showAIGenerator ? 'Hide' : 'Generate with AI'}
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Deck
            </Button>
          </div>

          {showAIGenerator && (
            <div className="mb-6">
              <FlashcardDeckGenerator levelId={levelId} onApply={handleApplyAI} />
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : decks.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500">
                No flashcard decks yet. Create your first deck!
              </div>
            ) : (
              decks.map((deck, idx) => (
                <motion.div key={deck.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{deck.deck_name}</h3>
                          <p className="text-sm text-slate-500">{deck.total_cards} cards</p>
                        </div>
                        <Badge className="text-xs">{deck.category}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{deck.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setFormData(deck); setEditingDeck(deck); setDialogOpen(true); }}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-red-600" onClick={() => { setDeckToDelete(deck); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Deck</DialogTitle>
              </DialogHeader>
              <p className="text-slate-600">Delete "{deckToDelete?.deck_name}"? This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => { deleteMutation.mutate(deckToDelete.id); setDeleteDialogOpen(false); }}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDeck ? 'Edit Deck' : 'Create Flashcard Deck'}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Deck Name *</Label>
                  <Input value={formData.deck_name} onChange={(e) => setFormData({ ...formData, deck_name: e.target.value })} placeholder="e.g., Common Verbs" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this deck" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="phrases">Phrases</SelectItem>
                        <SelectItem value="idioms">Idioms</SelectItem>
                        <SelectItem value="pronunciation">Pronunciation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium">Cards</h4>
                  <div className="space-y-2">
                    <Input value={cardInput.front} onChange={(e) => setCardInput({ ...cardInput, front: e.target.value })} placeholder="Front (e.g., English word)" />
                    <Input value={cardInput.back} onChange={(e) => setCardInput({ ...cardInput, back: e.target.value })} placeholder="Back (e.g., Translation)" />
                    <Input value={cardInput.example} onChange={(e) => setCardInput({ ...cardInput, example: e.target.value })} placeholder="Example (optional)" />
                    <Button onClick={handleAddCard} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Card
                    </Button>
                  </div>

                  {formData.cards.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.cards.map(card => (
                        <div key={card.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-start">
                          <div className="text-sm flex-1">
                            <p className="font-medium">{card.front}</p>
                            <p className="text-slate-500">{card.back}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveCard(card.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {saveMutation.isPending ? 'Saving...' : 'Save Deck'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}