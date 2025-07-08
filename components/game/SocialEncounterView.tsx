'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Shield, 
  Heart, 
  AlertCircle,
  FileText,
  Phone,
  HandHeart,
  TrendingUp,
  Smile,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEncounter } from '@/lib/hooks/useEncounter';
import { Encounter, SocialAction } from '@/lib/schemas/encounter-schemas';
import { cn } from '@/lib/utils';

interface SocialEncounterViewProps {
  encounter: Encounter;
  onComplete?: (outcome: 'victory' | 'defeat', rewards?: any) => void;
  className?: string;
}

// Action icons mapping
const ACTION_ICONS: Record<SocialAction, any> = {
  negotiate: TrendingUp,
  argue: MessageSquare,
  show_proof: FileText,
  de_escalate: Shield,
  call_support: Phone,
  apologize: HandHeart,
  document: FileText,
  empathize: Heart,
  firm_boundary: Shield,
  humor: Smile,
  wait: Clock,
};

// Action colors based on type
const ACTION_COLORS: Record<SocialAction, string> = {
  negotiate: 'bg-blue-500 hover:bg-blue-600',
  argue: 'bg-red-500 hover:bg-red-600',
  show_proof: 'bg-purple-500 hover:bg-purple-600',
  de_escalate: 'bg-green-500 hover:bg-green-600',
  call_support: 'bg-yellow-500 hover:bg-yellow-600',
  apologize: 'bg-pink-500 hover:bg-pink-600',
  document: 'bg-gray-500 hover:bg-gray-600',
  empathize: 'bg-teal-500 hover:bg-teal-600',
  firm_boundary: 'bg-orange-500 hover:bg-orange-600',
  humor: 'bg-indigo-500 hover:bg-indigo-600',
  wait: 'bg-slate-500 hover:bg-slate-600',
};

export function SocialEncounterView({ 
  encounter, 
  onComplete,
  className 
}: SocialEncounterViewProps) {
  const {
    currentState,
    context,
    isComplete,
    outcome,
    performAction,
    availableActions,
    actionInProgress,
    lastActionResult,
  } = useEncounter(encounter, { onComplete });

  if (!currentState || !context) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading encounter...</p>
        </div>
      </div>
    );
  }

  // Get mood color
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      furious: 'border-red-600 bg-red-950/20',
      angry: 'border-red-500 bg-red-900/20',
      annoyed: 'border-orange-500 bg-orange-900/20',
      neutral: 'border-gray-500 bg-gray-900/20',
      calming: 'border-blue-500 bg-blue-900/20',
      satisfied: 'border-green-500 bg-green-900/20',
    };
    return moodColors[mood] || moodColors.neutral;
  };

  return (
    <div className={cn('h-full flex flex-col gap-4 p-4', className)}>
      {/* Header with status bars */}
      <div className="space-y-2">
        {/* Reputation Bar */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium w-20">Reputation</span>
          <Progress value={context.reputation} className="flex-1" />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {context.reputation}%
          </span>
        </div>
        
        {/* Stress Bar */}
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium w-20">Stress</span>
          <Progress 
            value={(context.stress / context.maxStress) * 100} 
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {context.stress}/{context.maxStress}
          </span>
        </div>
      </div>

      {/* Main encounter area */}
      <Card className={cn(
        'flex-1 flex flex-col transition-colors duration-300',
        getMoodColor(currentState.mood || 'neutral')
      )}>
        <CardContent className="flex-1 flex flex-col p-6">
          {/* Opponent info */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-1">
              {encounter.opponent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <p className="text-sm text-muted-foreground">{encounter.setting}</p>
          </div>

          {/* Dialogue area */}
          <div className="flex-1 flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentState.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl"
              >
                <div className="bg-background/50 backdrop-blur rounded-lg p-6 shadow-lg">
                  <p className="text-lg leading-relaxed">
                    "{currentState.dialogue}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action feedback */}
          <AnimatePresence>
            {lastActionResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className={cn(
                  'rounded-lg px-4 py-2 text-sm',
                  lastActionResult.success ? 'bg-green-500/20' : 'bg-red-500/20'
                )}>
                  {lastActionResult.message || `You chose to ${lastActionResult.action.replace(/_/g, ' ')}`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions or outcome */}
          {!isComplete ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableActions.map((action) => {
                const Icon = ACTION_ICONS[action];
                const actionName = action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <Button
                    key={action}
                    onClick={() => performAction(action)}
                    disabled={actionInProgress}
                    className={cn(
                      'h-auto flex flex-col gap-2 py-3 transition-all',
                      ACTION_COLORS[action],
                      'text-white border-0'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{actionName}</span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-lg mb-4',
                outcome === 'victory' ? 'bg-green-500/20' : 'bg-red-500/20'
              )}>
                {outcome === 'victory' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-semibold">Success!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-semibold">Failed</span>
                  </>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4">
                {outcome === 'victory' ? encounter.winOutcome.dialogue : encounter.loseOutcome.dialogue}
              </p>
              
              {outcome === 'victory' && encounter.winOutcome.rewards && (
                <div className="flex justify-center gap-4 text-sm">
                  {encounter.winOutcome.rewards.tips > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">+{encounter.winOutcome.rewards.tips}</span>
                      <span className="text-muted-foreground">Tips</span>
                    </div>
                  )}
                  {encounter.winOutcome.rewards.experience > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">+{encounter.winOutcome.rewards.experience}</span>
                      <span className="text-muted-foreground">XP</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Round counter */}
      <div className="text-center text-sm text-muted-foreground">
        Round {context.roundsPassed}
      </div>
    </div>
  );
}