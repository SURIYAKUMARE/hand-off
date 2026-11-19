import React, { useState } from 'react';
import { Sparkles, Check, AlertTriangle, ArrowRight, Wrench, UserCheck, HelpCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { CATEGORY_LABELS, PRIORITY_CONFIG } from '@helpdesk360/shared';

interface AISuggestion {
  category: 'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  isUrgentIncident: boolean;
  suggestedAction: string;
  explanation: string;
  suggestedArticles: Array<{
    id: string;
    title: string;
    category: string;
    contentPreview: string;
  }>;
  recommendedTechnician: {
    id: string;
    name: string;
    specialization: string;
    activeWorkload: number;
  } | null;
}

interface AIAssistantCardProps {
  title: string;
  description: string;
  currentCategory: string;
  currentPriority: string;
  onApplyCategory: (cat: string) => void;
  onApplyPriority: (prio: string) => void;
  disabled?: boolean;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({
  title,
  description,
  currentCategory,
  currentPriority,
  onApplyCategory,
  onApplyPriority,
  disabled = false,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [urgentConfirmed, setUrgentConfirmed] = useState(false);
  const toast = useToast();

  const handleAnalyze = async () => {
    if (!title.trim() && !description.trim()) {
      toast.info('Enter a title or issue description first to run AI categorization.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await api.post<{ success: boolean; suggestion: AISuggestion }>('/tickets/ai-suggest', {
        title: title.trim(),
        description: description.trim(),
      });

      if (res.success && res.suggestion) {
        setSuggestion(res.suggestion);
        setUrgentConfirmed(false);
        toast.success('AI classification complete. Review suggested settings below.');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI categorization unavailable. You can continue submitting manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAll = () => {
    if (!suggestion) return;
    if (suggestion.priority === 'URGENT' && !urgentConfirmed) {
      setUrgentConfirmed(true);
      return;
    }
    onApplyCategory(suggestion.category);
    onApplyPriority(suggestion.priority);
    toast.success(`Applied ${CATEGORY_LABELS[suggestion.category]} and ${suggestion.priority} priority.`);
  };

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              AI Ticket Smart Assistant
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                Categorization & Triage
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">
              Auto-detect category, urgency level, self-service solutions, and specialist technician.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          disabled={disabled || (!title.trim() && !description.trim())}
          className="border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-medium"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
          {suggestion ? 'Re-analyze' : 'Analyze with AI'}
        </Button>
      </div>

      {suggestion && (
        <div className="rounded-lg border border-blue-200/80 bg-white p-3.5 space-y-3 animate-fade-in text-xs">
          {/* Category & Priority Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-text-secondary">Suggested Triage:</span>

            {/* Category Chip */}
            <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-800 font-medium">
              <span>Category: <strong>{CATEGORY_LABELS[suggestion.category]}</strong></span>
              {currentCategory === suggestion.category ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold ml-1">
                  <Check className="h-3 w-3" /> Selected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onApplyCategory(suggestion.category)}
                  className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-blue-700 transition-colors ml-1 cursor-pointer"
                >
                  Apply
                </button>
              )}
            </div>

            {/* Priority Chip */}
            <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-800 font-medium">
              <span>Priority: <strong>{PRIORITY_CONFIG[suggestion.priority].label}</strong></span>
              {currentPriority === suggestion.priority ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold ml-1">
                  <Check className="h-3 w-3" /> Selected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onApplyPriority(suggestion.priority)}
                  className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-blue-700 transition-colors ml-1 cursor-pointer"
                >
                  Apply
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyAll}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Apply both &rarr;
            </button>
          </div>

          {/* Urgent Warning Confirmation Prompt */}
          {suggestion.priority === 'URGENT' && !urgentConfirmed && currentPriority !== 'URGENT' && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-red-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>Urgent Priority Recommended</span>
              </div>
              <p className="text-[11px] text-red-700">
                The AI detected critical operational impact or tight time constraints. Urgent tickets trigger immediate escalation to on-call IT technicians and enforce a 4-hour SLA resolution policy.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUrgentConfirmed(true);
                    onApplyPriority('URGENT');
                    toast.warning('Ticket priority escalated to Urgent.');
                  }}
                  className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
                >
                  Confirm Urgent Priority
                </button>
                <button
                  type="button"
                  onClick={() => setUrgentConfirmed(true)}
                  className="text-[11px] text-red-700 hover:underline"
                >
                  Keep current priority
                </button>
              </div>
            </div>
          )}

          {/* Suggested Troubleshooting Action */}
          <div className="rounded-md border border-slate-200/80 bg-slate-50/70 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Wrench className="h-3.5 w-3.5 text-blue-600" />
              <span>Recommended Quick Action</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {suggestion.suggestedAction}
            </p>
          </div>

          {/* AI Explanation & Match Reason */}
          <div className="flex items-start gap-1.5 text-[11px] text-text-muted">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Rationale:</strong> {suggestion.explanation}
              {suggestion.recommendedTechnician && (
                <span className="block mt-0.5 text-slate-600">
                  <UserCheck className="inline h-3 w-3 text-emerald-600 mr-1" />
                  Estimated Auto-Assignee: <strong>{suggestion.recommendedTechnician.name}</strong> ({suggestion.recommendedTechnician.specialization} specialist • {suggestion.recommendedTechnician.activeWorkload} active tickets).
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
