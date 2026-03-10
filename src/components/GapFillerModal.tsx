import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Task } from '@/stores/useTaskStore';
import { CountUp } from '@/components/CountUp';

interface GapFillerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gapMinutes: number;
  suggestedTask: Task | null;
  onAccept: (task: Task) => void;
}

export default function GapFillerModal({
  open,
  onOpenChange,
  gapMinutes,
  suggestedTask,
  onAccept
}: GapFillerModalProps) {
  if (!suggestedTask) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-primary/20 bg-gradient-to-b from-background to-primary/5 max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 animate-bounce-subtle">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl font-black">
            You're ahead of schedule! 🚀
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            You finished <span className="font-bold text-primary">{gapMinutes} minutes</span> earlier than planned. 
            AI suggests using this slot to get ahead on:
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 mt-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl shadow-sm">
               {suggestedTask.category === 'exam' ? '📚' : suggestedTask.category === 'assignment' ? '📝' : '🌟'}
            </div>
            <div className="flex-1 min-w-0">
               <h4 className="font-bold text-lg truncate">{suggestedTask.title}</h4>
               <p className="text-xs text-muted-foreground line-clamp-2">
                 {suggestedTask.description || 'No description provided.'}
               </p>
               <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    suggestedTask.priority === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                    suggestedTask.priority === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-500'
                  }`}>
                    {suggestedTask.priority} Priority
                  </span>
                  <span className="text-[10px] opacity-40 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{suggestedTask.estimated_duration_mins || 45}m
                  </span>
               </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
             <p className="text-xs italic text-primary/80 leading-relaxed">
               "Pulling this forward keeps your momentum high and avoids a late-night session tomorrow."
             </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl order-2 sm:order-1">
            Maybe later
          </Button>
          <Button onClick={() => onAccept(suggestedTask)} className="magic-btn rounded-xl flex-1 order-1 sm:order-2">
            Pull forward <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
