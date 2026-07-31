# ArtisanVault Backend

Express + TypeScript + MongoDB API for the ArtisanVault craft marketplace.

## Features

- JWT authentication & role-based authorization (`user` / `admin`)
- Craft piece CRUD with search, filters, sort, and pagination
- Reviews with rating aggregation
- Dashboard statistics for Recharts
- Seed script with real craft listings and demo accounts
- Jest + Supertest test suite

## Prerequisites

- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas URI

## Quick local setup

```bash
cd backend
cp .env.example .env
# edit .env — set JWT_SECRET and MONGODB_URI
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`  
Health: `http://localhost:5000/api/health`  
Full endpoint docs: [docs/API.md](docs/API.md)

## Environment variables

Create `backend/.env` (never commit this file):

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `PORT` | no | `5000` | HTTP port |
| `MONGODB_URI` | yes | `mongodb://127.0.0.1:27017/artisanvault` | Database connection |
| `JWT_SECRET` | yes | long random string | Signs access tokens |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |
| `CLIENT_URL` | yes | `http://localhost:3000` | CORS allowlist (frontend origin) |
| `NODE_ENV` | no | `development` | Runtime mode |
| `SEED_ON_START` | no | `true` | Auto-seed if DB empty on boot |

Atlas example:

```
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/artisanvault?retryWrites=true&w=majority
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run seed` | Force re-seed demo users + crafts + reviews |
| `npm test` | Run Jest suite (uses in-memory MongoDB) |

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Artisan (user) | `artisan@artisanvault.com` | `Artisan@123` |
| Admin | `admin@artisanvault.com` | `Admin@123` |
| Buyer | `buyer@artisanvault.com` | `Artisan@123` |

## Project file map

```
backend/
├── docs/API.md                 # Full REST documentation
├── src/
│   ├── server.ts               # Boot: DB connect, optional seed, listen
│   ├── app.ts                  # Express app, CORS, routes, errors
│   ├── config/env.ts           # Env validation
│   ├── config/db.ts            # Mongoose connection helpers
│   ├── models/                 # User, CraftPiece, Review schemas
│   ├── middleware/             # auth, authorize, validate, errorHandler
│   ├── routes/                 # Route mounting
│   ├── controllers/            # HTTP handlers
│   ├── services/               # Business logic
│   ├── utils/                  # JWT, Zod schemas, AppError
│   └── seed/seed.ts            # Demo data
└── tests/api.test.ts           # Auth + craft authorization tests
```

## Suggested GitHub commit sequence (15+)

1. Scaffold (`package.json`, `tsconfig`, folders, `.gitignore`, `.env.example`)
2. Express `app` + `server` + health route
3. Env config + DB connection
4. User model + JWT utils
5. Auth routes (register / login / me)
6. Auth middleware + auth tests
7. CraftPiece model
8. Public GET list + filters
9. Public GET by id + related
10. Protected POST create
11. Manage list + PATCH/DELETE + authorize
12. Review model + routes
13. Stats routes
14. Seed script + real craft data
15. `docs/API.md` + README polish

Push after each step: `git add -A && git commit -m "…" && git push`.

## Deploy hints

- **Render / Railway / Fly.io:** set env vars, start command `npm run build && npm start`
- Point `CLIENT_URL` at your deployed frontend origin
- Run `npm run seed` once against production DB (or set `SEED_ON_START=true` for first boot only)

## CORS & frontend integration

Frontend should call `NEXT_PUBLIC_API_URL=http://localhost:5000/api` and send:

```
Authorization: Bearer <token>
```
