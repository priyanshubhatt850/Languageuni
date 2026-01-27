import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function FlashcardDeckGenerator({ levelId, levelName, onDeckGenerated }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [deckName, setDeckName] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);

  const generateFlashcards = async () => {
    if (!topic.trim() || !deckName.trim()) {
      toast.error('Please enter both topic and deck name');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate ${cardCount} flashcards for a ${levelName} level language learner about "${topic}".
        Deck name: "${deckName}"
        
        Format the response as a JSON object with:
        - deck_name (string)
        - category (string): vocabulary, grammar, phrases, or idioms
        - cards (array of objects with):
          - front (string): the question/word
          - back (string): the answer/translation
          - example (string): usage example
          
        Make cards practical and useful for learning.`;

      const result = await WWClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            deck_name: { type: "string" },
            category: { type: "string" },
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                  example: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedCards(result.cards || []);
      toast.success(`Generated ${result.cards?.length || 0} flashcards!`);
    } catch (error) {
      toast.error('Failed to generate flashcards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="w-full border-dashed border-2 border-blue-300 hover:border-blue-500 text-blue-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Flashcard Deck with AI
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
                AI Flashcard Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Deck Name</label>
                <Input
                  placeholder="e.g., French Colors, Spanish Food"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Textarea
                  placeholder="e.g., Describe what you want to learn..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Cards</label>
                <Input
                  type="number"
                  min="5"
                  max="50"
                  value={cardCount}
                  onChange={(e) => setCardCount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateFlashcards}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Generate Deck'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setTopic('');
                    setDeckName('');
                    setGeneratedCards([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-3"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">Generated Cards Preview:</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {generatedCards.slice(0, 5).map((card, idx) => (
                  <Card key={idx} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-3 pb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-600 dark:text-blue-400">Front:</p>
                          <p className="text-slate-700 dark:text-slate-300">{card.front}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-600 dark:text-green-400">Back:</p>
                          <p className="text-slate-700 dark:text-slate-300">{card.back}</p>
                        </div>
                      </div>
                      {card.example && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Example: {card.example}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {generatedCards.length > 5 && (
                <p className="text-xs text-slate-500">... and {generatedCards.length - 5} more cards</p>
              )}
              <Button
                onClick={() => onDeckGenerated({ deckName, topic, cards: generatedCards })}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Add Deck to Study Materials
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}