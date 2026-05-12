import { Router, Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service.js';

const router = Router();

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ status: 'error', message: 'Prompt payload is required.' });
      return;
    }

    const generatedText = await aiService.generateText(prompt);
    
    res.status(200).json({
      status: 'success',
      data: { result: generatedText },
    });
  } catch (error) {
    next(error);
  }
});

export default router;