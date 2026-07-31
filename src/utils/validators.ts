import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const craftCreateSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(200),
  fullDescription: z.string().min(20).max(5000),
  artisanName: z.string().min(2).max(80),
  price: z.number().positive(),
  material: z.enum(['Walnut', 'Steel', 'Marble', 'Ceramic']),
  category: z.enum(['Tables', 'Seating', 'Lighting']),
  dimensions: z.string().min(2).max(120),
  leadTime: z.string().min(2).max(80),
  imageUrls: z.array(z.string().url()).min(1).max(8),
  customOrderAvailable: z.boolean().optional(),
});

export const craftUpdateSchema = craftCreateSchema.partial();

export const craftQuerySchema = z.object({
  search: z.string().optional(),
  material: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  customOrder: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});
