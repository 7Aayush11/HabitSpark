# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# HabitSpark – Frontend

HabitSpark is a habit tracking application focused on consistency, motivation, and privacy. It provides a clean, responsive interface to create and manage habits, record check-ins, view analytics, and track milestones — with client-side encryption for habit titles.

## Overview
- Create, edit, delete, and check-in to habits
- View streaks, goals, and milestones in a dedicated modal
- Analyze progress with charts for per-habit check-ins, trend lines, and best/worst days
- Calendar view to visualize check-ins over time
- Profile panel with user stats and lightweight achievements
- Client-side encryption for habit titles using AES-GCM (backward compatible)

## Tech Stack
- `React` (Vite) for the SPA
- `TailwindCSS` for styling
- `axios` for API requests
- `chart.js` + `react-chartjs-2` for charts
- `framer-motion` for UI animations
- `file-saver` for CSV export

## Architecture
The frontend communicates with a Node/Express backend via REST APIs under `/api`. Sensitive habit titles are encrypted on the client before being sent to the server.

Key directories:
- `src/components/` – UI components (Dashboard, HabitList, AnalyticsPanel, CalendarPanel, ProfilePanel, forms)
- `src/utils/crypto.js` – AES-GCM helpers for encryption/decryption
- `src/api/config.js` – Centralized API base URL sourced from `VITE_API_URL`

## Security & Privacy
- Habit titles are encrypted client-side using AES-GCM before storage and transport.
- Ciphertext format: `v1:<base64-iv>:<base64-ciphertext>`.
- Decryption occurs in the browser using a key persisted in `localStorage`.
- Backward compatible: plaintext titles continue to render.

Limitations:
- The encryption key is device-local and not synced; cross-device access requires additional key management.
- Only habit titles are encrypted by default; other fields are plaintext.

## Environment Variables
Frontend consumes the backend via a configurable base URL. Set the following env var:
- `VITE_API_URL` – The backend API base URL (e.g., `https://your-backend.onrender.com/api`).

The frontend imports this via `src/api/config.js`:
```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
```

## Getting Started (Local)
Prerequisites:
- Node.js 18+
- A running backend (see backend README) at `http://localhost:4000`

Install and run:
- `npm install`
- Set `VITE_API_URL=http://localhost:4000/api` in a `.env` file or environment
- `npm run dev` to start the Vite dev server (defaults to `http://localhost:5173`)

Common scripts:
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview built assets locally

## Deployment (Render)
Deploy as a separate static site (or Node service for SSR) and point it to your backend service.

Required configuration:
- Frontend env: `VITE_API_URL=https://<your-backend>.onrender.com/api`
- Backend env: `CLIENT_URL=https://<your-frontend>.onrender.com`

Steps:
1. Create a Render Web Service for the backend and set env vars.
2. Create a Render Static Site or Web Service for the frontend.
3. Set `VITE_API_URL` in the frontend service to your backend API URL.
4. Verify browser console shows no CORS errors; test login, habit creation, check-ins, analytics, calendar.

## API Base URL & CORS
- All components now import `API_URL` from `src/api/config.js`—no hardcoded `localhost` references.
- Backend uses a whitelist for CORS (`CLIENT_URL` + local dev origins) and allows credentials.

## Features in Detail
- Habit management: add, edit, delete, check-in
- Milestones: modal panel with streak milestones and goal progress
- Analytics: per-habit bars, time-series trends, best/worst days, most consistent habit
- Calendar: month grid with check-ins, streak highlighting, habit dropdown
- Profile: level, title, aura points, achievements, editable user details
- CSV export: downloadable check-in data

## Mobile Responsiveness
- Designed with responsive Tailwind utilities.
- Known small-screen improvements: consolidate top bar actions, consider bottom navigation or sheet for panels.

## Troubleshooting
- CORS error: ensure `CLIENT_URL` matches the frontend URL and `VITE_API_URL` points to the backend `/api`.
- Unauthorized (401): confirm a valid JWT is stored in `localStorage` as `token`.
- Charts not rendering: verify analytics endpoints are reachable and returning data.
- Encrypted titles show garbled text: confirm encryption is enabled on creation and the same device key exists in `localStorage`.

## Roadmap
- Password-derived keys for cross-device encryption access
- Expand encryption to other sensitive fields
- Refresh tokens and stricter auth policies
- Enhanced mobile navigation and accessibility

---
This README documents the frontend. See the backend directory for server setup and additional security measures (Helmet, rate limiting, Prisma, authentication).

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
