import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { CreateArticleSchema, CreateTicketInput, CreateTicketSchema } from '@helpdesk360/shared';

const router = Router();
const SuggestArticlesSchema = CreateTicketSchema.pick({ title: true, category: true });

const commonWords = new Set([
  'about', 'after', 'and', 'are', 'for', 'from', 'help', 'how', 'issue', 'need',
  'please', 'problem', 'the', 'this', 'unable', 'when', 'with', 'working',
]);

function articleKeywords(text: string): string[] {
  return (text.toLowerCase().replace(/\bwi[-‐‑\s]?fi\b/g, 'wifi').match(/[\p{L}\p{N}]+/gu) ?? [])
    .map((word) => word.length > 4 ? word.replace(/s$/, '') : word)
    .filter((word) => word.length >= 3 && !commonWords.has(word));
}

router.use(authenticate);

router.post('/suggestions', validateBody(SuggestArticlesSchema), async (req, res, next) => {
  try {
    const { title, category } = req.body as Pick<CreateTicketInput, 'title' | 'category'>;
    const keywords = [...new Set(articleKeywords(title))];
    res.set('Cache-Control', 'no-store');

    if (keywords.length === 0) {
      return res.json({ success: true, articles: [] });
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, category: true, views: true },
    });

    const suggestions = articles
      .map((article) => {
        const articleWords = new Set(articleKeywords(article.title));
        const matches = keywords.filter((word) => articleWords.has(word)).length;
        return { article, matches };
      })
      .filter(({ matches }) => matches > 0)
      .sort((a, b) => b.matches - a.matches ||
        Number(b.article.category === category) - Number(a.article.category === category) ||
        b.article.views - a.article.views || a.article.id.localeCompare(b.article.id))
      .slice(0, 3)
      .map(({ article: { id, title, category } }) => ({ id, title, category }));

    return res.json({ success: true, articles: suggestions });
  } catch (error) {
    next(error);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const title = String(req.query.title || '');
    const category = req.query.category ? String(req.query.category) : undefined;
    const keywords = [...new Set(articleKeywords(title))];
    res.set('Cache-Control', 'no-store');

    if (keywords.length === 0) {
      return res.json({ success: true, articles: [] });
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, category: true, views: true },
    });

    const suggestions = articles
      .map((article) => {
        const articleWords = new Set(articleKeywords(article.title));
        const matches = keywords.filter((word) => articleWords.has(word)).length;
        return { article, matches };
      })
      .filter(({ matches }) => matches > 0)
      .sort((a, b) => b.matches - a.matches ||
        Number(b.article.category === category) - Number(a.article.category === category) ||
        b.article.views - a.article.views || a.article.id.localeCompare(b.article.id))
      .slice(0, 3)
      .map(({ article: { id, title, category } }) => ({ id, title, category }));

    return res.json({ success: true, articles: suggestions });
  } catch (error) {
    next(error);
  }
});

// 1. Search / List Articles
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query as any;

    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { views: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      success: true,
      articles,
    });
  } catch (error) {
    next(error);
  }
});

// 2. Read Article & Increment Views
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!article || (!article.isPublished && req.user!.role === 'EMPLOYEE')) {
      throw new AppError('Article not found.', 404);
    }

    // Increment view count asynchronously
    prisma.knowledgeArticle.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return res.json({
      success: true,
      article,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Create Article (Admin & Technician)
router.post('/', requireRole(['ADMIN', 'TECHNICIAN']), validateBody(CreateArticleSchema), async (req, res, next) => {
  try {
    const { title, category, content, isPublished } = req.body;

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        category,
        content,
        isPublished: isPublished ?? true,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      success: true,
      article,
      message: 'Article published to knowledge base.',
    });
  } catch (error) {
    next(error);
  }
});

// 4. Update Article
router.patch('/:id', requireRole(['ADMIN', 'TECHNICIAN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, content, isPublished } = req.body;

    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        title,
        category,
        content,
        isPublished,
      },
    });

    return res.json({
      success: true,
      article: updated,
      message: 'Article updated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
