import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { CraftPiece } from '../models/CraftPiece';
import { Review } from '../models/Review';

const craftSeed = [
  {
    title: 'Cascade Live-Edge Dining Table',
    shortDescription: 'Solid American walnut slab with steel trestle base.',
    fullDescription:
      'Hand-selected American walnut live-edge slab finished with a food-safe oil blend. The blackened steel trestle base is forged and welded in-house, then sealed with a matte clear coat. Seats eight comfortably and ships in two crates with white-glove assembly available.',
    artisanName: 'Mara Ellison',
    price: 4800,
    material: 'Walnut' as const,
    category: 'Tables' as const,
    dimensions: '96" L × 40" W × 30" H',
    leadTime: '6–8 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80',
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&q=80',
    ],
    customOrderAvailable: true,
  },
  {
    title: 'Forge Lounge Chair',
    shortDescription: 'Hand-forged steel frame with walnut armrests and leather seat.',
    fullDescription:
      'A sculptural lounge chair balancing industrial steel with warm walnut. The seat and back are upholstered in vegetable-tanned leather. Each frame is heat-patina finished uniquely, so no two chairs are identical.',
    artisanName: 'Jonah Reed',
    price: 2100,
    material: 'Steel' as const,
    category: 'Seating' as const,
    dimensions: '28" W × 32" D × 34" H',
    leadTime: '4–5 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80',
    ],
    customOrderAvailable: true,
  },
  {
    title: 'Lumen Pendant — Marble Disk',
    shortDescription: 'Carrara marble diffuser with brushed steel canopy.',
    fullDescription:
      'A floating disk of Carrara marble houses a warm LED module. The brushed steel canopy and suspension cables keep the silhouette clean. Dimmer compatible and UL listed for residential ceilings.',
    artisanName: 'Sofia Park',
    price: 890,
    material: 'Marble' as const,
    category: 'Lighting' as const,
    dimensions: '18" diameter × 3" thick',
    leadTime: '3 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1524484482812-2c4e045749cf?w=1200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&q=80',
    ],
    customOrderAvailable: false,
  },
  {
    title: 'Kiln Nest Side Table',
    shortDescription: 'Stoneware ceramic base with walnut top.',
    fullDescription:
      'Thrown and glazed ceramic pedestal fired to cone 10, topped with a circular walnut disc. The glaze runs from charcoal to warm sand, making each piece a one-of-one. Ideal as a sofa-side or entry accent.',
    artisanName: 'Elena Voss',
    price: 640,
    material: 'Ceramic' as const,
    category: 'Tables' as const,
    dimensions: '18" diameter × 22" H',
    leadTime: '2–3 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
    ],
    customOrderAvailable: true,
  },
  {
    title: 'Ridge Bench',
    shortDescription: 'Thick walnut slab seat on solid steel sled legs.',
    fullDescription:
      'A foyer or dining bench milled from a single walnut board. Steel sled legs are powder-coated charcoal and bolted through with brass hardware. Available in custom lengths for entryways and dining alcoves.',
    artisanName: 'Mara Ellison',
    price: 1650,
    material: 'Walnut' as const,
    category: 'Seating' as const,
    dimensions: '60" L × 14" D × 18" H',
    leadTime: '4 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=80',
    ],
    customOrderAvailable: true,
  },
  {
    title: 'Arc Floor Lamp',
    shortDescription: 'Forged steel arc with ceramic shade.',
    fullDescription:
      'A hand-bent steel arc lamp with a weighted marble base and hand-thrown ceramic shade. The shade interior is glazed warm sand to soften the light. Cord is fabric-wrapped in charcoal.',
    artisanName: 'Jonah Reed',
    price: 1180,
    material: 'Steel' as const,
    category: 'Lighting' as const,
    dimensions: '72" arc reach × 78" H',
    leadTime: '5 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1507473885765-e6ed557fef46?w=1200&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200&q=80',
    ],
    customOrderAvailable: false,
  },
  {
    title: 'Carrara Console',
    shortDescription: 'Honed marble top on walnut trestle.',
    fullDescription:
      'A narrow console for halls and galleries. Honed Carrara marble sits on a walnut trestle with brass joinery. Edges are eased by hand; the marble is sealed for everyday use.',
    artisanName: 'Sofia Park',
    price: 3200,
    material: 'Marble' as const,
    category: 'Tables' as const,
    dimensions: '54" L × 14" D × 32" H',
    leadTime: '7 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=80',
    ],
    customOrderAvailable: true,
  },
  {
    title: 'Ember Ceramic Sconce Pair',
    shortDescription: 'Wall sconces in matte charcoal glaze.',
    fullDescription:
      'A pair of wall-mounted ceramic sconces designed to cast soft uplight. Each shade is thrown, trimmed, and glazed in deep charcoal with a warm sand interior. Hardwired; includes mounting plates.',
    artisanName: 'Elena Voss',
    price: 520,
    material: 'Ceramic' as const,
    category: 'Lighting' as const,
    dimensions: '8" W × 5" D × 10" H each',
    leadTime: '2 weeks',
    imageUrls: [
      'https://images.unsplash.com/photo-1565814329452-141aa6817ce1?w=1200&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=1200&q=80',
    ],
    customOrderAvailable: false,
  },
];

export async function seedDatabase(force = false): Promise<void> {
  const userCount = await User.countDocuments();
  const craftCount = await CraftPiece.countDocuments();

  if (!force && userCount > 0 && craftCount > 0) {
    console.log('Seed skipped — data already present');
    return;
  }

  if (force) {
    await Promise.all([
      Review.deleteMany({}),
      CraftPiece.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  const passwordHash = await bcrypt.hash('Artisan@123', 12);
  const adminHash = await bcrypt.hash('Admin@123', 12);

  const [admin, artisan, buyer] = await User.create([
    {
      name: 'Vault Admin',
      email: 'admin@artisanvault.com',
      passwordHash: adminHash,
      role: 'admin',
    },
    {
      name: 'Mara Ellison',
      email: 'artisan@artisanvault.com',
      passwordHash,
      role: 'user',
    },
    {
      name: 'Casey Buyer',
      email: 'buyer@artisanvault.com',
      passwordHash,
      role: 'user',
    },
  ]);

  const crafts = await CraftPiece.insertMany(
    craftSeed.map((c, i) => ({
      ...c,
      createdBy: i % 2 === 0 ? artisan._id : admin._id,
      averageRating: 0,
      reviewCount: 0,
    }))
  );

  const reviewPayloads = [
    {
      craftPiece: crafts[0]._id,
      user: buyer._id,
      rating: 5,
      comment: 'Exceptional slab selection and flawless finish. Worth the wait.',
    },
    {
      craftPiece: crafts[1]._id,
      user: buyer._id,
      rating: 4,
      comment: 'Comfortable and striking. Leather softened nicely after two weeks.',
    },
    {
      craftPiece: crafts[2]._id,
      user: artisan._id,
      rating: 5,
      comment: 'Clean install and beautiful warm light. Guests always ask about it.',
    },
  ];

  await Review.insertMany(reviewPayloads);

  for (const craft of crafts) {
    const reviews = await Review.find({ craftPiece: craft._id });
    if (reviews.length) {
      const avg =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      craft.averageRating = Math.round(avg * 10) / 10;
      craft.reviewCount = reviews.length;
      await craft.save();
    }
  }

  console.log('Seed complete: demo users + craft pieces + reviews');
}

async function run() {
  await connectDB();
  await seedDatabase(true);
  await disconnectDB();
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
