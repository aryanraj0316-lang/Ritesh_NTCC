import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { OrderStatus } from '@prisma/client';

const router = Router();

// Admin: Get customer directory aggregated from real orders and registered users
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    // Fetch all orders to build customer directory
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        totalAmount: true,
        currentStatus: true,
        createdAt: true,
      },
    });

    // Aggregate by email or phone
    const customerMap = new Map<string, {
      key: string;
      userId: string | null;
      name: string;
      email: string;
      phone: string;
      totalOrders: number;
      completedOrders: number;
      totalSpent: number;
      lastOrderDate: Date;
      orders: any[];
    }>();

    for (const ord of orders) {
      const key = ord.customerEmail.toLowerCase();
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          key,
          userId: ord.userId,
          name: ord.customerName,
          email: ord.customerEmail,
          phone: ord.customerPhone,
          totalOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
          lastOrderDate: ord.createdAt,
          orders: [],
        });
      }

      const c = customerMap.get(key)!;
      c.totalOrders += 1;
      if (ord.currentStatus === OrderStatus.COMPLETED) {
        c.completedOrders += 1;
        c.totalSpent += Number(ord.totalAmount);
      }
      if (ord.createdAt > c.lastOrderDate) {
        c.lastOrderDate = ord.createdAt;
      }
      c.orders.push({
        id: ord.id,
        orderNumber: ord.orderNumber,
        totalAmount: Number(ord.totalAmount),
        currentStatus: ord.currentStatus,
        createdAt: ord.createdAt,
      });
    }

    let customerList = Array.from(customerMap.values());

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      customerList = customerList.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    // Sort by totalSpent descending (top customers first)
    customerList.sort((a, b) => b.totalSpent - a.totalSpent);

    res.json({
      success: true,
      count: customerList.length,
      data: customerList.map((c) => ({
        ...c,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve customers.' });
  }
});

export default router;
