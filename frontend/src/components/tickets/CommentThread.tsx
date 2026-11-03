import React, { useState } from 'react';
import { CommentItem } from '@helpdesk360/shared';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { Send, Lock, MessageSquare } from 'lucide-react';

export interface CommentThreadProps {
  comments: CommentItem[];
  onAddComment: (content: string, isInternal?: boolean) => Promise<void>;
  isSubmitting?: boolean;
  allowInternalNotes?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  isSubmitting = false,
  allowInternalNotes = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      setError(null);
      await onAddComment(newComment.trim(), allowInternalNotes ? isInternal : false);
      setNewComment('');
      setIsInternal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment.');
    }
  };

  const formatCommentDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' at ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="p-4 text-center text-xs text-text-muted bg-[#F7F8FA] rounded-lg border border-dashed border-border">
          No comments on this ticket yet.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isInternalNote = Boolean(c.isInternal);

            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-lg flex items-start gap-3 transition-colors ${
                  isInternalNote
                    ? 'bg-[#FFFAEB] border border-[#FEDF89]'
                    : 'bg-surface border border-border'
                }`}
              >
                <Avatar name={c.author?.name || 'User'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-text-primary">
                        {c.author?.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F2F4F7] text-text-muted">
                        {c.author?.role === 'ADMIN'
                          ? 'Admin'
                          : c.author?.role === 'TECHNICIAN'
                          ? 'Technician'
                          : 'Reporter'}
                      </span>
                      {isInternalNote && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF0C7] text-[#7A2E0E] border border-[#FEDF89]">
                          <Lock className="w-2.5 h-2.5" />
                          Internal Note
                        </span>
                      )}
                      {(c as any).isPendingSync && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FEF0C7] text-[#7A2E0E] border border-[#FEDF89]">
                          Pending sync
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted whitespace-nowrap">
                      {formatCommentDate(c.createdAt)}
                    </span>
                  </div>

                  {/* Safe plain text rendering preventing XSS */}
                  <p className="text-xs text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="pt-2 space-y-2">
        <TextArea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (error) setError(null);
          }}
          placeholder={
            isInternal
              ? 'Add an internal note visible only to technicians and administrators...'
              : 'Write a public reply to the ticket participants...'
          }
          error={error || undefined}
          maxLength={1000}
          showCharCount
          disabled={isSubmitting}
          className={isInternal ? 'border-[#FEDF89] bg-[#FFFAEB]/30' : ''}
        />

        <div className="flex items-center justify-between pt-1">
          {allowInternalNotes ? (
            <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-border text-[#F79009] focus:ring-[#F79009]"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#F79009]" />
                Private internal note (hidden from employee)
              </span>
            </label>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            variant={isInternal ? 'secondary' : 'primary'}
            size="sm"
            isLoading={isSubmitting}
            iconLeft={
              isInternal ? (
                <Lock className="w-3.5 h-3.5 text-[#B54708]" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )
            }
          >
            {isInternal ? 'Save internal note' : 'Post reply'}
          </Button>
        </div>
      </form>
    </div>
  );
};
