import React, { useState } from 'react';
import { CommentItem } from '@helpdesk360/shared';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { Send } from 'lucide-react';

export interface CommentThreadProps {
  comments: CommentItem[];
  onAddComment: (content: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  isSubmitting = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      setError(null);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment.');
    }
  };

  const formatCommentDate = (dateStr: string) => {
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
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-3.5 bg-surface border border-border rounded-lg flex items-start gap-3"
            >
              <Avatar name={c.author?.name || 'User'} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {c.author?.name}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F2F4F7] text-text-muted">
                      {c.author?.role === 'TECHNICIAN' ? 'Technician' : 'Reporter'}
                    </span>
                    {(c as any).isPendingSync && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#FEF0C7] text-[#7A2E0E] border border-[#FEDF89]">
                        Pending sync
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {formatCommentDate(c.createdAt)}
                  </span>
                </div>
                {/* Safe plain text rendering preventing XSS */}
                <p className="text-xs text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="pt-2">
        <TextArea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Write a message or internal note..."
          error={error || undefined}
          maxLength={1000}
          showCharCount
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            iconLeft={<Send className="w-3.5 h-3.5" />}
          >
            Post comment
          </Button>
        </div>
      </form>
    </div>
  );
};
