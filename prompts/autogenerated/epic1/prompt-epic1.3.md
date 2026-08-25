# Prompt 3 — Frontend Scaffold

## Role
You are a senior frontend TypeScript engineer specialised in React SPAs with role-based UIs, authentication flows, and mobile-first responsive design. You build clean, well-structured frontend foundations with TailwindCSS v4.

## Context
This is the third prompt in a session series for building a Personal Training Management Platform. The backend infrastructure has ALREADY been set up (Express API with middleware, health check, and JWT auth stubs). You are building the frontend scaffold on top of an existing project.

**What already exists (do NOT re-create):**
- Root `biome.json`, `.env.example`, `docker-compose.yml`, `AGENTS.md`
- Full `backend/` with Prisma schema, Express middleware, health endpoint
- `/docs/` with PRD, architecture, API specs, epics, user stories

**What you need to create:** Complete React frontend with Vite, TypeScript, TailwindCSS v4, React Router, role-based layouts, AuthContext, API client, Login page, and placeholder pages for all role-specific views.

## Objective
Build the complete React frontend scaffold: Vite + TypeScript + TailwindCSS v4 setup, React Router with role-based layout switching (Admin sidebar, Coach sidebar, Coachee bottom nav), AuthContext for login/logout/user state, Axios API client with JWT interceptors, Login page, and placeholder pages for all role-specific views.

## Requirements

### 1. Frontend package.json

**File: `frontend/package.json`:**

```json
{
  "name": "coacher-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "biome check src/",
    "lint:fix": "biome check --write src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.62.0",
    "axios": "^1.7.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.3",
    "vite": "^6.0.3",
    "vite-plugin-pwa": "^0.21.1"
  }
}
```

### 2. Vite Configuration

**File: `frontend/vite.config.ts`:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Personal Training Platform",
        short_name: "Coacher",
        description: "Manage your training classes and schedule",
        theme_color: "#4A90D9",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### 3. TailwindCSS Configuration

**File: `frontend/tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        principiante: "#4A90D9",
        basico: "#50C878",
        intermedio: "#F5A623",
        avanzado: "#E67E22",
        experto: "#E74C3C",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**File: `frontend/postcss.config.js`:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 4. TypeScript Configuration

**File: `frontend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "outDir": "./dist",
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Root HTML

**File: `frontend/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#4A90D9" />
    <meta name="description" content="Personal Training Management Platform" />
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <title>Coacher — Personal Training</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 6. CSS Entry

**File: `frontend/src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 7. TypeScript Types

**File: `frontend/src/types/auth.ts`:**

```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  COACH = "COACH",
  COACHEE = "COACHEE",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**File: `frontend/src/types/api.ts`:**

```typescript
export interface ApiError {
  error: {
    code: string;
    message: string;
    ref: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 8. API Client

**File: `frontend/src/api/client.ts`:**

Create an Axios instance with:

```typescript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});
```

**Request interceptor:**
- Read `accessToken` from localStorage
- If present, add header `Authorization: Bearer {accessToken}`

**Response interceptor:**
- On 401 error: attempt to refresh the token via `POST /api/v1/auth/refresh`
  - Read `refreshToken` from localStorage
  - If refresh succeeds: store new tokens, retry the original request
  - If refresh fails: clear localStorage, redirect to `/login`
- On other errors: extract the error envelope and reject with a structured error
- On network error: reject with a user-friendly message

```typescript
// Response interceptor skeleton
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post("/api/v1/auth/refresh", { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
```

Export the client as default.

### 9. Auth API Hooks

**File: `frontend/src/api/auth.ts`:**

React Query hooks:

```typescript
import { useMutation } from "@tanstack/react-query";
import apiClient from "./client";
import type { LoginRequest, AuthResponse } from "@/types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return data;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
      return data;
    },
  });
}
```

### 10. Auth Context

**File: `frontend/src/context/AuthContext.tsx`:**

Create a React Context with `useReducer`:

**State shape:**

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Actions:** `LOGIN`, `LOGOUT`, `SET_LOADING`, `RESTORE_SESSION`

**Initial state:** `{ user: null, accessToken: null, isAuthenticated: false, isLoading: true }`

**Reducer:**
- `LOGIN`: set user, accessToken, isAuthenticated to true, isLoading to false
- `LOGOUT`: reset to initial state (isLoading false)
- `SET_LOADING`: set isLoading to the payload value
- `RESTORE_SESSION`: restore from stored tokens (check localStorage, call refresh endpoint)

**Provider behavior:**
- On mount (`useEffect`): check localStorage for existing tokens
  - If tokens exist: set isLoading true, call `/auth/refresh` to validate
  - If refresh succeeds: dispatch LOGIN with new tokens + user
  - If refresh fails: clear localStorage, dispatch LOGOUT
  - If no tokens: dispatch SET_LOADING(false)
- The provider wraps children with the context value

**Context value:**

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}
```

**`useAuth` hook:**

```typescript
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### 11. Protected Route Component

**File: `frontend/src/components/ProtectedRoute.tsx`:**

Route guard component:

```typescript
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
```

### 12. Layout Components

**File: `frontend/src/components/NotificationBell.tsx`:**

A bell icon button positioned in the header:

```typescript
import { useState } from "react";

interface NotificationBellProps {
  unreadCount?: number;
}

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications today
          </div>
        </div>
      )}
    </div>
  );
}
```

**File: `frontend/src/components/layouts/AdminLayout.tsx`:**

A layout with a left sidebar (desktop) and top header:

- Left sidebar (240px wide on desktop, collapsible hamburger on mobile):
  - App logo/title "Coacher" at top
  - Navigation links with SVG icons:
    - Today (link to `/admin/today`)
    - Calendar (link to `/admin/calendar`)
    - Coachees (link to `/admin/coachees`)
    - Coaches (link to `/admin/coaches`)
  - Active link has a highlighted background
- Top header bar:
  - Page title on the left
  - NotificationBell component on the right
  - User name display and logout button
- Main content area using `<Outlet />`
- Responsive: on mobile, sidebar becomes a hamburger drawer
- Full height layout with flex

**File: `frontend/src/components/layouts/CoachLayout.tsx`:**

Same as AdminLayout but the sidebar ONLY includes:
- Today (link to `/coach/today`)
- Calendar (link to `/coach/calendar`)
- Coachees (link to `/coach/coachees`)

No "Coaches" link (Coach role cannot access coach management per PRD section 3).

**File: `frontend/src/components/layouts/CoacheeLayout.tsx`:**

Mobile-first layout:

- Top header: NotificationBell + user name
- Main content: `<Outlet />`
- Fixed bottom navigation bar with 3 tabs:
  - Home (icon + "Home" label, link to `/coachee/home`)
  - Calendar (icon + "Calendar" label, link to `/coachee/calendar`)
  - Notifications (icon + "Notifications" label with badge, link to `/coachee/notifications`)
- Active tab has colored indicator (blue by default)
- Bottom nav is hidden on desktop, sidebar shown instead (or keep bottom nav on all sizes for consistency)

### 13. Login Page

**File: `frontend/src/pages/LoginPage.tsx`:**

Full login page with:

- Centered card layout with app logo/name "Coacher" at the top
- Subtitle: "Sign in to your account"
- Email input field:
  - Type email, required
  - Validation: must be valid email format
  - Shows error message below if invalid
- Password input field:
  - Type password, required, min 1 character
  - Shows error message below if invalid
- Submit button: "Sign In"
  - Shows loading spinner when submitting
  - Disabled during submission
- Error display area:
  - Shows API error messages in red
  - Shows validation errors inline next to fields
  - Generic "Invalid credentials" for auth failures (no email enumeration)
- On successful login:
  - Store accessToken and refreshToken in localStorage
  - Update AuthContext with user data
  - Redirect based on role:
    - ADMIN -> `/admin/today`
    - COACH -> `/coach/today`
    - COACHEE -> `/coachee/home`
- If already authenticated: redirect immediately to role-based home

Handle these states visually:

| State | Visual |
|-------|--------|
| Default | Clean form, "Sign In" button enabled |
| Loading | Button shows spinner + "Signing in...", inputs disabled |
| Validation error | Red text under specific field, form stays |
| API error (401) | Red banner "Invalid credentials" above form |
| Network error | Red banner "Unable to connect. Please try again." |
| Already logged in | Immediate redirect to role home |

### 14. Placeholder Pages

Create simple placeholder pages for every view. Each should show a centered heading and a brief description.

**Admin pages:**

- **`frontend/src/pages/admin/TodayPage.tsx`:**
  - Heading: "Today's Schedule"
  - Description: "Your classes and sessions for today will appear here."
  - Wrapped in AdminLayout via router

- **`frontend/src/pages/admin/CalendarPage.tsx`:**
  - Heading: "Calendar"
  - Description: "Manage your weekly class schedule here."

- **`frontend/src/pages/admin/CoacheesPage.tsx`:**
  - Heading: "Coachees"
  - Description: "View and manage your coachees here."

- **`frontend/src/pages/admin/CoachesPage.tsx`:**
  - Heading: "Coaches"
  - Description: "Manage coaching staff here."

**Coach pages:**

- **`frontend/src/pages/coach/TodayPage.tsx`:**
  - Heading: "Today's Schedule"
  - Description: "Your classes and sessions for today will appear here."

- **`frontend/src/pages/coach/CalendarPage.tsx`:**
  - Heading: "Calendar"
  - Description: "Manage your weekly class schedule here."

- **`frontend/src/pages/coach/CoacheesPage.tsx`:**
  - Heading: "Coachees"
  - Description: "View and manage your coachees here."

**Coachee pages:**

- **`frontend/src/pages/coachee/HomePage.tsx`:**
  - Heading: "Home"
  - Description: "Your next class and available sessions will appear here."
  - Has a placeholder section for "Next Class" widget and "Joinable Classes" list

- **`frontend/src/pages/coachee/CalendarPage.tsx`:**
  - Heading: "Calendar"
  - Description: "Your class schedule will appear here."

- **`frontend/src/pages/coachee/NotificationsPage.tsx`:**
  - Heading: "Notifications"
  - Empty state: "No notifications yet" with a bell icon

**Shared pages:**

- **`frontend/src/pages/NotFoundPage.tsx`:**
  - Heading: "404 — Page Not Found"
  - Description: "The page you are looking for does not exist."
  - "Go to Home" button linking to role-appropriate home

- **`frontend/src/pages/UnauthorizedPage.tsx`:**
  - Heading: "403 — Access Denied"
  - Description: "You do not have permission to view this page."
  - "Go to Home" button linking to role-appropriate home

### 15. App Router

**File: `frontend/src/App.tsx`:**

Configure React Router v6 with the following routes:

```typescript
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";

// Layouts
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CoachLayout } from "@/components/layouts/CoachLayout";
import { CoacheeLayout } from "@/components/layouts/CoacheeLayout";

// Pages
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

// Admin pages
import { AdminTodayPage } from "@/pages/admin/TodayPage";
import { AdminCalendarPage } from "@/pages/admin/CalendarPage";
import { AdminCoacheesPage } from "@/pages/admin/CoacheesPage";
import { AdminCoachesPage } from "@/pages/admin/CoachesPage";

// Coach pages
import { CoachTodayPage } from "@/pages/coach/TodayPage";
import { CoachCalendarPage } from "@/pages/coach/CalendarPage";
import { CoachCoacheesPage } from "@/pages/coach/CoacheesPage";

// Coachee pages
import { CoacheeHomePage } from "@/pages/coachee/HomePage";
import { CoacheeCalendarPage } from "@/pages/coachee/CalendarPage";
import { CoacheeNotificationsPage } from "@/pages/coachee/NotificationsPage";
```

Route configuration should be:

```
/login                    -> LoginPage (public)
/unauthorized             -> UnauthorizedPage (public)

/admin                    -> ProtectedRoute (ADMIN only) -> AdminLayout
  /admin/today            -> AdminTodayPage
  /admin/calendar         -> AdminCalendarPage
  /admin/coachees         -> AdminCoacheesPage
  /admin/coaches          -> AdminCoachesPage

/coach                    -> ProtectedRoute (COACH only) -> CoachLayout
  /coach/today            -> CoachTodayPage
  /coach/calendar         -> CoachCalendarPage
  /coach/coachees         -> CoachCoacheesPage

/coachee                  -> ProtectedRoute (COACHEE only) -> CoacheeLayout
  /coachee/home           -> CoacheeHomePage
  /coachee/calendar       -> CoacheeCalendarPage
  /coachee/notifications  -> CoacheeNotificationsPage

/                         -> RootRedirect (redirects to role-based home or /login)
*                         -> NotFoundPage
```

**Root redirect logic:**
- If authenticated as ADMIN: redirect to `/admin/today`
- If authenticated as COACH: redirect to `/coach/today`
- If authenticated as COACHEE: redirect to `/coachee/home`
- If not authenticated: redirect to `/login`

Wrap the router in a `RouterProvider` and export as default.

### 16. Application Entry Point

**File: `frontend/src/main.tsx`:**

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import App from "@/App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

## Constraints
- Do NOT implement any business logic (no class creation, enrollment, waiting lists, or real calendar data)
- Do NOT connect to real backend auth endpoints yet (the LoginPage should work with stub data if backend is not running — but write it as if connecting to real endpoints)
- Mobile-first for Coachee layouts, desktop-first for Admin/Coach
- All components must handle loading, empty, and error states
- Use TailwindCSS utility classes exclusively (no separate CSS files except index.css)
- Export all components as named exports for consistency
- TypeScript strict mode everywhere

## Output Expectations
After this prompt, running `npm run dev` from the `frontend/` directory should:

1. Start Vite dev server on port 5173 (with proxy to backend on 3001)
2. `GET http://localhost:5173/` — redirects to `/login` if not authenticated
3. Login page renders with email/password form, validation, loading, and error states
4. `GET http://localhost:5173/admin/today` — redirects to login (not authenticated)
5. All placeholder pages render with correct layout and navigation
6. `GET http://localhost:5173/unauthorized` — renders "403 Access Denied" page
7. `GET http://localhost:5173/nonexistent` — renders "404 Not Found" page
8. `npx tsc --noEmit` passes with no TypeScript errors

Do NOT leave anything as a TODO. Generate complete, working code for every file.
