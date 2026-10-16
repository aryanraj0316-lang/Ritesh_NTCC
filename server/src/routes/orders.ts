import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, Role, DiscountType } from '@prisma/client';

const router = Router();

const orderItemInputSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  selectedAddons: z.array(z.string()).optional(), // Addon names or IDs
});

const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  orderType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  deliveryAddress: z.string().optional(),
  orderNotes: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'UPI_SIMULATED', 'CARD_SIMULATED']),
  paymentConfirmationRef: z.string().optional(), // For simulated gateway transaction reference
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
});

const updateStatusSchema = z.object({
  status: z.enum(['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

// Helper to generate unique order number: ORD-YYYYMMDD-XXXX
const generateOrderNumber = async (): Promise<string> => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await prisma.order.count();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${(count + 1).toString().padStart(3, '0')}${randomSuffix}`;
};

// 1. Create Order (Customer / Guest)
router.post('/', validateBody(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      deliveryAddress,
      orderNotes,
      couponCode,
      paymentMethod,
      paymentConfirmationRef,
      items: itemInputs,
    } = req.body;

    // Delivery requires address
    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return res.status(400).json({
        success: false,
        error: 'A complete delivery address is required for home delivery orders.',
      });
    }

    // 1. Fetch live menu items and addons from DB to calculate snapshot pricing
    const menuItemIds = itemInputs.map((i: any) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
      include: {
        addons: true,
      },
    });

    if (dbMenuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more items in your cart could not be found or are no longer on the menu.',
      });
    }

    // Check availability
    for (const item of dbMenuItems) {
      if (!item.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `We apologize, but "${item.name}" is currently unavailable today.`,
        });
      }
    }

    // 2. Compute exact subtotal on server (NEVER trust client total!)
    let calculatedSubtotal = 0;
    const preparedOrderItems: any[] = [];

    for (const input of itemInputs) {
      const dbItem = dbMenuItems.find((m) => m.id === input.menuItemId)!;
      let unitPrice = Number(dbItem.price);
      let selectedAddonSnapshots: { name: string; price: number }[] = [];

      if (input.selectedAddons && input.selectedAddons.length > 0) {
        for (const addonIdentifier of input.selectedAddons) {
          const matchedAddon = dbItem.addons.find(
            (a) => a.id === addonIdentifier || a.name.toLowerCase() === addonIdentifier.toLowerCase()
          );
          if (matchedAddon) {
            unitPrice += Number(matchedAddon.price);
            selectedAddonSnapshots.push({
              name: matchedAddon.name,
              price: Number(matchedAddon.price),
            });
          }
        }
      }

      const itemTotal = unitPrice * input.quantity;
      calculatedSubtotal += itemTotal;

      preparedOrderItems.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        itemPrice: unitPrice,
        quantity: input.quantity,
        subtotal: itemTotal,
        selectedAddons: selectedAddonSnapshots.length > 0 ? JSON.stringify(selectedAddonSnapshots) : null,
      });
    }

    // 3. Compute Coupon Discount
    let discountAmount = 0;
    let validCouponCode: string | null = null;
    if (couponCode && couponCode.trim()) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && calculatedSubtotal >= Number(coupon.minOrderAmount)) {
        validCouponCode = coupon.code;
        if (coupon.discountType === DiscountType.PERCENTAGE) {
          discountAmount = (calculatedSubtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
          }
        } else {
          discountAmount = Math.min(Number(coupon.discountValue), calculatedSubtotal);
        }
      }
    }

    // 4. Taxes & Delivery Fee
    // 5% GST (Standard Indian Restaurant Dining/Delivery Tax: 2.5% CGST + 2.5% SGST)
    const discountedSubtotal = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Math.round(discountedSubtotal * 0.05 * 100) / 100;
    
    // Free delivery above ₹999 for delivery orders, else ₹50
    const deliveryFee = orderType === 'DELIVERY' ? (calculatedSubtotal >= 999 ? 0 : 50) : 0;
    const totalAmount = Math.round((discountedSubtotal + taxAmount + deliveryFee) * 100) / 100;

    // 5. Payment details
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paymentMethod === 'UPI_SIMULATED' || paymentMethod === 'CARD_SIMULATED') {
      if (paymentConfirmationRef && paymentConfirmationRef.startsWith('PAY_SIM_')) {
        paymentStatus = PaymentStatus.PAID;
      }
    }

    const orderNumber = await generateOrderNumber();

    // Estimated delivery time: 35-45 mins from now
    const estimatedDeliveryTime = new Date(Date.now() + 40 * 60 * 1000);

    // 6. Database Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user?.id || null,
          customerName,
          customerEmail: customerEmail.toLowerCase(),
          customerPhone,
          orderType: orderType as OrderType,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : null,
          orderNotes: orderNotes || null,
          subtotal: calculatedSubtotal,
          taxAmount,
          deliveryFee,
          discountAmount,
          totalAmount,
          couponCode: validCouponCode,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus,
          currentStatus: OrderStatus.PLACED,
          estimatedDeliveryTime,
          items: {
            create: preparedOrderItems.map((item) => ({
              menuItemId: item.menuItemId,
              itemName: item.itemName,
              itemPrice: item.itemPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
              selectedAddons: item.selectedAddons,
            })),
          },
          statusHistory: {
            create: {
              status: OrderStatus.PLACED,
              notes: `Order placed (${orderType}). Payment: ${paymentMethod} (${paymentStatus})`,
              changedBy: req.user ? 'CUSTOMER' : 'GUEST',
            },
          },
        },
        include: {
          items: true,
          statusHistory: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! The culinary team is reviewing your preparation.',
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        deliveryFee: Number(order.deliveryFee),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((i) => ({
          ...i,
          itemPrice: Number(i.itemPrice),
          subtotal: Number(i.subtotal),
          selectedAddons: i.selectedAddons ? JSON.parse(i.selectedAddons) : [],
        })),
      },
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'Server error creating order.' });
  }
});

// 2. Track order by orderNumber (Accessible to customer or guest with their orderNumber)
router.get('/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, imageUrl: true, isVeg: true },
            },
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order "${orderNumber}" not found. Please verify the order number.`,
      });
    }

    // If order has an owner and logged-in user is different non-admin, restrict full customer details
    const isOwner = req.user && order.userId === req.user.id;
    const isAdmin = req.user?.role === Role.ADMIN;
    if (order.userId && !isOwner && !isAdmin && req.user) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this customer order.',
      });
    }

    res.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        deliveryFee: Number(order.deliveryFee),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((i) => ({
          ...i,
          itemPrice: Number(i.itemPrice),
          subtotal: Number(i.subtotal),
          selectedAddons: i.selectedAddons ? JSON.parse(i.selectedAddons) : [],
        })),
      },
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    res.status(500).json({ success: false, error: 'Server error retrieving order status.' });
  }
});

// 3. Customer: My Orders history
router.get('/my-orders', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      data: orders.map((o) => ({
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
          selectedAddons: i.selectedAddons ? JSON.parse(i.selectedAddons) : [],
        })),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch order history.' });
  }
});

// 4. Admin: List orders with filters, search, sorting, and pagination
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, orderType, search, startDate, endDate, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.currentStatus = status as OrderStatus;
    }

    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType as OrderType;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    const [totalCount, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
          statusHistory: {
            orderBy: { timestamp: 'desc' },
            take: 3,
          },
        },
      }),
    ]);

    res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      data: orders.map((o) => ({
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
          selectedAddons: i.selectedAddons ? JSON.parse(i.selectedAddons) : [],
        })),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
  }
});

// 5. Admin: Single Order details
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    res.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        deliveryFee: Number(order.deliveryFee),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((i) => ({
          ...i,
          itemPrice: Number(i.itemPrice),
          subtotal: Number(i.subtotal),
          selectedAddons: i.selectedAddons ? JSON.parse(i.selectedAddons) : [],
        })),
      },
    });
  } catch (err: any) {
    console.error('Error fetching single order:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve order details.' });
  }
});

// 6. Admin: Change order status with state machine validation
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

router.patch('/:id/status', requireAdmin, validateBody(updateStatusSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, notes } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.currentStatus === targetStatus) {
      return res.json({ success: true, message: 'Status is already updated.', data: order });
    }

    const allowedTransitions = VALID_TRANSITIONS[order.currentStatus];
    if (!allowedTransitions.includes(targetStatus as OrderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition order directly from ${order.currentStatus} to ${targetStatus}. Allowed transitions: ${allowedTransitions.join(', ') || 'None (terminal state)'}.`,
      });
    }

    // Auto update payment if completed on COD
    const paymentUpdate: any = {};
    if (targetStatus === OrderStatus.COMPLETED && order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      paymentUpdate.paymentStatus = PaymentStatus.PAID;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          currentStatus: targetStatus as OrderStatus,
          ...paymentUpdate,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: targetStatus as OrderStatus,
          notes: notes || `Order advanced to ${targetStatus}`,
          changedBy: 'ADMIN',
        },
      });

      return ord;
    });

    res.json({
      success: true,
      message: `Order status successfully transitioned to ${targetStatus}.`,
      data: updated,
    });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, error: 'Failed to update order status.' });
  }
});

// 7. Cancel order (Customer or Admin)
router.post('/:id/cancel', validateBody(cancelOrderSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const isCustomerOwner = req.user && order.userId === req.user.id;
    const isAdmin = req.user?.role === Role.ADMIN;

    if (!isCustomerOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order.' });
    }

    // Customers can only cancel if still in PLACED or CONFIRMED state (not once cooking starts)
    if (!isAdmin && order.currentStatus !== OrderStatus.PLACED && order.currentStatus !== OrderStatus.CONFIRMED) {
      return res.status(400).json({
        success: false,
        error: `This order cannot be cancelled because the kitchen is already actively ${order.currentStatus.toLowerCase()}. Please contact the restaurant directly.`,
      });
    }

    if (order.currentStatus === OrderStatus.COMPLETED || order.currentStatus === OrderStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: `Order is already ${order.currentStatus.toLowerCase()}.`,
      });
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          currentStatus: OrderStatus.CANCELLED,
          cancellationReason: reason,
          ...(order.paymentStatus === PaymentStatus.PAID && { paymentStatus: PaymentStatus.REFUNDED }),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          notes: `Cancelled by ${isAdmin ? 'ADMIN' : 'CUSTOMER'}. Reason: ${reason}`,
          changedBy: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
      });

      return updated;
    });

    res.json({
      success: true,
      message: 'Order was successfully cancelled.',
      data: cancelledOrder,
    });
  } catch (err: any) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel order.' });
  }
});

export default router;
