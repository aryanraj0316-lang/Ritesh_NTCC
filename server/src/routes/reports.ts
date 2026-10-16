import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { OrderStatus } from '@prisma/client';

const router = Router();

// Admin: Operational KPIs (Real-time dashboard metrics)
router.get('/kpis', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      ordersTodayCount,
      awaitingConfirmationCount,
      inPreparationCount,
      outForDeliveryCount,
      completedTodayCount,
      allOrders,
      recentOrders,
    ] = await Promise.all([
      // Orders placed today
      prisma.order.count({
        where: { createdAt: { gte: todayStart } },
      }),
      // Orders awaiting confirmation
      prisma.order.count({
        where: { currentStatus: OrderStatus.PLACED },
      }),
      // Orders being prepared
      prisma.order.count({
        where: { currentStatus: OrderStatus.PREPARING },
      }),
      // Orders out for delivery / ready
      prisma.order.count({
        where: {
          currentStatus: { in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.READY_FOR_PICKUP] },
        },
      }),
      // Orders completed today
      prisma.order.count({
        where: {
          currentStatus: OrderStatus.COMPLETED,
          createdAt: { gte: todayStart },
        },
      }),
      // All orders for revenue & AOV
      prisma.order.findMany({
        where: {
          currentStatus: { not: OrderStatus.CANCELLED },
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      }),
      // 5 most recent orders
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          items: true,
        },
      }),
    ]);

    // Calculate today's revenue (excluding cancelled)
    const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart);
    const todayRevenue = todayOrders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

    // Calculate lifetime revenue & AOV
    const totalRevenue = allOrders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const aov = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    res.json({
      success: true,
      data: {
        ordersTodayCount,
        awaitingConfirmationCount,
        inPreparationCount,
        outForDeliveryCount,
        completedTodayCount,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(aov * 100) / 100,
        recentOrders: recentOrders.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          taxAmount: Number(o.taxAmount),
          deliveryFee: Number(o.deliveryFee),
          discountAmount: Number(o.discountAmount),
          totalAmount: Number(o.totalAmount),
          items: o.items.map((i) => ({
            ...i,
            itemPrice: Number(i.itemPrice),
            subtotal: Number(i.subtotal),
          })),
        })),
      },
    });
  } catch (err: any) {
    console.error('Error fetching KPIs:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve operational KPIs.' });
  }
});

// Admin: Sales and trend analytics
router.get('/sales', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { days = '7' } = req.query;
    const daysNum = Math.max(1, parseInt(days as string, 10));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 1. Group revenue by day for Recharts
    const dayMap = new Map<string, { date: string; label: string; revenue: number; ordersCount: number }>();
    
    // Initialize day map with 0s for all days in range
    for (let i = 0; i <= daysNum; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dayMap.set(key, { date: key, label, revenue: 0, ordersCount: 0 });
    }

    // 2. Status distribution
    const statusCounts: Record<string, number> = {};

    // 3. Item sales frequency
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const ord of orders) {
      // Status count
      statusCounts[ord.currentStatus] = (statusCounts[ord.currentStatus] || 0) + 1;

      // Only count non-cancelled in revenue
      if (ord.currentStatus !== OrderStatus.CANCELLED) {
        const dateKey = ord.createdAt.toISOString().slice(0, 10);
        if (dayMap.has(dateKey)) {
          const entry = dayMap.get(dateKey)!;
          entry.revenue += Number(ord.totalAmount);
          entry.ordersCount += 1;
        }

        // Top items
        for (const item of ord.items) {
          if (!itemMap.has(item.itemName)) {
            itemMap.set(item.itemName, { name: item.itemName, quantity: 0, revenue: 0 });
          }
          const itemStats = itemMap.get(item.itemName)!;
          itemStats.quantity += item.quantity;
          itemStats.revenue += Number(item.subtotal);
        }
      }
    }

    const trend = Array.from(dayMap.values()).map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * 100) / 100,
    }));

    const topSellingDishes = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        trend,
        topSellingDishes,
        statusCounts,
        totalPeriodOrders: orders.length,
        totalPeriodRevenue: Math.round(
          orders
            .filter((o) => o.currentStatus !== OrderStatus.CANCELLED)
            .reduce((sum, o) => sum + Number(o.totalAmount), 0) * 100
        ) / 100,
      },
    });
  } catch (err: any) {
    console.error('Error fetching sales analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve sales reports.' });
  }
});

// Admin: Export orders to CSV
router.get('/export-csv', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    const headers = [
      'Order Number',
      'Date & Time',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Order Type',
      'Delivery Address',
      'Items Ordered',
      'Subtotal (INR)',
      'Tax 5% (INR)',
      'Delivery Fee (INR)',
      'Discount (INR)',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((i) => `${i.quantity}x ${i.itemName}`)
        .join('; ');

      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

      return [
        escape(o.orderNumber),
        escape(new Date(o.createdAt).toLocaleString('en-IN')),
        escape(o.customerName),
        escape(o.customerEmail),
        escape(o.customerPhone),
        escape(o.orderType),
        escape(o.deliveryAddress || 'N/A'),
        escape(itemsSummary),
        escape(Number(o.subtotal).toFixed(2)),
        escape(Number(o.taxAmount).toFixed(2)),
        escape(Number(o.deliveryFee).toFixed(2)),
        escape(Number(o.discountAmount).toFixed(2)),
        escape(Number(o.totalAmount).toFixed(2)),
        escape(o.paymentMethod),
        escape(o.paymentStatus),
        escape(o.currentStatus),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dastaan_orders_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('Error generating CSV:', err);
    res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
});

export default router;
