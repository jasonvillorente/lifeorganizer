# AI-Based Digital Life Organizer

## Project Structure

### Backend (`/server.ts` and `/server/`)
- `server.ts`: Entry point, Express + Vite middleware.
- `server/db.ts`: SQLite database initialization.
- `server/auth.ts`: JWT & Bcrypt authentication logic.
- `server/routes/`: API endpoints for tasks, analytics, and users.
- `server/logic/`: Rule-based AI productivity algorithms.

### Frontend (`/src/`)
- `src/components/`: Reusable UI components (Button, Input, Card, etc.).
- `src/pages/`: Main views (Login, Signup, Dashboard, Tasks, Analytics, Insights).
- `src/context/`: Auth context for session management.
- `src/hooks/`: Custom hooks for API calls.
- `src/utils/`: Formatting and helper functions.
- `src/App.tsx`: Routing and layout.
