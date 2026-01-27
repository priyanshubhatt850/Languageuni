import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseOutlineGenerator({ onApply }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [outline, setOutline] = useState(null);

  const generateOutline = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Generate a comprehensive course outline for a language learning course with the following details:
Topic: ${topic}
Level: ${level || 'Beginner to Intermediate'}

Provide a structured JSON response with:
1. A compelling course description (2-3 sentences)
2. An array of 5-8 specific learning goals
3. Suggested duration in hours
4. Key topics to cover

Format the response as JSON with these exact keys: description, learning_goals, duration_hours, key_topics`;

      const result = await WWClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            learning_goals: {
              type: "array",
              items: { type: "string" }
            },
            duration_hours: { type: "number" },
            key_topics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setOutline(result);
      toast.success('Course outline generated!');
    } catch (error) {
      toast.error('Failed to generate outline');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (outline) {
      onApply(outline);
      toast.success('Outline applied to course');
    }
  };

  return (
    <Card className="border-2 border-violet-200 dark:border-violet-800">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI Course Outline Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Course Topic *</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Spanish for Business Professionals"
            disabled={generating}
          />
        </div>

        <div className="space-y-2">
          <Label>Target Level (Optional)</Label>
          <Input
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g., A2, Intermediate"
            disabled={generating}
          />
        </div>

        <Button 
          onClick={generateOutline}
          disabled={generating || !topic.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Outline
            </>
          )}
        </Button>

        <AnimatePresence>
          {outline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pt-4 border-t"
            >
              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Generated Description
                </Label>
                <Textarea
                  value={outline.description}
                  onChange={(e) => setOutline({ ...outline, description: e.target.value })}
                  rows={3}
                  className="bg-green-50 dark:bg-green-950/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Learning Goals ({outline.learning_goals?.length || 0})
                </Label>
                <div className="space-y-2">
                  {outline.learning_goals?.map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <Badge variant="secondary">{idx + 1}</Badge>
                      <span className="text-sm flex-1">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Duration
                  </Label>
                  <Input
                    type="number"
                    value={outline.duration_hours}
                    onChange={(e) => setOutline({ ...outline, duration_hours: Number(e.target.value) })}
                    className="bg-green-50 dark:bg-green-950/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Topics
                  </Label>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {outline.key_topics?.length || 0} topics
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={handleApply}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Apply to Course
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}