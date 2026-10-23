# 🎬 MediaShare — Social Media Tracking App

> **Track books, movies, shows, and games together.** Create or join private clubs, log your progress, and compete on leaderboards with friends.

---

## 📸 Overview

MediaShare is a full-stack web application where users form shared **media clubs** to collectively track their reading, watching, and gaming progress. Each club has its own library of media items, a leaderboard per item, and social features like invite codes and member management.

---

## 🗂️ Project Structure

```
Media-Sharing-Backend/
├── backend/          # Spring Boot REST API (Java 25)
│   └── src/
│       └── main/java/com/idk/MediaSharingApp/
├── frontend/         # React SPA (TypeScript + Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── context/
│       └── types/
└── docs/
    └── api.md        # Full API & database reference
```

---

## ⚙️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Java** | 25 | Runtime |
| **Spring Boot** | 4.1.0 | Web framework |
| **Spring Security** | (via Boot) | Auth & password hashing |
| **Spring Data JPA** | (via Boot) | ORM / database access |
| **PostgreSQL** | Latest | Primary database |
| **JJWT** | 0.12.5 | JWT access & refresh tokens |
| **Spring Mail** | (via Boot) | Email verification / password reset |
| **Bucket4j** | 8.10.1 | In-memory rate limiting |
| **OWASP AntiSamy** | 1.7.4 | Input sanitization (XSS prevention) |
| **Lombok** | (via Boot) | Boilerplate reduction |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 6.0 | Type safety |
| **Vite** | 8 | Build tool & dev server |
| **Tailwind CSS** | v4 | Styling |
| **React Router** | v7 | Client-side routing |
| **TanStack Query** | v5 | Server state & caching |
| **Axios** | 1.x | HTTP client with JWT interceptor |
| **Lucide React** | Latest | Icons |
| **Zod** | 3.x | Schema validation |
| **React Hook Form** | 7.x | Form management |

---

## ✨ Features

### Authentication
- Email/password registration with **email verification** (token-based)
- JWT **access token** (short-lived) + **refresh token** (long-lived, rotation on use)
- Forgot password / reset password via email link
- BCrypt password hashing

### Media Clubs
- Create **public** (discoverable) or **private** (invite-only) groups
- Browse and search public groups on the **Explore** page
- Join with an **8-character invite code**; creator can regenerate it
- Group owner can **edit details**, **remove members**, or **delete** the group
- Members can **leave** at any time

### Media Tracking
- Add **Books**, **Movies**, **Shows**, or **Games** to any club you belong to
- Auto-fill metadata via external APIs (OpenLibrary, TMDB, RAWG)
- Track progress with a slider + exact number input:
  - Books → pages read
  - Movies → minutes watched
  - Shows → episodes watched
  - Games → hours / completion units
- Set status: `NOT_STARTED` | `IN_PROGRESS` | `FINISHED`
- Add personal notes per progress entry

### Leaderboards
- Each media item has a **live leaderboard** sorted by completion percentage
- 🥇🥈🥉 rank medals for the top 3 members
- Participant label adapts to media type: *readers / viewers / watchers / players*

### Security & Reliability
- Per-IP **rate limiting** on auth endpoints (Bucket4j)
- Input sanitization on all user-supplied strings (AntiSamy)
- CORS configured for frontend origin
- `ddl-auto=validate` — schema managed externally, not auto-dropped

---

## 🚀 Getting Started

### Prerequisites

- **Java 25** (JDK)
- **Maven 3.9+**
- **PostgreSQL 15+**
- **Node.js 20+** & **npm 9+**

---

### 1. Database Setup

```sql
CREATE DATABASE mediashare;
```

Run the schema SQL (tables: `users`, `groups`, `group_members`, `media_items`, `progress`, `refresh_tokens`, `password_reset_tokens`, `email_verification_tokens`). See [`docs/api.md`](docs/api.md) for full schema definitions.

---

### 2. Backend Configuration

Copy and edit `backend/src/main/resources/vars.env` (or set environment variables):

```properties
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mediashare
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password

# JWT secrets (use long random strings, ≥ 64 chars)
JWT_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# JWT expiry
JWT_EXPIRATION_MS=900000          # 15 minutes
JWT_REFRESH_EXPIRATION_MS=604800000  # 7 days

# Email (SMTP or Resend-compatible)
SPRING_MAIL_HOST=smtp.resend.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=resend
SPRING_MAIL_PASSWORD=your_resend_api_key
MAIL_FROM=noreply@yourdomain.com

# App base URL (used in email links)
APP_BASE_URL=http://localhost:5173
```

**Run the backend:**

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`.

**Build for production:**

```bash
npm run build
# Output: frontend/dist/
```

---

## 📁 Frontend Architecture

```
src/
├── api.ts                  # Axios instance + JWT interceptor + token refresh
├── App.tsx                 # Routes & providers
├── index.css               # Global styles, glass-panel / glow utilities
├── context/
│   ├── AuthContext.tsx      # Login / logout / register / token management
│   └── ToastContext.tsx     # App-wide toast notifications
├── hooks/
│   └── useAuth.ts          # Re-export of AuthContext hook
├── types/
│   ├── auth.types.ts
│   ├── group.types.ts
│   ├── media.types.ts
│   └── progress.types.ts
├── services/               # API call functions (one file per domain)
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── group.service.ts
│   ├── media.service.ts
│   └── progress.service.ts
├── schemas/
│   └── auth.schema.ts      # Zod validation schemas
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── DashboardPage.tsx       # My clubs, filter & search
│   ├── ExploreGroupsPage.tsx   # Browse public groups, paginated
│   ├── GroupDetailPage.tsx     # Club view: media tab + members tab
│   ├── MediaDetailPage.tsx     # Media item + leaderboard
│   └── ProfilePage.tsx         # Edit profile, delete account
└── components/
    ├── Navbar.tsx
    ├── cards/
    │   ├── GroupCard.tsx
    │   └── MediaCard.tsx
    └── modals/
        ├── CreateGroupModal.tsx
        ├── JoinGroupModal.tsx
        ├── AddMediaModal.tsx        # Search (OpenLibrary/TMDB/RAWG) + manual entry
        ├── UpdateProgressModal.tsx  # Slider + status + notes
        └── EditGroupModal.tsx
```

---

## 🌐 API Summary

Base URL: `http://localhost:8080/api`

> Full request/response documentation is in [`docs/api.md`](docs/api.md).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login → access + refresh tokens |
| `POST` | `/auth/refresh` | ❌ | Rotate refresh token |
| `POST` | `/auth/logout` | ✅ | Invalidate refresh token |
| `GET` | `/auth/verify-email` | ❌ | Verify email with token |
| `POST` | `/auth/forgot-password` | ❌ | Send reset email |
| `POST` | `/auth/reset-password` | ❌ | Reset password with token |
| `GET` | `/users/{id}` | ✅ | Get user profile |
| `PUT` | `/users/{id}` | ✅ | Update username / avatar |
| `DELETE` | `/users/{id}` | ✅ | Delete account |
| `GET` | `/groups` | ✅ | List public groups (paginated) |
| `GET` | `/groups/my` | ✅ | My groups (member or creator) |
| `POST` | `/groups` | ✅ | Create group |
| `GET` | `/groups/{id}` | ✅ | Get group details |
| `PUT` | `/groups/{id}` | ✅ | Update group (owner only) |
| `DELETE` | `/groups/{id}` | ✅ | Delete group (owner only) |
| `POST` | `/groups/join` | ✅ | Join by invite code |
| `DELETE` | `/groups/{id}/leave` | ✅ | Leave group |
| `POST` | `/groups/{id}/refresh-code` | ✅ | Regenerate invite code (owner) |
| `DELETE` | `/groups/{id}/members/{userId}` | ✅ | Kick member (owner only) |
| `GET` | `/groups/{groupId}/media` | ✅ | List media items in group |
| `POST` | `/groups/{groupId}/media` | ✅ | Add media item |
| `GET` | `/groups/{groupId}/media/{mediaId}` | ✅ | Get media item details |
| `DELETE` | `/groups/{groupId}/media/{mediaId}` | ✅ | Delete media item |
| `GET` | `/media/search` | ✅ | Search external APIs |
| `GET` | `/media/details` | ✅ | Get external media details |
| `GET` | `/groups/{groupId}/media/{mediaId}/progress` | ✅ | Get all member progress |
| `PUT` | `/groups/{groupId}/media/{mediaId}/progress` | ✅ | Upsert own progress |

---

## 🎨 UI Design System

| Token | Value |
|-------|-------|
| Background | `slate-950` / `slate-900` |
| Primary | `indigo-600` |
| Glass panels | `backdrop-blur-xl` + `bg-slate-900/80` |
| Cards | `rounded-2xl`, `border-slate-800` |
| Font | **Plus Jakarta Sans** (body) · **JetBrains Mono** (code/IDs) |
| Success | `emerald-400` |
| Warning | `amber-400` |
| Danger | `rose-500` |

---

## 📄 License

This project is for personal/portfolio use. No license is specified — all rights reserved.
