import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PracticeQuestionGenerator({ levelId, levelName, onQuestionsGenerated }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const generateQuestions = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate 5 practice questions for a ${levelName} level language learner about "${topic}". 
        Difficulty: ${difficulty}
        Format the response as a JSON array with objects containing:
        - question (string)
        - type (string): one of "fill_blank", "multiple_choice", "short_answer", "matching"
        - options (array, only for multiple_choice): 4 options
        - answer (string)
        - explanation (string)`;

      const result = await WWClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  answer: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedQuestions(result.questions || []);
      toast.success(`Generated ${result.questions?.length || 0} practice questions!`);
    } catch (error) {
      toast.error('Failed to generate questions');
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
          className="w-full border-dashed border-2 border-purple-300 hover:border-purple-500 text-purple-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Practice Questions with AI
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-200 bg-purple-50 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
                AI Practice Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Textarea
                  placeholder="e.g., French greetings, past tense verbs, restaurant vocabulary..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map(level => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                      className={difficulty === level ? 'bg-purple-600' : ''}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateQuestions}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Generate Questions'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setTopic('');
                    setGeneratedQuestions([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-3"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">Generated Questions Preview:</h3>
              {generatedQuestions.map((q, idx) => (
                <Card key={idx} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <p className="font-medium text-sm mb-2">{idx + 1}. {q.question}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Type: {q.type}</p>
                    {q.options && (
                      <ul className="text-xs mt-2 space-y-1 ml-4">
                        {q.options.map((opt, i) => (
                          <li key={i}>• {opt}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button
                onClick={() => onQuestionsGenerated(generatedQuestions)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Add to Study Materials
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}