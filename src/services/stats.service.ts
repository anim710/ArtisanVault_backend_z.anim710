import { Types } from 'mongoose';
import { CraftPiece } from '../models/CraftPiece';
import { User } from '../models/User';
import { Review } from '../models/Review';

export async function getOverviewStats(userId?: string, role?: string) {
  const craftFilter =
    role === 'admin' || !userId
      ? {}
      : { createdBy: new Types.ObjectId(userId) };

  const [
    totalCrafts,
    totalUsers,
    totalReviews,
    byMaterial,
    byCategory,
    priceBands,
    recentCrafts,
  ] = await Promise.all([
    CraftPiece.countDocuments(craftFilter),
    User.countDocuments(),
    Review.countDocuments(),
    CraftPiece.aggregate([
      { $match: craftFilter },
      { $group: { _id: '$material', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    CraftPiece.aggregate([
      { $match: craftFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    CraftPiece.aggregate([
      { $match: craftFilter },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 500, 1500, 3000, 6000, 20000],
          default: '20000+',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    CraftPiece.find(craftFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price material category averageRating createdAt')
      .lean(),
  ]);

  const avgPriceResult = await CraftPiece.aggregate([
    { $match: craftFilter },
    { $group: { _id: null, avgPrice: { $avg: '$price' } } },
  ]);

  return {
    totals: {
      crafts: totalCrafts,
      users: totalUsers,
      reviews: totalReviews,
      averagePrice: Math.round(avgPriceResult[0]?.avgPrice ?? 0),
    },
    byMaterial: byMaterial.map((m) => ({ material: m._id, count: m.count })),
    byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    priceBands: priceBands.map((b) => ({
      range: String(b._id),
      count: b.count,
    })),
    recentCrafts,
  };
}
