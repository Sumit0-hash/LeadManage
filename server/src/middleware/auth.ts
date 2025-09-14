import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: string; 
      email: string; 
    };

    // Verify user still exists in database
    const { data: user, error } = await supabase.auth.admin.getUserById(decoded.userId);
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};