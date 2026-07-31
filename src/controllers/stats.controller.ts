import { Request, Response } from 'express';
import * as statsService from '../services/stats.service';
import { asyncHandler } from '../utils/errors';

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const stats = await statsService.getOverviewStats(req.user?.id, req.user?.role);
  res.json({ success: true, data: stats });
});
