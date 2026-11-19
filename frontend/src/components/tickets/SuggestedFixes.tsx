import React, { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen } from 'lucide-react';
import { CATEGORY_LABELS, KnowledgeArticleItem } from '@helpdesk360/shared';
import { api } from '../../api/client';
import { useNetwork } from '../../context/NetworkContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

type SuggestedGuide = Pick<KnowledgeArticleItem, 'id' | 'title' | 'category'>;

interface SuggestedFixesProps {
  title: string;
  category: string;
  disabled: boolean;
}

export const SuggestedFixes: React.FC<SuggestedFixesProps> = ({ title, category, disabled }) => {
  const { isOnline } = useNetwork();
  const [selected, setSelected] = useState<SuggestedGuide | null>(null);
  const closeGuide = useCallback(() => setSelected(null), []);
  const ticketTitle = title.trim();

  const suggestions = useMutation({
    mutationFn: (input: { title: string; category: string }) =>
      api.post<{ articles: SuggestedGuide[] }>('/knowledge-base/suggestions', input),
  });
  const article = useQuery({
    queryKey: ['suggested-guide', selected?.id],
    queryFn: ({ signal }) =>
      api.get<{ article: KnowledgeArticleItem }>(`/knowledge-base/${selected!.id}`, { signal }),
    enabled: Boolean(selected),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  const hasCurrentSearch = suggestions.variables?.title === ticketTitle &&
    suggestions.variables.category === category;
  const guides = hasCurrentSearch ? suggestions.data?.articles : undefined;

  return (
    <section aria-labelledby="suggested-fixes-heading" className="space-y-3 rounded-lg border border-border bg-surface-muted p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <BookOpen aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <h2 id="suggested-fixes-heading" className="text-xs font-semibold text-text-primary">Suggested fixes</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Find troubleshooting guides using your ticket title.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !isOnline || ticketTitle.length < 3 || ticketTitle.length > 120}
          isLoading={suggestions.isPending}
          onClick={() => suggestions.mutate({ title: ticketTitle, category })}
        >
          {suggestions.isPending ? 'Finding fixes…' : 'Find fixes'}
        </Button>
      </div>

      <div role="status" className="text-xs text-text-secondary empty:hidden">
        {!isOnline && 'Guide search is available when you’re online.'}
        {isOnline && hasCurrentSearch && suggestions.isError && 'Couldn’t find guides right now. Try again or continue with your ticket.'}
        {isOnline && guides?.length === 0 && 'No matching guides. You can continue with your ticket.'}
        {isOnline && Boolean(guides?.length) && (
          <span className="sr-only">{guides?.length} matching guides found.</span>
        )}
      </div>

      {Boolean(guides?.length) && (
        <ul className="space-y-1.5">
          {guides?.map((guide) => (
            <li key={guide.id}>
              <button
                type="button"
                onClick={() => setSelected(guide)}
                disabled={disabled}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs text-text-primary hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
              >
                <span className="min-w-0 break-words font-medium">{guide.title}</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-brand" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <Modal isOpen onClose={closeGuide} title={selected.title} description={CATEGORY_LABELS[selected.category]} maxWidth="lg">
          <div role="status" className="text-xs text-text-secondary empty:hidden">
            {article.isPending && (isOnline ? 'Loading guide…' : 'Reconnect to load this guide.')}
            {article.isError && 'This guide is unavailable. You can return to your ticket.'}
          </div>
          {article.data && (
            <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary" tabIndex={0}>
              {article.data.article.content}
            </div>
          )}
          <div className="mt-4 flex justify-end border-t border-border pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={closeGuide}>Back to ticket</Button>
          </div>
        </Modal>
      )}
    </section>
  );
};
