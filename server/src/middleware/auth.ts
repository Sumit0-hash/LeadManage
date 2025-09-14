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
    // Note: Ensure the cookie name here matches the one you set during login.
    // In previous discussions, it was 'token'. Here it is 'auth_token'.
    // I'll use 'auth_token' as per your provided code.
    const token = req.cookies.auth_token;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // 1. Verify your custom token with your own secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    // 2. Use the userId from the token to find the user in YOUR public 'users' table
    const { data: user, error } = await supabase
      .from('users') 
      .select('id, email')
      .eq('id', decoded.userId)
      .single();

    // 3. If there was an error or the user doesn't exist, the token is invalid
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token or user does not exist' });
      return;
    }

    // 4. Attach user information to the request and continue
    req.user = { id: user.id, email: user.email };
    next();

  } catch (error) {
    // This block catches errors from jwt.verify if the token is malformed or expired
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};