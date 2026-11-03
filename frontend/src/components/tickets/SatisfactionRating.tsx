import React, { useState } from 'react';
import { TicketFeedbackItem } from '@helpdesk360/shared';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';

export interface SatisfactionRatingProps {
  ticketId: string;
  initialFeedback?: TicketFeedbackItem | null;
  onFeedbackSubmitted?: () => void;
}

export const SatisfactionRating: React.FC<SatisfactionRatingProps> = ({
  ticketId,
  initialFeedback,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number>(initialFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState(initialFeedback?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(Boolean(initialFeedback));

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating (1 to 5).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post<{ success: boolean; feedback: TicketFeedbackItem }>(
        `/tickets/${ticketId}/feedback`,
        {
          rating,
          comment: comment.trim() || undefined,
        }
      );
      if (res.success) {
        setIsSubmitted(true);
        toast.success('Thank you for rating our resolution service!');
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit satisfaction feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 rounded-lg bg-[#ECFDF3] border border-[#A6F4C5] space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#027A48]">
          <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
          <span>Feedback Recorded</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating ? 'fill-[#F79009] text-[#F79009]' : 'text-border'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-text-primary ml-1.5">{rating} / 5</span>
        </div>
        {comment && (
          <p className="text-xs text-text-secondary italic bg-white/70 p-2.5 rounded border border-[#A6F4C5]">
            "{comment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-[#F9FAFB] border border-border space-y-3">
      <div>
        <h4 className="text-xs font-semibold text-text-primary">
          How satisfied are you with this resolution?
        </h4>
        <p className="text-[11px] text-text-muted mt-0.5">
          Your feedback helps us continuously improve IT support quality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-[#F79009] text-[#F79009]'
                    : 'text-border hover:text-text-muted'
                }`}
              />
            </button>
          ))}
          <span className="text-xs text-text-secondary font-medium ml-2">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </span>
        </div>

        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comments regarding your experience..."
          className="w-full text-xs p-2.5 rounded-md border border-border bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
        />

        <div className="flex justify-end">
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Submit rating
          </Button>
        </div>
      </form>
    </div>
  );
};
