import { FilterQuery, Types } from 'mongoose';
import { CraftPiece, ICraftPiece, MATERIALS, CATEGORIES } from '../models/CraftPiece';
import { AppError } from '../utils/errors';

export interface CraftQuery {
  search?: string;
  material?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  customOrder?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CraftInput {
  title: string;
  shortDescription: string;
  fullDescription: string;
  artisanName: string;
  price: number;
  material: string;
  category: string;
  dimensions: string;
  leadTime: string;
  imageUrls: string[];
  customOrderAvailable?: boolean;
}

function buildFilter(query: CraftQuery): FilterQuery<ICraftPiece> {
  const filter: FilterQuery<ICraftPiece> = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.material && MATERIALS.includes(query.material as (typeof MATERIALS)[number])) {
    filter.material = query.material;
  }
  if (query.category && CATEGORIES.includes(query.category as (typeof CATEGORIES)[number])) {
    filter.category = query.category;
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.customOrder !== undefined) {
    filter.customOrderAvailable = query.customOrder;
  }

  return filter;
}

function buildSort(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'rating':
      return { averageRating: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

export async function listCrafts(query: CraftQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(24, Math.max(1, query.limit ?? 8));
  const filter = buildFilter(query);
  const sort = buildSort(query.sort);

  const [items, total] = await Promise.all([
    CraftPiece.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CraftPiece.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getCraftById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Craft piece not found', 404);
  }

  const craft = await CraftPiece.findById(id).lean();
  if (!craft) {
    throw new AppError('Craft piece not found', 404);
  }

  const related = await CraftPiece.find({
    _id: { $ne: craft._id },
    $or: [{ category: craft.category }, { material: craft.material }],
  })
    .limit(4)
    .sort({ averageRating: -1 })
    .lean();

  return { craft, related };
}

export async function createCraft(input: CraftInput, userId: string) {
  if (!MATERIALS.includes(input.material as (typeof MATERIALS)[number])) {
    throw new AppError('Invalid material', 400);
  }
  if (!CATEGORIES.includes(input.category as (typeof CATEGORIES)[number])) {
    throw new AppError('Invalid category', 400);
  }

  const craft = await CraftPiece.create({
    ...input,
    customOrderAvailable: input.customOrderAvailable ?? false,
    createdBy: new Types.ObjectId(userId),
  });

  return craft;
}

export async function updateCraft(
  id: string,
  input: Partial<CraftInput>,
  userId: string,
  role: string
) {
  const craft = await CraftPiece.findById(id);
  if (!craft) {
    throw new AppError('Craft piece not found', 404);
  }

  if (role !== 'admin' && craft.createdBy.toString() !== userId) {
    throw new AppError('Forbidden', 403);
  }

  Object.assign(craft, input);
  await craft.save();
  return craft;
}

export async function deleteCraft(id: string, userId: string, role: string) {
  const craft = await CraftPiece.findById(id);
  if (!craft) {
    throw new AppError('Craft piece not found', 404);
  }

  if (role !== 'admin' && craft.createdBy.toString() !== userId) {
    throw new AppError('Forbidden', 403);
  }

  await craft.deleteOne();
  return { deleted: true };
}

export async function listMine(userId: string, role: string) {
  const filter =
    role === 'admin' ? {} : { createdBy: new Types.ObjectId(userId) };
  return CraftPiece.find(filter).sort({ createdAt: -1 }).lean();
}
