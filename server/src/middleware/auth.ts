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

    const { data, error } = await supabase.auth.admin.getUserById(decoded.userId);

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid token or user does not exist' });
      return;
    }


    req.user = { id: data.user.id, email: data.user.email! };
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};