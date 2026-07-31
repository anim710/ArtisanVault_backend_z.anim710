import mongoose, { Document, Schema, Types } from 'mongoose';

export const MATERIALS = ['Walnut', 'Steel', 'Marble', 'Ceramic'] as const;
export const CATEGORIES = ['Tables', 'Seating', 'Lighting'] as const;

export type Material = (typeof MATERIALS)[number];
export type Category = (typeof CATEGORIES)[number];

export interface ICraftPiece extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  artisanName: string;
  price: number;
  material: Material;
  category: Category;
  dimensions: string;
  leadTime: string;
  imageUrls: string[];
  customOrderAvailable: boolean;
  averageRating: number;
  reviewCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const craftPieceSchema = new Schema<ICraftPiece>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
    fullDescription: { type: String, required: true, trim: true },
    artisanName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    material: { type: String, enum: MATERIALS, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    dimensions: { type: String, required: true, trim: true },
    leadTime: { type: String, required: true, trim: true },
    imageUrls: {
      type: [String],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: 'At least one image URL is required',
      },
    },
    customOrderAvailable: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

craftPieceSchema.index({ title: 'text', shortDescription: 'text', artisanName: 'text' });
craftPieceSchema.index({ material: 1, category: 1, price: 1 });

export const CraftPiece = mongoose.model<ICraftPiece>('CraftPiece', craftPieceSchema);
