import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { KnowledgeArticleItem } from '@helpdesk360/shared';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  ThumbsUp,
  Tag,
  Loader2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticleItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'HARDWARE',
    summary: '',
    content: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (categoryFilter !== 'ALL') queryParams.set('category', categoryFilter);

      const res = await api.get<{ success: boolean; articles: KnowledgeArticleItem[] }>(
        `/knowledge-base?${queryParams.toString()}`
      );
      if (res.success) {
        setArticles(res.articles);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load knowledge articles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenArticle = async (article: KnowledgeArticleItem) => {
    setSelectedArticle(article);
    try {
      // Increments view count
      await api.get(`/knowledge-base/${article.id}`);
    } catch {
      // ignore
    }
  };

  const handleVoteHelpful = async (articleId: string) => {
    try {
      const res = await api.post<{ success: boolean; helpfulCount: number }>(
        `/knowledge-base/${articleId}/helpful`
      );
      if (res.success) {
        toast.success('Thank you for your feedback!');
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, helpfulCount: res.helpfulCount } : a))
        );
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle({ ...selectedArticle, helpfulCount: res.helpfulCount });
        }
      }
    } catch (err: any) {
      toast.error('Failed to submit vote.');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post<{ success: boolean; article: KnowledgeArticleItem }>(
        '/knowledge-base',
        {
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        }
      );
      if (res.success) {
        toast.success('Knowledge base article published.');
        setIsCreateModalOpen(false);
        setFormData({ title: '', category: 'HARDWARE', summary: '', content: '', tags: '' });
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish article.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Articles' },
    { id: 'HARDWARE', label: 'Hardware' },
    { id: 'NETWORK', label: 'Network & VPN' },
    { id: 'SOFTWARE', label: 'Software & SaaS' },
    { id: 'ACCOUNT_ACCESS', label: 'Account & Security' },
    { id: 'GENERAL_IT', label: 'General IT' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="IT Knowledge Base & Solutions"
          subtitle="Self-service troubleshooting guides, official configuration SOPs, and system playbooks."
          breadcrumbs={[{ label: 'Knowledge Base' }]}
        />
        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            iconLeft={<Plus className="w-3.5 h-3.5" />}
          >
            Create article
          </Button>
        )}
      </div>

      {/* Search Header */}
      <div className="p-6 rounded-lg border border-border bg-surface text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-base font-bold text-text-primary">How can IT support help you today?</h2>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search knowledge base (e.g. VPN setup, password reset, Wi-Fi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <Button variant="primary" size="sm" type="submit">
            Search
          </Button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === c.id
                ? 'bg-brand text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:bg-[#F2F4F7]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading helpful articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-lg bg-surface">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-text-primary">No articles found</p>
          <p className="text-xs text-text-muted mt-1">Try a different search keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => handleOpenArticle(art)}
              className="p-5 rounded-lg border border-border bg-surface hover:border-brand/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
                  <span className="font-semibold text-brand tracking-wider uppercase">
                    {art.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {art.viewCount ?? art.views ?? 0}
                    </span>
                    <span className="flex items-center gap-1 text-[#027A48]">
                      <ThumbsUp className="w-3 h-3" /> {art.helpfulCount ?? 0}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  {art.summary || art.content}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-[11px] text-text-muted">
                <span>By {art.author.name}</span>
                <span className="text-brand font-medium group-hover:underline flex items-center gap-1">
                  Read article <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <Modal
          isOpen={Boolean(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
          title={selectedArticle.title}
          description={`Published in ${selectedArticle.category.replace('_', ' ')} by ${
            selectedArticle.author.name
          }`}
        >
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none text-text-secondary text-xs leading-relaxed whitespace-pre-wrap bg-[#F9FAFB] p-4 rounded-lg border border-border">
              {selectedArticle.content}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-text-muted">Did you find this guide helpful?</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleVoteHelpful(selectedArticle.id)}
                iconLeft={<ThumbsUp className="w-3.5 h-3.5 text-[#027A48]" />}
              >
                Helpful ({selectedArticle.helpfulCount ?? 0})
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Article Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Knowledge Base Article"
        description="Share official IT troubleshooting steps with employees."
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <TextInput
            label="Article Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. How to connect to Corporate GlobalProtect VPN"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="HARDWARE">Hardware</option>
                <option value="NETWORK">Network & VPN</option>
                <option value="SOFTWARE">Software & SaaS</option>
                <option value="ACCOUNT_ACCESS">Account & Security</option>
                <option value="GENERAL_IT">General IT</option>
              </select>
            </div>

            <TextInput
              label="Search Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="vpn, remote, network, wifi"
            />
          </div>

          <TextInput
            label="Brief Summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="One-sentence executive summary..."
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Article Content (Step-by-step instructions)
            </label>
            <textarea
              rows={8}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="1. Open your browser and navigate to...&#10;2. Enter your single sign-on credentials...&#10;3. Click Approve on your MFA prompt..."
              className="w-full text-xs p-3 rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Publish article
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
