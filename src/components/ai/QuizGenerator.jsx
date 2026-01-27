import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizGenerator({ onApply }) {
  const [content, setContent] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);

  const generateQuiz = async () => {
    if (!content.trim()) {
      toast.error('Please enter course content');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Based on this course content, generate ${questionCount} quiz questions at ${difficulty} difficulty level:

${content}

Create a mix of multiple choice, true/false, and fill-in-the-blank questions. Each question should test understanding of key concepts.

Provide a JSON array of questions with this structure:
- id: unique identifier
- question: the question text
- type: "multiple_choice", "true_false", or "fill_blank"
- options: array of choices (for multiple choice)
- correct_answer: the correct answer
- points: 10 for easy, 15 for medium, 20 for hard
- explanation: brief explanation of the correct answer`;

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
                  id: { type: "string" },
                  question: { type: "string" },
                  type: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_answer: { type: "string" },
                  points: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuestions(result.questions);
      toast.success(`${result.questions.length} questions generated!`);
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (questions) {
      onApply(questions);
      toast.success('Quiz questions ready to use');
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Quiz Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Course Content / Lesson Material *</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your lesson content, key concepts, or topics here..."
            rows={6}
            disabled={generating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min="3"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={generating}>
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

        <Button 
          onClick={generateQuiz}
          disabled={generating || !content.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>

        <AnimatePresence>
          {questions && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pt-4 border-t"
            >
              <div className="flex items-center justify-between">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Generated Questions
                </Label>
                <Badge variant="secondary" className="text-lg">
                  {questions.length} questions
                </Badge>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge>{idx + 1}</Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                        <Badge variant="outline" className="text-xs capitalize">{q.type.replace('_', ' ')}</Badge>
                        {q.options && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt, oidx) => (
                              <div 
                                key={oidx} 
                                className={`text-xs p-2 rounded ${opt === q.correct_answer ? 'bg-green-100 dark:bg-green-900/30 font-semibold' : 'bg-white dark:bg-slate-800'}`}
                              >
                                {opt} {opt === q.correct_answer && '✓'}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleApply}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Use These Questions
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}