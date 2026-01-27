import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonSummaryGenerator({ onApply }) {
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    if (!content.trim()) {
      toast.error('Please enter lesson content');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Create a comprehensive summary of this lesson content for language learners:

${content}

Provide a structured JSON response with:
1. title: A catchy, descriptive title (max 60 chars)
2. brief_summary: A 2-3 sentence overview
3. key_points: Array of 4-6 main takeaways
4. vocabulary: Array of 5-8 important words/phrases with brief definitions
5. practice_suggestions: 3-4 ways students can practice what they learned

Make it engaging and student-friendly.`;

      const result = await WWClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            brief_summary: { type: "string" },
            key_points: {
              type: "array",
              items: { type: "string" }
            },
            vocabulary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" }
                }
              }
            },
            practice_suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSummary(result);
      toast.success('Lesson summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (summary) {
      onApply(summary);
      toast.success('Summary applied');
    }
  };

  const handleCopyToClipboard = () => {
    if (summary) {
      const text = `${summary.title}\n\n${summary.brief_summary}\n\nKey Points:\n${summary.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nVocabulary:\n${summary.vocabulary.map(v => `• ${v.term}: ${v.definition}`).join('\n')}\n\nPractice Suggestions:\n${summary.practice_suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          AI Lesson Summary Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Lesson Content *</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your full lesson content, transcript, or materials here..."
            rows={8}
            disabled={generating}
          />
        </div>

        <Button 
          onClick={generateSummary}
          disabled={generating || !content.trim()}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>

        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pt-4 border-t"
            >
              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Title
                </Label>
                <Input
                  value={summary.title}
                  onChange={(e) => setSummary({ ...summary, title: e.target.value })}
                  className="bg-green-50 dark:bg-green-950/20 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Brief Summary
                </Label>
                <Textarea
                  value={summary.brief_summary}
                  onChange={(e) => setSummary({ ...summary, brief_summary: e.target.value })}
                  rows={3}
                  className="bg-green-50 dark:bg-green-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Points
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {summary.key_points?.map((point, idx) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                      <p className="text-sm"><strong>{idx + 1}.</strong> {point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Vocabulary ({summary.vocabulary?.length || 0})
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {summary.vocabulary?.map((item, idx) => (
                    <div key={idx} className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <p className="text-sm font-semibold">{item.term}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleApply}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Apply to Lesson
                </Button>
                <Button 
                  onClick={handleCopyToClipboard}
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}