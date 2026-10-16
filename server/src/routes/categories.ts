import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// Helper to generate slug
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Public: Get all active categories with item counts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { includeAll } = req.query;
    const where = includeAll === 'true' ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        itemCount: cat._count.items,
        createdAt: cat.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve categories.' });
  }
});

// Admin: Create category
router.post('/', requireAdmin, validateBody(categorySchema), async (req: Request, res: Response) => {
  try {
    const { name, description, sortOrder = 0, isActive = true } = req.body;
    let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    // Check duplicate slug
    let existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        sortOrder,
        isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (err: any) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, error: 'Failed to create category.' });
  }
});

// Admin: Update category
router.put('/:id', requireAdmin, validateBody(categorySchema.partial()), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, sortOrder, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    let updatedSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      updatedSlug = slugify(slug);
    } else if (name && !slug) {
      // keep existing slug unless explicitly altered
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug: updatedSlug }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (err: any) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, error: 'Failed to update category.' });
  }
});

// Admin: Delete category with safety check
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reassignToCategoryId } = req.body || {};

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    if (category._count.items > 0) {
      if (!reassignToCategoryId) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category "${category.name}" because it contains ${category._count.items} menu item(s). Reassign them first or provide reassignToCategoryId.`,
          itemCount: category._count.items,
        });
      }

      // Reassign items to target category
      await prisma.menuItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: reassignToCategoryId },
      });
    }

    await prisma.category.delete({ where: { id } });

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, error: 'Failed to delete category.' });
  }
});

export default router;
