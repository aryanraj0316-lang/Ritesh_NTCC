import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const addonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Add-on name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  isRequired: z.boolean().optional(),
  maxSelection: z.number().int().optional(),
});

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than zero'),
  categoryId: z.string().min(1, 'Category is required'),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().min(1, 'A valid image URL or path is required'),
  prepTimeMinutes: z.number().int().positive().default(20),
  spiceLevel: z.number().int().min(1).max(4).default(1),
  calories: z.number().int().optional(),
  allergens: z.string().optional(),
  addons: z.array(addonSchema).optional(),
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Public: Get menu items with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, search, isVeg, isFeatured, sort, includeUnavailable } = req.query;

    const where: any = {};

    // Customer only sees available items unless admin explicitly requests all
    if (includeUnavailable !== 'true' || req.user?.role !== 'ADMIN') {
      where.isAvailable = true;
    }

    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    if (isVeg !== undefined) {
      where.isVeg = isVeg === 'true';
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        addons: true,
      },
    });

    res.json({
      success: true,
      count: items.length,
      data: items.map((item) => ({
        ...item,
        price: Number(item.price),
        addons: item.addons.map((a) => ({
          ...a,
          price: Number(a.price),
        })),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch menu items.' });
  }
});

// Public: Get single dish
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        addons: true,
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }

    res.json({
      success: true,
      data: {
        ...item,
        price: Number(item.price),
        addons: item.addons.map((a) => ({
          ...a,
          price: Number(a.price),
        })),
      },
    });
  } catch (err: any) {
    console.error('Error fetching menu item:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve menu item.' });
  }
});

// Admin: Create menu item
router.post('/', requireAdmin, validateBody(menuItemSchema), async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      isVeg,
      isAvailable,
      isFeatured,
      imageUrl,
      prepTimeMinutes,
      spiceLevel,
      calories,
      allergens,
      addons,
    } = req.body;

    let slug = slugify(name);
    const existing = await prisma.menuItem.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        slug,
        description,
        price,
        categoryId,
        isVeg,
        isAvailable,
        isFeatured,
        imageUrl,
        prepTimeMinutes,
        spiceLevel,
        calories,
        allergens,
        addons: addons && addons.length > 0 ? {
          create: addons.map((a: any) => ({
            name: a.name,
            price: a.price,
            isRequired: a.isRequired || false,
            maxSelection: a.maxSelection || 1,
          })),
        } : undefined,
      },
      include: {
        category: true,
        addons: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      data: {
        ...item,
        price: Number(item.price),
        addons: item.addons.map((a) => ({ ...a, price: Number(a.price) })),
      },
    });
  } catch (err: any) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ success: false, error: 'Failed to create menu item.' });
  }
});

// Admin: Update menu item
router.put('/:id', requireAdmin, validateBody(menuItemSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      isVeg,
      isAvailable,
      isFeatured,
      imageUrl,
      prepTimeMinutes,
      spiceLevel,
      calories,
      allergens,
      addons,
    } = req.body;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }

    // Update item and replace addons inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      if (addons) {
        await tx.menuItemAddon.deleteMany({ where: { menuItemId: id } });
      }

      return tx.menuItem.update({
        where: { id },
        data: {
          name,
          description,
          price,
          categoryId,
          isVeg,
          isAvailable,
          isFeatured,
          imageUrl,
          prepTimeMinutes,
          spiceLevel,
          calories,
          allergens,
          addons: addons && addons.length > 0 ? {
            create: addons.map((a: any) => ({
              name: a.name,
              price: a.price,
              isRequired: a.isRequired || false,
              maxSelection: a.maxSelection || 1,
            })),
          } : undefined,
        },
        include: {
          category: true,
          addons: true,
        },
      });
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully.',
      data: {
        ...updated,
        price: Number(updated.price),
        addons: updated.addons.map((a) => ({ ...a, price: Number(a.price) })),
      },
    });
  } catch (err: any) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ success: false, error: 'Failed to update menu item.' });
  }
});

// Admin: Toggle availability
router.patch('/:id/toggle-availability', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
      select: { id: true, name: true, isAvailable: true },
    });

    res.json({
      success: true,
      message: `"${updated.name}" is now ${updated.isAvailable ? 'available' : 'unavailable'}.`,
      data: updated,
    });
  } catch (err: any) {
    console.error('Error toggling availability:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle availability.' });
  }
});

// Admin: Delete menu item
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }

    // If item has past order history, soft disable to preserve historical references
    if (item._count.orderItems > 0) {
      await prisma.menuItem.update({
        where: { id },
        data: { isAvailable: false },
      });
      return res.json({
        success: true,
        message: `"${item.name}" has previous order history, so it has been archived and marked unavailable instead of permanently deleted.`,
      });
    }

    await prisma.menuItem.delete({ where: { id } });
    res.json({
      success: true,
      message: `Menu item "${item.name}" deleted successfully.`,
    });
  } catch (err: any) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ success: false, error: 'Failed to delete menu item.' });
  }
});

export default router;
