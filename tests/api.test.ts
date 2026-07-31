import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { CraftPiece } from '../src/models/CraftPiece';
import bcrypt from 'bcryptjs';

let mongo: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    CraftPiece.deleteMany({}),
  ]);
});

async function createUser(overrides: Partial<{ name: string; email: string; password: string; role: 'user' | 'admin' }> = {}) {
  const password = overrides.password ?? 'Artisan@123';
  const user = await User.create({
    name: overrides.name ?? 'Test Artisan',
    email: overrides.email ?? 'test@artisanvault.com',
    passwordHash: await bcrypt.hash(password, 10),
    role: overrides.role ?? 'user',
  });
  return { user, password };
}

async function login(email: string, password: string) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data.token as string;
}

describe('Health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New Artisan',
      email: 'new@artisanvault.com',
      password: 'Secure1!',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('new@artisanvault.com');
  });

  it('logs in with valid credentials', async () => {
    await createUser({ email: 'login@artisanvault.com', password: 'Artisan@123' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@artisanvault.com',
      password: 'Artisan@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects invalid password', async () => {
    await createUser({ email: 'bad@artisanvault.com' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'bad@artisanvault.com',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  it('returns current user with valid JWT', async () => {
    await createUser({ email: 'me@artisanvault.com', password: 'Artisan@123' });
    const token = await login('me@artisanvault.com', 'Artisan@123');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@artisanvault.com');
  });
});

describe('Crafts', () => {
  const craftBody = {
    title: 'Walnut Desk',
    shortDescription: 'Solid walnut writing desk with steel legs.',
    fullDescription:
      'A compact writing desk milled from walnut with blackened steel legs and a single drawer. Finished with oil for a soft sheen.',
    artisanName: 'Mara Ellison',
    price: 2200,
    material: 'Walnut',
    category: 'Tables',
    dimensions: '48" L × 24" D × 30" H',
    leadTime: '5 weeks',
    imageUrls: ['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800'],
    customOrderAvailable: true,
  };

  it('requires auth to create', async () => {
    const res = await request(app).post('/api/crafts').send(craftBody);
    expect(res.status).toBe(401);
  });

  it('creates and lists crafts with filters', async () => {
    await createUser({ email: 'maker@artisanvault.com', password: 'Artisan@123' });
    const token = await login('maker@artisanvault.com', 'Artisan@123');

    const created = await request(app)
      .post('/api/crafts')
      .set('Authorization', `Bearer ${token}`)
      .send(craftBody);
    expect(created.status).toBe(201);

    await request(app)
      .post('/api/crafts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...craftBody,
        title: 'Steel Stool',
        material: 'Steel',
        category: 'Seating',
        price: 450,
      });

    const filtered = await request(app).get('/api/crafts').query({
      material: 'Walnut',
      minPrice: 1000,
      sort: 'price_asc',
    });
    expect(filtered.status).toBe(200);
    expect(filtered.body.data.items.length).toBe(1);
    expect(filtered.body.data.items[0].material).toBe('Walnut');
  });

  it('forbids non-owner delete', async () => {
    await createUser({ email: 'owner@artisanvault.com', password: 'Artisan@123' });
    await createUser({ email: 'other@artisanvault.com', password: 'Artisan@123' });
    const ownerToken = await login('owner@artisanvault.com', 'Artisan@123');
    const otherToken = await login('other@artisanvault.com', 'Artisan@123');

    const created = await request(app)
      .post('/api/crafts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(craftBody);

    const id = created.body.data.craft._id;
    const del = await request(app)
      .delete(`/api/crafts/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(del.status).toBe(403);
  });

  it('allows admin delete', async () => {
    await createUser({ email: 'owner2@artisanvault.com', password: 'Artisan@123' });
    await createUser({
      email: 'admin@artisanvault.com',
      password: 'Admin@123',
      role: 'admin',
    });
    const ownerToken = await login('owner2@artisanvault.com', 'Artisan@123');
    const adminToken = await login('admin@artisanvault.com', 'Admin@123');

    const created = await request(app)
      .post('/api/crafts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(craftBody);

    const id = created.body.data.craft._id;
    const del = await request(app)
      .delete(`/api/crafts/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(200);
  });
});
