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

# 2. Create root .env file for Docker Compose
cat > .env << EOF
SUPABASE_JWT_SECRET="your-supabase-jwt-secret-here"
NUXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NUXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
EOF

# 3. Create backend .env file
cat > backend/.env << EOF
DATABASE_URL="postgresql://orderking:orderking_secret@postgres:5432/orderking?schema=public"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret-here"
SUPABASE_URL="https://your-project-id.supabase.co"
PORT=4000
EOF

# 4. Create frontend .env file
cat > frontend/.env << EOF
NUXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NUXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
NUXT_PUBLIC_API_BASE_URL="http://localhost:4000"
EOF

# 5. Start Colima (if using macOS with Colima)
colima start

# 6. Start all services
docker compose up --build
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:4000  
- **PostgreSQL**: localhost:5432 (user: `orderking`, password: `orderking_secret`)  

---

## Environment Variables

### Required Files

You need **three** `.env` files:

1. **Root `.env`** (for Docker Compose)
2. **`backend/.env`** (for NestJS)
3. **`frontend/.env`** (for Nuxt)

### Root `.env` (for Docker Compose)

```env
SUPABASE_JWT_SECRET="your-supabase-jwt-secret-here"
NUXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NUXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
```

### `backend/.env`

```env
# For Docker Compose (uses local postgres container)
DATABASE_URL="postgresql://orderking:orderking_secret@postgres:5432/orderking?schema=public"

# For local development (uses Supabase)
# DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"

SUPABASE_JWT_SECRET="your-supabase-jwt-secret-here"
SUPABASE_URL="https://your-project-id.supabase.co"
PORT=4000
```

### `frontend/.env`

```env
NUXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NUXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
NUXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

### Where to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NUXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NUXT_PUBLIC_SUPABASE_ANON_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`
5. Go to **Settings → Database** for `DATABASE_URL` (if using Supabase DB)

---

## Running Locally (Without Docker)

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account (for auth and optionally database)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section above)
# Make sure DATABASE_URL points to your Supabase or local PostgreSQL

# Push database schema
npx prisma db push

# Seed the database
npx prisma db seed

# Start development server
npm run start:dev
```

Backend will run on http://localhost:4000

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (see Environment Variables section above)

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

### Running Tests

```bash
cd backend
npm test
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

## Bonus Features Implemented

- [x] Order tracking page with real-time status via Supabase Realtime
- [x] Real-time activity log showing timestamped status changes
- [x] User profile page with view/edit functionality
- [x] "Order Again" feature on landing page
- [x] Category filter for menu items
- [x] Optimistic UI updates on cart actions
- [x] Docker Compose full-stack setup
- [x] Unit tests for `OrdersService` with Jest
- [x] ES256 JWT verification with JWKS

---

## Architecture Notes

- **Auth flow**: Supabase Auth issues JWTs → frontend attaches as `Authorization: Bearer <token>` → NestJS `SupabaseAuthGuard` validates using JWT secret
- **Payment**: Simulated — order moves to `PAID` status immediately after "checkout", then cycles through `PREPARING → READY → DELIVERED` via a timeout (Supabase Realtime pushes updates)
- **What I'd improve with more time**: Replace the polling-based realtime with proper WebSocket rooms per order; add a restaurant dashboard for order management; add Stripe for real payment flow

---

© 2026 OrderKing GmbH
