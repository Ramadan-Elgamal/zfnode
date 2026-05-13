import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized access: Missing Authentication Token', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_development_secret') as { id: string };
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Unauthorized access: Invalid or Expired Token', 401));
  }
};