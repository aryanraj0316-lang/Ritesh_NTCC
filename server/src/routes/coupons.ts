import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { DiscountType } from '@prisma/client';

const router = Router();

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().positive('Subtotal must be greater than zero'),
});

// Validate coupon code against an active cart subtotal
router.post('/validate', validateBody(validateCouponSchema), async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive promotional code.',
      });
    }

    const minAmount = Number(coupon.minOrderAmount);
    if (subtotal < minAmount) {
      return res.status(400).json({
        success: false,
        error: `This promotional code requires a minimum order value of ₹${minAmount.toFixed(2)}.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), subtotal);
    }

    res.json({
      success: true,
      message: `Promotional code "${coupon.code}" applied successfully!`,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ success: false, error: 'Server error validating coupon.' });
  }
});

// Admin: List all coupons
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: coupons.map((c) => ({
        ...c,
        discountValue: Number(c.discountValue),
        minOrderAmount: Number(c.minOrderAmount),
        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
      })),
    });
  } catch (err: any) {
    console.error('Error listing coupons:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve coupons.' });
  }
});

export default router;
