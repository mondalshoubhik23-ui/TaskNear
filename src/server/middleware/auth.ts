import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../db/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'taskhop-super-secure-jwt-secret-key-production-ready';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  account_status: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function signToken(user: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.taskhop_token) {
      token = req.cookies.taskhop_token;
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }

    const user = await queryOne<AuthUser>(
      `SELECT id, email, name, role, account_status FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    if (user.account_status === 'suspended') {
      res.status(403).json({ error: 'Account has been suspended by trust & safety moderation.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Session expired or invalid. Please re-authenticate.' });
  }
}

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
