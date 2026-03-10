import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CalendarClock, XCircle, ChevronRight, Brain } from 'lucide-react';
import { Task } from '@/stores/useTaskStore';
import { format } from 'date-fns';

interface MissedTaskRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onReschedule: (id: string, type: 'tomorrow' | 'slot') => void;
  onDrop: (id: string) => void;
}

export default function MissedTaskRecoveryModal({
  open,
  onOpenChange,
  task,
  onReschedule,
  onDrop
}: MissedTaskRecoveryModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-destructive/20 bg-gradient-to-b from-background to-destructive/5 max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-destructive h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl font-black">
            Wait, we missed this! 🕰️
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            The deadline for <span className="font-bold text-foreground">"{task.title}"</span> has passed. 
            AI suggests a quick recovery plan to stay on track.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center mb-3">
               <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Original Deadline</span>
               <span className="text-xs font-bold text-destructive">{format(new Date(task.deadline), 'MMM d, h:mm a')}</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
               <Brain className="h-5 w-5 text-destructive animate-pulse" />
               <p className="text-xs text-destructive-foreground/90 leading-tight">
                  <span className="font-bold">AI Insight:</span> Moving this to tomorrow is safest, but your morning is already packed.
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={() => onReschedule(task.id, 'tomorrow')}
              className="group h-14 justify-between bg-destructive hover:bg-destructive/90 rounded-2xl p-4 shadow-lg shadow-destructive/10 transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold text-sm">Reschedule Tomorrow</div>
                  <div className="text-[10px] opacity-70">First available slot</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button 
              onClick={() => onReschedule(task.id, 'slot')}
              variant="outline"
              className="group h-14 justify-between border-white/10 hover:bg-white/5 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">?</div>
                <div className="text-left">
                  <div className="font-bold text-sm">Pick a custom slot</div>
                  <div className="text-[10px] opacity-70 text-muted-foreground">Select from calendar</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button 
              onClick={() => onDrop(task.id)}
              variant="ghost" 
              className="h-12 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl text-xs font-bold"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Not relevant anymore (Drop Task)
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4 italic opacity-50">
          "Don't worry! Everyone misses things. The important part is how you adapt."
        </p>
      </DialogContent>
    </Dialog>
  );
}
