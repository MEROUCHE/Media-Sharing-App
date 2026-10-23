# Media Sharing App — Frontend

A React + TypeScript + Vite + Tailwind CSS single-page application built to interface with the Media Sharing Spring Boot backend.

## 🚀 Features

- **Authentication & Security:**
  - Login, Registration, Email Verification status (`/verify-email`), Forgot Password, and Password Reset.
  - JWT Access Token & Refresh Token lifecycle managed with Axios interceptors and automated 401 token refresh.
- **Group Management:**
  - Create Groups (with public/private visibility toggle).
  - Join Groups via 8-character invite code.
  - Explore Public Groups with search and pagination.
  - Group Details view with member list, role indicators, and invite code copy/regeneration.
- **Media Tracking & Online Search Integration:**
  - Integrated external search for Books (Open Library), Movies (TMDB), Shows (TMDB), and Games (RAWG).
  - One-click auto-fill: Selecting a search result queries the backend details endpoint and populates the title, creator, cover URL, total units (pages/runtime/episodes), and synopsis.
  - Manual media item entry and editing.
- **Progress Tracking:**
  - Track individual progress with interactive position gauge, completion percentage, status override, and notes.
  - Shared Club Progress Leaderboard showing all members' progress on any tracked media item.
- **User Profile Management:**
  - View personal credentials, update username and avatar URL, or delete account.

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State & Data Fetching:** TanStack Query v5 + Context API
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **HTTP Client:** Axios

## 💻 Getting Started

### 1. Start the Backend
Make sure the Spring Boot backend is running on `http://localhost:8080`.

### 2. Install & Start Frontend
```bash
npm install
npm run dev
```

The app will start on `http://localhost:3000`. Requests to `/api/*` are automatically proxied to `http://localhost:8080`.

### 3. Production Build
```bash
npm run build
```
