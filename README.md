# Streamflix — Netflix-style streaming demo

Full-stack app: **Next.js 14** (App Router, Tailwind), **Express** API, **JSON file database** (`server/data/db.json`), **JWT** auth with **user** and **admin** roles.

## Features

- **URL-based video player** — MP4 and HLS (`.m3u8`) via `hls.js`, fullscreen, seek, volume, resume progress, auto-advance episodes for series.
- **Browse & search** — text search on title/description, genre and year filters.
- **User** — register/login, profile, watch history (“Continue watching”), favorites.
- **Admin** — dashboard (totals + popular by views), CRUD movies (including `videoUrl`, thumbnails, featured flag, series episodes).

## Repository layout

| Path | Description |
|------|-------------|
| `server/` | Express API (`/api`), JSON store, JWT middleware |
| `server/data/db.json` | Runtime database (created on first run; gitignored) |
| `client/` | Next.js frontend |

## Admin login (after `npm run seed` in `server/`)

| Field | Value |
|-------|--------|
| **Email** | `admin@streamflix.local` |
| **Password** | `admin123456` |

Override with env vars `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` when running the seed script.

## Prerequisites

- Node.js 18+
- No external database — data lives in **`server/data/db.json`**

## 1. API (Express)

```bash
cd server
cp .env.example .env
# Set JWT_SECRET to a long random string
npm install
npm run seed    # optional: admin user + sample movies
npm run dev
```

**Server environment variables** (`server/.env`):

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | API port |
| `JWT_SECRET` | long random string | JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_ORIGIN` | `http://localhost:3000` | CORS origin |

## 2. Web (Next.js)

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The browser calls **`/api/...` on the same host**; Next.js **proxies** those requests to Express (`API_PROXY_TARGET`, default `http://127.0.0.1:5000`). Keep the API running with `npm run dev` in `server/`.

**Client environment** (`client/.env.local`):

| Variable | Purpose |
|----------|---------|
| *(omit `NEXT_PUBLIC_API_URL`)* | Use same-origin `/api` proxy (recommended locally). |
| `NEXT_PUBLIC_API_URL` | Only if the frontend must call a full API URL (e.g. deployed API). |
| `API_PROXY_TARGET` | Where Next.js forwards `/api` in dev (default port **5000**). |

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/movies`, `GET /api/movies/featured`, `GET /api/movies/genres`, `GET /api/movies/:id` (IDs are UUIDs)
- `POST /api/movies`, `PATCH /api/movies/:id`, `DELETE /api/movies/:id` — **admin only**
- `POST /api/user/progress` — save playback position (authenticated)
- `GET /api/user/watch-history`, `GET/POST /api/user/favorites/...`
- `GET /api/admin/dashboard` — **admin only**

## Security notes

- Passwords are hashed with bcrypt.
- Admin routes require JWT with `role: admin`.
- Movie create/update/delete require admin.
- Validate inputs with `express-validator` on auth and movie routes.

## Production

- Set strong `JWT_SECRET`, HTTPS, and restrict CORS `CLIENT_ORIGIN` to your real domain.
- The JSON file store is suitable for demos; for production traffic use a real database and replace `server/src/db/store.js`.
