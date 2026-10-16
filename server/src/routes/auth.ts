import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dastaan_heritage_secret_key_2026_super_secure';

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  isDefault: z.boolean().optional(),
});

// Register
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, token },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during sign in.' });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({ success: true, data: user });
  } catch (err: any) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, error: 'Server error fetching user profile.' });
  }
});

// Save address
router.post('/addresses', requireAuth, validateBody(addressSchema), async (req: Request, res: Response) => {
  try {
    const address = await prisma.address.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      data: address,
    });
  } catch (err: any) {
    console.error('Address creation error:', err);
    res.status(500).json({ success: false, error: 'Failed to save address.' });
  }
});

// Delete address
router.delete('/addresses/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const address = await prisma.address.findUnique({
      where: { id: req.params.id },
    });

    if (!address || address.userId !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Address not found or unauthorized.' });
    }

    await prisma.address.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Address removed successfully.' });
  } catch (err: any) {
    console.error('Address deletion error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete address.' });
  }
});

export default router;
