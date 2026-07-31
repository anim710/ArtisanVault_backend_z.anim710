import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { CraftPiece } from '../models/CraftPiece';
import { AppError } from '../utils/errors';

export async function listReviews(craftId: string) {
  if (!Types.ObjectId.isValid(craftId)) {
    throw new AppError('Craft piece not found', 404);
  }

  return Review.find({ craftPiece: craftId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createReview(
  craftId: string,
  userId: string,
  input: { rating: number; comment: string }
) {
  if (!Types.ObjectId.isValid(craftId)) {
    throw new AppError('Craft piece not found', 404);
  }

  const craft = await CraftPiece.findById(craftId);
  if (!craft) {
    throw new AppError('Craft piece not found', 404);
  }

  const existing = await Review.findOne({ craftPiece: craftId, user: userId });
  if (existing) {
    throw new AppError('You already reviewed this craft piece', 409);
  }

  const review = await Review.create({
    craftPiece: craftId,
    user: userId,
    rating: input.rating,
    comment: input.comment,
  });

  const stats = await Review.aggregate([
    { $match: { craftPiece: new Types.ObjectId(craftId) } },
    {
      $group: {
        _id: '$craftPiece',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats[0]) {
    craft.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    craft.reviewCount = stats[0].reviewCount;
    await craft.save();
  }

  return review.populate('user', 'name email');
}
