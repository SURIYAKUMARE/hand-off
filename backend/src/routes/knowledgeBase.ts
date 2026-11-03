import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { CreateArticleSchema } from '@helpdesk360/shared';

const router = Router();

router.use(authenticate);

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

    if (!article) {
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
