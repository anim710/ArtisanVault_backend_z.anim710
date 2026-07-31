import { Request, Response } from 'express';
import * as craftService from '../services/craft.service';
import { asyncHandler } from '../utils/errors';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await craftService.listCrafts(req.query as craftService.CraftQuery);
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const result = await craftService.getCraftById(req.params.id);
  res.json({ success: true, data: result });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const craft = await craftService.createCraft(req.body, req.user!.id);
  res.status(201).json({ success: true, data: { craft } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const craft = await craftService.updateCraft(
    req.params.id,
    req.body,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: { craft } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await craftService.deleteCraft(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: result });
});

export const manageMine = asyncHandler(async (req: Request, res: Response) => {
  const items = await craftService.listMine(req.user!.id, req.user!.role);
  res.json({ success: true, data: { items } });
});
