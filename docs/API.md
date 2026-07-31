# ArtisanVault API Documentation

Base URL (local): `http://localhost:5000/api`

All JSON responses follow:

```json
{ "success": true, "data": { } }
```

Error responses:

```json
{ "success": false, "message": "…", "details": {} }
```

Authentication: send `Authorization: Bearer <token>` on protected routes.

---

## Health

### `GET /health`

Public. Service health check.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "ArtisanVault API",
    "timestamp": "2026-07-31T00:00:00.000Z"
  }
}
```

---

## Auth

### `POST /auth/register`

Public. Create a buyer/artisan account (`role: user`).

**Body**

| Field | Type | Rules |
|-------|------|-------|
| name | string | 2–80 chars |
| email | string | valid email |
| password | string | min 6 chars |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "…", "name": "…", "email": "…", "role": "user" }
  }
}
```

**Errors:** `400` validation, `409` email taken.

---

### `POST /auth/login`

Public.

**Body:** `{ "email": "…", "password": "…" }`

**Response `200`:** same shape as register.

**Errors:** `401` invalid credentials.

---

### `GET /auth/me`

Protected.

**Response `200`:** `{ "success": true, "data": { "user": { … } } }`

---

## Crafts

Materials: `Walnut` | `Steel` | `Marble` | `Ceramic`  
Categories: `Tables` | `Seating` | `Lighting`

### `GET /crafts`

Public. List with filters, sort, pagination.

**Query**

| Param | Type | Description |
|-------|------|-------------|
| search | string | Text search on title/description/artisan |
| material | string | Exact material |
| category | string | Exact category |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| customOrder | `true`/`false` | Custom order availability |
| sort | string | `newest` (default), `oldest`, `price_asc`, `price_desc`, `rating` |
| page | number | Default 1 |
| limit | number | Default 8, max 24 |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [ /* craft documents */ ],
    "pagination": { "page": 1, "limit": 8, "total": 12, "totalPages": 2 }
  }
}
```

---

### `GET /crafts/:id`

Public. Detail plus up to 4 related pieces.

**Response `200`:** `{ "success": true, "data": { "craft": {…}, "related": […] } }`  
**Errors:** `404`

---

### `GET /crafts/manage/mine`

Protected. Lists crafts owned by the caller; admins see all.

**Response `200`:** `{ "success": true, "data": { "items": […] } }`

---

### `POST /crafts`

Protected. Create a craft piece.

**Body**

| Field | Type | Required |
|-------|------|----------|
| title | string | yes |
| shortDescription | string | yes (≤200) |
| fullDescription | string | yes |
| artisanName | string | yes |
| price | number | yes (>0) |
| material | enum | yes |
| category | enum | yes |
| dimensions | string | yes |
| leadTime | string | yes |
| imageUrls | string[] | yes (≥1 URL) |
| customOrderAvailable | boolean | no |

**Response `201`:** `{ "success": true, "data": { "craft": {…} } }`

---

### `PATCH /crafts/:id`

Protected. Owner or admin.

**Body:** any subset of create fields.

**Errors:** `403`, `404`

---

### `DELETE /crafts/:id`

Protected. Owner or admin.

**Response `200`:** `{ "success": true, "data": { "deleted": true } }`

---

## Reviews

### `GET /reviews/:craftId`

Public. List reviews for a craft (populated user name/email).

---

### `POST /reviews/:craftId`

Protected. One review per user per craft.

**Body:** `{ "rating": 1–5, "comment": "…" }`

**Response `201`**  
**Errors:** `409` already reviewed, `404` craft missing

---

## Stats

### `GET /stats/overview`

Protected. Aggregates for dashboard charts.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "totals": { "crafts": 8, "users": 3, "reviews": 3, "averagePrice": 1800 },
    "byMaterial": [{ "material": "Walnut", "count": 2 }],
    "byCategory": [{ "category": "Tables", "count": 3 }],
    "priceBands": [{ "range": "1500", "count": 2 }],
    "recentCrafts": [ /* … */ ]
  }
}
```

For non-admin users, craft aggregates are scoped to their own listings. User/review totals remain global.

---

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| User | artisan@artisanvault.com | Artisan@123 |
| Admin | admin@artisanvault.com | Admin@123 |
| Buyer | buyer@artisanvault.com | Artisan@123 |
