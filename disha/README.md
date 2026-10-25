# Disha (दिशा) — Decoupled Career Guidance Platform

An open, evidence-based career navigation and discovery platform built for Indian high school students (Classes 9–12).

---

## 🏗️ Architecture Overview

The platform is decoupled into two independent applications communicating over REST APIs:

```
┌───────────────────────────────────────┐         REST API (JSON)         ┌───────────────────────────────────────┐
│              FRONTEND                 │ ◄─────────────────────────────► │               BACKEND                 │
│  Next.js 16 (App Router) + React 19   │         HTTP / CORS             │  Next.js 16 (Route Handlers)          │
│  Port: 3000                           │  Header: Bearer <JWT Token>     │  Port: 5000                           │
│                                       │                                 │                                       │
│  - Student UI & Public Catalog        │                                 │  - REST API Endpoints                 │
│  - RIASEC Assessment Quiz UI          │                                 │  - RIASEC Matching & Scoring Engine  │
│  - Student Dashboard & Profile        │                                 │  - DPDPA Parental Consent Verification│
│  - Contributor Portal                 │                                 │  - Editorial Moderation Logic         │
│  - Admin Moderation Queue             │                                 │  - Prisma ORM 6 + PostgreSQL Access   │
│  - Auth.js / NextAuth v5 Credentials  │                                 │  - HS256 JWT Token Generation & Auth  │
│  - Centralized API Client             │                                 │                                       │
│  (Zero Database Access / No Prisma)   │                                 │                                       │
└───────────────────────────────────────┘                                 └───────────────────┬───────────────────┘
                                                                                              │
                                                                                              │ Prisma Client
                                                                                              ▼
                                                                                  ┌───────────────────────┐
                                                                                  │   PostgreSQL (5432)   │
                                                                                  │   Database: `disha`   │
                                                                                  └───────────────────────┘
```

---

## 📁 Repository Structure

```
.
├── backend/                  # Backend REST API Application (Port 5000)
│   ├── prisma/               # Schema, migrations, and seed script
│   │   ├── schema.prisma     # 8 models (User, Career, Cluster, Resource, Quiz, etc.)
│   │   ├── migrations/       # SQL migrations
│   │   └── seed.ts           # 8 clusters, 36 careers, 53 resources, 10 quiz questions
│   ├── src/
│   │   ├── app/api/          # Next.js Route Handlers (REST Endpoints)
│   │   │   ├── auth/         # /api/auth/login, /register, /verify-consent, /me
│   │   │   ├── careers/      # /api/careers, /clusters, /[slug]
│   │   │   ├── quiz/         # /api/quiz (GET questions, POST submit & score)
│   │   │   ├── dashboard/    # /api/dashboard (authenticated student profile & matches)
│   │   │   ├── moderation/   # /api/moderation (GET pending, POST decision)
│   │   │   ├── contributors/ # /api/contributors/submit
│   │   │   └── health/       # /api/health
│   │   ├── lib/              # JWT, CORS, Auth middleware, Prisma client, scoring
│   │   └── constants/        # RIASEC dimensions & stream mappings
│   └── package.json          # Backend dependencies (Prisma, bcryptjs, jsonwebtoken)
│
├── frontend/                 # Frontend Web Application (Port 3000)
│   ├── src/
│   │   ├── app/              # App router pages
│   │   │   ├── (public)/     # / (landing), /careers, /careers/[slug], /quiz
│   │   │   ├── (auth)/       # /login, /register, /verify
│   │   │   ├── (dashboard)/  # /dashboard (student personalized recommendations)
│   │   │   ├── (admin)/      # /admin/moderation, /admin/contributors
│   │   │   └── api/auth/     # NextAuth handler route ([...nextauth])
│   │   ├── components/       # UI components, layout Navbar, AuthProvider
│   │   ├── lib/
│   │   │   ├── api-client.ts # Centralized typed backend REST client
│   │   │   └── auth.ts       # NextAuth v5 credentials delegating to backend API
│   │   └── middleware.ts     # Edge route protection (/dashboard, /admin/*)
│   └── package.json          # Frontend dependencies (NextAuth, React 19, Tailwind CSS v4)
│
├── docker-compose.yml        # PostgreSQL container setup
└── package.json              # Monorepo root orchestration scripts
```

---

## 🚀 Quick Start Guide

### 1. Start the PostgreSQL Database

Using Docker:
```bash
docker compose up -d
```
Database URL: `postgresql://user:password@localhost:5432/disha?schema=public`

### 2. Apply Migrations & Seed Data

From the root:
```bash
npm run db:migrate
npm run db:seed
```
Or directly inside `backend/`:
```bash
cd backend
npm run db:migrate
npm run db:seed
```
This populates 8 career clusters, 36 careers, 53 vetted learning resources, 10 RIASEC quiz questions, and 3 demo accounts:
- **Admin**: `admin@disha.app` / `Admin@12345`
- **Moderator**: `moderator@disha.app` / `Mod@12345`
- **Student**: `student@disha.app` / `Student@12345`

### 3. Run Development Servers

Run backend and frontend concurrently from the root:
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Frontend UI (Port 3000)
npm run dev:frontend
```

Or run directly from their respective folders:
```bash
# Backend:
cd backend && npm run dev

# Frontend:
cd frontend && npm run dev
```

### 4. Build for Production

From root:
```bash
npm run build
```
This compiles both backend and frontend applications with zero TypeScript or route compilation errors.

---

## 🔒 Security & Decoupling Guarantees

1. **Zero Database Access in Frontend:** Frontend `package.json` contains no Prisma or database drivers. All database operations happen on `backend/` behind REST Route Handlers.
2. **CORS Protected:** Backend enforces strict origin checks for `http://localhost:3000` with preflight `OPTIONS` handling.
3. **Decoupled Auth:** Frontend NextAuth v5 delegates credential verification to backend `POST /api/auth/login`. The signed JWT is maintained in the NextAuth session and forwarded via `Authorization: Bearer <token>` through the centralized `apiClient`.
4. **DPDPA Compliance:** Parental consent workflow is recorded without external email blockers; direct consent tokens activate minor accounts safely.
