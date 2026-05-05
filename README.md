# OrderKing — Food Delivery Platform

A full-stack food delivery web platform built with **NestJS**, **Nuxt 4**, **PostgreSQL (Supabase)**, **Prisma**, and **Supabase Auth**.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Nuxt 4 · Vue 3 · Tailwind CSS     |
| Backend     | NestJS · TypeScript               |
| Database    | PostgreSQL via Supabase           |
| ORM         | Prisma                            |
| Auth        | Supabase Auth (JWT)               |
| CI/CD       | GitHub Actions                    |
| Dev Infra   | Docker Compose                    |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/orderking.git
cd orderking

# 2. Copy and fill environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything
docker compose up --build
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:4000  

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/orderking?schema=public"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
PORT=4000
```

### `frontend/.env`

```env
NUXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NUXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NUXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

> **Where to get these:**
> - Go to [supabase.com](https://supabase.com) → Your Project → Settings → API
> - `DATABASE_URL`: Settings → Database → Connection String (URI mode)
> - `SUPABASE_JWT_SECRET`: Settings → API → JWT Secret
> - `SUPABASE_URL` + `ANON_KEY`: Settings → API

---

## Running Locally (Without Docker)

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Database Seeding

Seed data is in `backend/prisma/seed.ts` — it creates:
- 2 restaurants (BurgerHouse, Spice Garden)
- 10+ menu items across categories
- Sample orders

Run manually:
```bash
cd backend && npx prisma db seed
```

---

## Project Structure

```
orderking/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT Guard (Supabase)
│   │   ├── menu/             # Menu items module
│   │   ├── orders/           # Orders module
│   │   ├── restaurants/      # Restaurants module
│   │   └── prisma/           # PrismaService
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── ...
├── frontend/                 # Nuxt 4 app
│   ├── pages/
│   │   ├── index.vue         # Menu listing
│   │   ├── cart.vue          # Cart & Checkout
│   │   └── order/[id].vue    # Order confirmation + tracking
│   ├── composables/
│   │   └── useCart.ts        # Cart state management
│   └── ...
├── .github/workflows/
│   └── ci.yml               # GitHub Actions: lint + build
└── docker-compose.yml
```

---

## Video Walkthrough

_[Link to MP4 recording — see submission]_

---

## Bonus Features Implemented

- [x] Order tracking page with real-time status via Supabase Realtime
- [x] Category filter for menu items
- [x] Optimistic UI updates on cart actions
- [x] Docker Compose full-stack setup
- [x] Unit test for `OrdersService`

---

## Architecture Notes

- **Auth flow**: Supabase Auth issues JWTs → frontend attaches as `Authorization: Bearer <token>` → NestJS `SupabaseAuthGuard` validates using JWT secret
- **Payment**: Simulated — order moves to `PAID` status immediately after "checkout", then cycles through `PREPARING → READY → DELIVERED` via a timeout (Supabase Realtime pushes updates)
- **What I'd improve with more time**: Replace the polling-based realtime with proper WebSocket rooms per order; add a restaurant dashboard for order management; add Stripe for real payment flow

---

© 2026 OrderKing GmbH
