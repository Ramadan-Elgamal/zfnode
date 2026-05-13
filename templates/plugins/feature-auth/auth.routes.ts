import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

const router = Router();

// Functional demonstration stubs - easily replace with DB persistence logic later
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Email and password fields are required.' });
      return;
    }

    const hashedPassword = await authService.hashPassword(password);
    // TODO: Save user to DB here
    const token = authService.generateToken('sample_user_id_123');

    res.status(201).json({ status: 'success', data: { token, email, passwordHash: hashedPassword } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    // Demonstration assertion loop
    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Missing access credentials.' });
      return;
    }

    const token = authService.generateToken('sample_user_id_123');

    res.status(200).json({ status: 'success', data: { token } });
  } catch (error) {
    next(error);
  }
});

export default router;