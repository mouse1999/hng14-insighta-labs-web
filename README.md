
# Insighta Labs+ Web Portal

A modern, secure web portal for the Insighta profile intelligence platform. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🔐 **GitHub OAuth Authentication** — Secure login with HTTP-only cookies
- 👥 **Role-Based Access Control** — Admin and Analyst views
- 📊 **Profile Management** — List, view, search, and export profiles
- 🔍 **Natural Language Search** — Query profiles using everyday language
- 📄 **CSV Export** — Export filtered profiles to CSV
- ⚡ **Real-time Updates** — Instant feedback with loading states

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router v6 | Routing |
| Tailwind CSS | Styling |
| Lucide React | Icons |

## 📁 Project Structure

```
insighta-web/
├── src/
│   ├── api/
│   │   ├── client.ts          # HTTP client with credentials
│   │   └── profiles.ts        # Profile API calls
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx     # Navigation with user menu
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Profiles/
│   │   │   ├── ProfileTable.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── CreateProfileModal.tsx
│   │   └── Common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorAlert.tsx
│   ├── pages/
│   │   ├── Login.tsx           # GitHub OAuth entry
│   │   ├── Dashboard.tsx       # Metrics overview
│   │   ├── ProfilesList.tsx    # Filterable profile table
│   │   ├── ProfileDetail.tsx   # Single profile view
│   │   ├── SearchPage.tsx      # Natural language search
│   │   └── AccountPage.tsx     # User profile & logout
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useProfiles.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── formatters.ts
├── .env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8080`

### Installation

```bash
# Clone repository
git clone https://github.com/insighta/web-portal.git
cd insighta-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

## 📋 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | GitHub OAuth entry point |
| Dashboard | `/dashboard` | Statistics and recent profiles |
| Profiles | `/profiles` | Filterable profile table |
| Profile Detail | `/profiles/:id` | Single profile view |
| Search | `/search` | Natural language search |
| Account | `/account` | User information and logout |

## 🔐 Authentication Flow

```
1. User clicks "Login with GitHub"
2. Frontend calls GET /auth/github
3. Backend returns GitHub authorize URL
4. Frontend redirects to GitHub
5. User authorizes application
6. GitHub redirects to backend callback
7. Backend sets HTTP-only cookie
8. Backend redirects to /dashboard
9. Dashboard calls /api/me to get user info
```

### Security Features

- **HTTP-only cookies** — Tokens never accessible via JavaScript
- **Secure flag** — Cookies only sent over HTTPS
- **Same-site policy** — CSRF protection

## 🎭 Role-Based UI

| Role | Permissions | UI Elements |
|------|-------------|-------------|
| **Admin** | Create, Read, Delete profiles | Create button, Delete buttons |
| **Analyst** | Read only, Search, Export | No create/delete buttons |

## 📡 API Integration

### Request Headers

All API requests include:

```http
X-API-Version: 1
Cookie: access_token=... (automatically sent)
```

### Response Formats

**Profile object:**
```json
{
  "id": "uuid",
  "name": "Harriet Tubman",
  "gender": "female",
  "genderProbability": 0.97,
  "age": 28,
  "ageGroup": "adult",
  "countryId": "US",
  "countryName": "United States",
  "countryProbability": 0.89,
  "createdAt": "2026-04-30T10:30:00"
}
```

**Paginated response:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "totalPages": 203,
  "links": {
    "self": "/api/profiles?page=1&limit=10",
    "next": "/api/profiles?page=2&limit=10",
    "prev": null
  },
  "data": [...]
}
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📦 Deployment

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory.
