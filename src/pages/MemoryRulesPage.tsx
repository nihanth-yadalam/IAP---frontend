import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit2, Brain, Save, X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface MemoryRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'preference' | 'constraint' | 'learned';
}

const MOCK_RULES: MemoryRule[] = [
  { id: '1', title: 'Night Owl Mode', description: 'Schedule deep work tasks after 8 PM based on peak focus patterns.', enabled: true, type: 'learned' },
  { id: '2', title: 'No Math on Mondays', description: 'Avoid complex analytical tasks on Monday mornings due to historically low accuracy.', enabled: true, type: 'preference' },
  { id: '3', title: 'Buffer Time', description: 'Insert 15-minute gaps between back-to-back assignments.', enabled: false, type: 'constraint' },
];

export default function MemoryRulesPage() {
  const [rules, setRules] = useState<MemoryRule[]>(MOCK_RULES);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({ title: '', description: '', type: 'preference' as const });

  const handleAdd = () => {
    if (!newRule.title) return;
    const rule: MemoryRule = {
      id: Math.random().toString(36).substr(2, 9),
      ...newRule,
      enabled: true
    };
    setRules([...rules, rule]);
    setIsAdding(false);
    setNewRule({ title: '', description: '', type: 'preference' });
    toast.success("Memory rule added!");
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast.info("Rule deleted.");
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" /> AI Memory Rules
          </h1>
          <p className="text-muted-foreground">Manage how the AI learns and schedules for you.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="magic-btn rounded-2xl">
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      <div className="grid gap-6">
        {isAdding && (
          <Card className="rounded-2xl border-primary/30 bg-primary/5 animate-in slide-in-from-top-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">New Strategy Rule</CardTitle>
              <CardDescription>Define a new manual rule for the scheduling engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Title</Label>
                <Input 
                  value={newRule.title} 
                  onChange={e => setNewRule({ ...newRule, title: e.target.value })}
                  placeholder="e.g. Focus Morning"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={newRule.description} 
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="How should the AI behave?"
                  className="rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAdd} className="rounded-xl shadow-md">Create Rule</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {rules.map((rule) => (
          <Card key={rule.id} className={`rounded-3xl border-border/50 transition-all ${!rule.enabled ? 'opacity-50 grayscale-[0.5]' : 'hover:border-primary/20 shadow-lg shadow-black/5'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                     rule.type === 'learned' ? 'bg-purple-500/10 text-purple-500' :
                     rule.type === 'preference' ? 'bg-blue-500/10 text-blue-500' :
                     'bg-orange-500/10 text-orange-500'
                   }`}>
                     {rule.type === 'learned' ? <Brain className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{rule.title}</h4>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-30">{rule.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl">
                      <Trash2 className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 border-dashed">
         <div className="flex gap-4 items-center">
            <div className="bg-primary/20 p-3 rounded-2xl">
               <Brain className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
               <h5 className="font-bold text-sm">AI Reflexion Insight</h5>
               <p className="text-xs text-muted-foreground max-w-md">
                 Our scheduling engine uses these rules to refine your plan. Rules marked as "Learned" are automatically discovered from your past task feedback.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
