import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ExercisePlayer({ exercise, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exercise?.time_limit_minutes * 60);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          toast.error('Time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) {
      toast.error('Please answer at least one question');
      return;
    }
    onSubmit({ answers, timeLeft });
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{exercise?.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{exercise?.description}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-2xl font-bold text-amber-600">{formatTime(timeLeft)}</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 justify-center w-full">
                <Zap className="w-3 h-3" /> {exercise?.points} points
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600 dark:text-slate-300 mb-6">{exercise?.content?.instruction}</p>

          {exercise?.type === 'multiple_choice' && (
            <div className="space-y-4">
              {exercise?.content?.items?.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="font-medium">{idx + 1}. {item.question}</p>
                  <div className="space-y-2">
                    {item.options?.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                        <input 
                          type="radio" 
                          name={`q${idx}`}
                          value={optIdx}
                          onChange={() => setAnswers({ ...answers, [`q${idx}`]: optIdx })}
                          checked={answers[`q${idx}`] === optIdx}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {exercise?.type === 'fill_blank' && (
            <div className="space-y-4">
              {exercise?.content?.items?.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <Label>{idx + 1}. {item.prompt}</Label>
                  <Input 
                    placeholder="Your answer"
                    value={answers[`q${idx}`] || ''}
                    onChange={(e) => setAnswers({ ...answers, [`q${idx}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {exercise?.type === 'short_answer' && (
            <div className="space-y-4">
              {exercise?.content?.items?.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <Label>{idx + 1}. {item.question}</Label>
                  <textarea 
                    placeholder="Your answer"
                    value={answers[`q${idx}`] || ''}
                    onChange={(e) => setAnswers({ ...answers, [`q${idx}`]: e.target.value })}
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitted} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Submit Exercise
        </Button>
      </div>
    </div>
  );
}