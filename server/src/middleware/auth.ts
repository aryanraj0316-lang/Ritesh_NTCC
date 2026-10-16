import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dastaan_heritage_secret_key_2026_super_secure';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Invalid or expired token, proceed without req.user
  }
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.',
    });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }
  if (req.user.role !== Role.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrative privileges required.',
    });
  }
  next();
};
