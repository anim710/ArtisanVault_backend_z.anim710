import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { asyncHandler } from '../utils/errors';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await reviewService.listReviews(req.params.craftId);
  res.json({ success: true, data: { reviews } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(
    req.params.craftId,
    req.user!.id,
    req.body
  );
  res.status(201).json({ success: true, data: { review } });
});
