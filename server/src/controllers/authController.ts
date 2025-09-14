import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Helper function to generate the token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// --- START OF CORRECTION ---

// Create a single, shared cookie options object for consistency
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? process.env.BACKEND_DOMAIN : undefined,
};

// --- END OF CORRECTION ---

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      res.status(400).json({ error: 'Valid email and a password of at least 6 characters are required' });
      return;
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      // Check for a unique constraint violation or similar "user exists" error
      if (authError.message.includes('unique constraint')) {
        res.status(400).json({ error: 'User already exists with this email' });
      } else {
        res.status(400).json({ error: authError.message });
      }
      return;
    }
    
    if (!authData.user) {
        res.status(500).json({ error: 'Failed to create user' });
        return;
    }

    const token = generateToken(authData.user.id, email);


    res.cookie('auth_token', token, cookieOptions);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: authData.user.id, email: authData.user.email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(authData.user.id, email);

    // Use the same shared cookie options
    res.cookie('auth_token', token, cookieOptions);

    res.status(200).json({
      message: 'Login successful',
      user: { id: authData.user.id, email: authData.user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Use the shared options for clearing the cookie to ensure domain matches
    res.clearCookie('auth_token', { 
      domain: cookieOptions.domain, 
      path: '/' 
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};