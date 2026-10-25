# Disha (दिशा) — Decoupled Architecture & Technical Documentation

> **Status:** Decoupled Architecture Completed & Production Builds Verified  
> **Target Audience:** Indian High School Students (Classes 9–12, ages 14–18)  
> **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, NextAuth.js v5 (Port 3000)  
> **Backend:** Next.js 16 (Route Handlers / REST APIs), TypeScript, Prisma 6, PostgreSQL, JWT (Port 5000)  

---

## 1. Architectural Transformation & Principles

The Disha career guidance platform was restructured from a monolithic Next.js application into two distinct, decoupled applications:

1. **`frontend/` (Port 3000):** A client-facing Next.js application containing:
   - Public exploration: Landing page, Career Directory with dynamic search and stream filtering, Career Detail pages with prerequisite lists and verified resources.
   - Interactive 10-Question RIASEC Assessment Quiz with real-time trait scoring and career matching.
   - Student Dashboard with Holland Codes aptitude breakdown and personalized career recommendations.
   - Admin Moderation Queue and Contributor Submission portal.
   - **Zero Database / ORM Access:** Prisma, direct database credentials, and bcrypt are removed from the frontend.
   - Centralized REST Client (`apiClient`) with typed methods that handle requests to the backend using `NEXT_PUBLIC_BACKEND_URL`.
   - NextAuth.js v5 Credentials provider that delegates user credential validation to backend `POST /api/auth/login`.

2. **`backend/` (Port 5000):** A server-side Next.js application dedicated exclusively to REST Route Handlers:
   - Next.js Route Handlers (no Express) exposing clean, standardized JSON APIs with CORS headers.
   - Database persistence via Prisma ORM 6 and PostgreSQL.
   - Proprietary RIASEC psychological scoring engine, stream compatibility checker, and recommendation ranker.
   - DPDPA-compliant parental consent verification workflow.
   - Secure HS256 JWT generation, verification, and role-based access control (RBAC: `STUDENT`, `CONTRIBUTOR`, `MODERATOR`, `ADMIN`).

---

## 2. Directory Structure & File Map

```
.
├── backend/                                   # REST API Backend Application (Port 5000)
│   ├── prisma/
│   │   ├── schema.prisma                      # Database schema (8 models)
│   │   ├── seed.ts                            # Seed script (8 clusters, 36 careers, 53 resources, 10 quiz questions)
│   │   └── migrations/
│   │       └── 20261019201410_init/           # Initial PostgreSQL migration
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/route.ts         # POST /api/auth/login (verifies password, returns JWT)
│   │   │   │   │   ├── register/route.ts      # POST /api/auth/register (hashes password, generates consent token)
│   │   │   │   │   ├── verify-consent/route.ts# POST /api/auth/verify-consent (DPDPA token verification)
│   │   │   │   │   └── me/route.ts            # GET /api/auth/me (returns profile for bearer token)
│   │   │   │   ├── careers/
│   │   │   │   │   ├── route.ts               # GET /api/careers (filtering by cluster, stream, search)
│   │   │   │   │   ├── clusters/route.ts      # GET /api/careers/clusters
│   │   │   │   │   └── [slug]/route.ts        # GET /api/careers/[slug] (full detail + related)
│   │   │   │   ├── quiz/
│   │   │   │   │   └── route.ts               # GET /api/quiz (active questions) & POST /api/quiz (scores RIASEC)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── route.ts               # GET /api/dashboard (authenticated user profile & matches)
│   │   │   │   ├── moderation/
│   │   │   │   │   └── route.ts               # GET /api/moderation & POST /api/moderation (approve/reject)
│   │   │   │   ├── contributors/
│   │   │   │   │   └── submit/route.ts        # POST /api/contributors/submit (queue new submissions)
│   │   │   │   └── health/
│   │   │   │       └── route.ts               # GET /api/health (service health probe)
│   │   │   └── layout.tsx                     # Minimal backend layout (no external font downloads)
│   │   ├── lib/
│   │   │   ├── prisma.ts                      # Prisma client singleton
│   │   │   ├── jwt.ts                         # Crypto-secure HS256 JWT sign & verify
│   │   │   ├── cors.ts                        # CORS headers & OPTIONS preflight handler
│   │   │   ├── auth-middleware.ts             # Bearer token extractor & RBAC validator
│   │   │   ├── scoring/
│   │   │   │   └── riasec.ts                  # Euclidean distance & stream bonus scoring
│   │   │   └── validators/                    # Zod input validation schemas
│   │   └── constants/
│   │       └── riasec.ts                      # Holland codes dimensions & stream compatibility matrices
│   ├── .env                                   # DATABASE_URL, PORT=5000, AUTH_SECRET, CORS_ORIGIN
│   └── package.json                           # Backend dependencies (@prisma/client, bcryptjs, jsonwebtoken)
│
├── frontend/                                  # Next.js 16 Web Application (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── careers/
│   │   │   │   │   ├── page.tsx               # Career catalog with search & cluster filters
│   │   │   │   │   └── [slug]/page.tsx        # Career detail, requirements, RIASEC profile & resources
│   │   │   │   └── quiz/
│   │   │   │       └── page.tsx               # 10-Question RIASEC aptitude assessment & results
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx             # Login form (NextAuth credentials sign-in)
│   │   │   │   ├── register/page.tsx          # Student registration with DPDPA parent email
│   │   │   │   └── verify/page.tsx            # Parental consent confirmation page
│   │   │   ├── (dashboard)/
│   │   │   │   └── dashboard/page.tsx         # Student dashboard (retrieved via apiClient)
│   │   │   ├── (admin)/
│   │   │   │   ├── moderation/page.tsx        # Editorial moderation queue (approved/changes/rejected)
│   │   │   │   └── contributors/page.tsx      # Contributor submission portal
│   │   │   ├── api/auth/[...nextauth]/
│   │   │   │   └── route.ts                   # NextAuth Route Handler
│   │   │   ├── layout.tsx                     # Root HTML layout with AuthProvider
│   │   │   └── page.tsx                       # Landing page with hero & 8 clusters
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx              # Navigation bar with dynamic auth state & sign-out
│   │   │   └── providers/AuthProvider.tsx     # SessionProvider client wrapper
│   │   ├── lib/
│   │   │   ├── api-client.ts                  # Centralized typed HTTP client (NEXT_PUBLIC_BACKEND_URL)
│   │   │   └── auth.ts                        # NextAuth configuration delegating to backend REST API
│   │   ├── middleware.ts                      # Route protection for /dashboard and /admin/*
│   │   └── types/                             # Frontend TypeScript definitions
│   ├── .env.local                             # NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_BACKEND_URL
│   └── package.json                           # Frontend dependencies (NextAuth, React 19, Tailwind CSS v4)
│
├── docker-compose.yml                         # Local PostgreSQL 16 container definition
└── package.json                               # Monorepo root orchestration scripts
```

---

## 3. Communication Contract & Authentication Flow

### Authentication Flow (Auth.js Delegation)
1. **Student / Admin Login:**
   - User enters email and password on `/login`.
   - Frontend calls `signIn('credentials', { email, password })`.
   - In `frontend/src/lib/auth.ts`, the NextAuth `authorize` callback forwards the credentials to `POST http://localhost:5000/api/auth/login`.
   - Backend validates the user against PostgreSQL using `bcrypt.compare`.
   - On success, the backend signs an HS256 JWT containing `id`, `email`, `role`, and `parentConsentVerified`.
   - The backend responds with `{ success: true, token, user }`.
   - NextAuth preserves the user profile and `backendToken` inside the encrypted session cookie on port 3000.
2. **Authenticated Backend Requests:**
   - Client and Server components in `frontend/` obtain the token via `session.user.backendToken`.
   - All backend calls route through `apiClient.<module>.<method>(..., token)`.
   - The client sets header `Authorization: Bearer <backendToken>`.
   - Backend `requireAuth(req)` parses and verifies the JWT signature and enforces role permissions.

### REST API Endpoints Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | None | Health probe returning service uptime |
| `/api/careers` | GET | None | List published careers with `?cluster=`, `?stream=`, `?q=` |
| `/api/careers/clusters` | GET | None | List 8 career clusters ordered by sort index |
| `/api/careers/:slug` | GET | None | Fetch career details, prerequisites, resources & related careers |
| `/api/quiz` | GET | None | Fetch 10 RIASEC assessment questions |
| `/api/quiz` | POST | Optional | Score RIASEC assessment; saves to user profile if token provided |
| `/api/auth/login` | POST | None | Verify user credentials and generate HS256 JWT |
| `/api/auth/register` | POST | None | Register student account, create parent consent token |
| `/api/auth/verify-consent` | POST | None | Verify minor parental consent token under DPDPA 2023 |
| `/api/auth/me` | GET | Bearer | Fetch profile for authenticated bearer token |
| `/api/dashboard` | GET | Bearer | Fetch user's RIASEC aptitude scores and tailored career matches |
| `/api/moderation` | GET | Bearer (Mod/Admin) | List community submissions filtered by status |
| `/api/moderation` | POST | Bearer (Mod/Admin) | Approve, request changes, or reject a submission |
| `/api/contributors/submit` | POST | Bearer (Contrib/Admin)| Submit career pathway for editorial review |

---

## 4. Verification and Build Status

Both applications have been verified with complete type-checking and production builds:

```bash
# Monorepo build execution:
npm run build
```
- **Backend Build:** 15 Route Handlers compiled successfully (`✓ Generating static pages using 9 workers (15/15)`).
- **Frontend Build:** 12 App Router pages compiled successfully (`✓ Generating static pages using 9 workers (12/12)`).
- **Zero TypeScript Errors:** Both `frontend` and `backend` pass strict `tsc --noEmit` checks.
