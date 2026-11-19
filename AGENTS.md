# HelpDesk 360

This repository (`hand-off`) contains HelpDesk 360, an IT service desk for employees, technicians, and administrators. Run npm workspace commands from the repository root.

## Where to work

| Path | Responsibility |
| --- | --- |
| `frontend/` | React, Vite, and Tailwind UI. Routes are in `src/App.tsx`, API calls in `src/api/client.ts`, and reusable controls in `src/components/`. |
| `backend/` | Express API. `src/app.ts` mounts routes, `src/middleware/` handles authentication and authorization, and `src/services/` contains ticket and dashboard logic. |
| `shared/` | Shared TypeScript types, Zod request schemas, status transitions, and SLA configuration. |
| `backend/prisma/` | SQLite schema for local development, PostgreSQL schema for Docker, and local seed data. |
| `tests/` | Playwright browser checks and screenshot generation. Backend integration tests live in `backend/src/tests/`. |
| `api/`, `vercel.json`, `Dockerfile.*`, `docker-compose.yml` | Deployment entry points and configuration. The current Vercel handler loads the compiled Express app and uses temporary SQLite storage. Docker Compose targets PostgreSQL. |

## Change guidelines

- Enforce access in the Express routes and services. Use the existing authentication and role middleware, preserve employee ticket ownership checks, and apply the same visibility rules to attachments, notifications, and exports.
- Keep ticket assignment, status transitions, and SLA calculations in existing services and `shared/src/constants.ts`. When changing a ticket mutation, check its effects on ticket history, notifications, and dashboard counts. Where a mutation can be replayed, check that it does not create duplicate records or side effects.
- Update the shared Zod schema and TypeScript types together when changing an API contract. Check the Express route, frontend API client, and affected React Query cache updates. Preserve routing for both direct `/api` requests and paths forwarded by the serverless handler.
- Review both Prisma schemas when changing data models. Account for existing records, regenerate the client for the database in use, and update local seed or test fixtures when the schema requires it. Run setup and seed commands against local development data.
- Reuse existing UI components and theme styles. For affected screens, check loading, empty, error, and permission states. For ticket mutations, also check `frontend/src/offline/syncEngine.ts` and `frontend/public/sw.js` where offline behavior is affected.

## Setup and verification

| Command | Use |
| --- | --- |
| `npm ci` | Install dependencies from the root lockfile. |
| `npm run build -w shared` | Compile workspace contracts before running local services or backend tests. |
| `npm run db:setup` | Initialize and seed the local SQLite database. |
| `npm run dev` | Start Vite on port 5173 and the Express API on port 4000. |
| `npm run test` | Run backend integration tests with Vitest and Supertest. |
| `npm run build` | Build shared, backend, and frontend workspaces. |
| `npm run test:e2e` | Run Playwright checks with the local app running and Chromium installed. |

Use the checks relevant to the change. For API or workflow changes, run the backend suite. For frontend or shared contract changes, run the workspace build and exercise the affected screens. The Playwright checks can regenerate files under `docs/screenshots/`.
