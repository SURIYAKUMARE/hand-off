# HelpDesk 360 — Enterprise IT Service Management

A production-grade, full-stack Enterprise IT Service Management (ITSM) web application engineered with the information density, visual discipline, and interaction quality of Linear, Zendesk, and Jira Service Management.

HelpDesk 360 manages employee IT requests, technician triage queues, role-enforced assignment workflows, strict status state machines, service-level agreement (SLA) monitoring, and live operational dashboard analytics.

---

## 📸 Screen Previews & Design System

All 39 high-resolution screen captures across **1440px Desktop**, **1024px Laptop/Tablet**, and **768px Tablet** are automatically generated and saved in `docs/screenshots/`.

| Screen | Desktop (1440px) | Description |
| :--- | :--- | :--- |
| **Login** | `docs/screenshots/01_login_1440px.png` | Quiet split layout, neutral brand panel, demo account shortcuts |
| **Employee Tickets** | `docs/screenshots/02_employee_my_tickets_1440px.png` | Scoped ticket table, status tabs, compact rows, pagination |
| **New Ticket Form** | `docs/screenshots/03_employee_new_ticket_1440px.png` | Live character counter (0/2000), inline field validations, commitment notice |
| **Employee Detail** | `docs/screenshots/04_employee_ticket_detail_1440px.png` | Read-only permissions, full activity timeline, discussion thread |
| **Support Queue** | `docs/screenshots/05_technician_support_queue_1440px.png` | Multi-filter toolbar, urgent row highlights, inline assignment, SLA badges |
| **Technician Detail** | `docs/screenshots/06_technician_ticket_detail_1440px.png` | Technician action panel, strict sequential state transitions, comments |
| **Dashboard** | `docs/screenshots/07_technician_dashboard_1440px.png` | 4 KPI cards (28px metrics), Recharts status bar & priority donut, workload table |
| **Design System** | `docs/screenshots/16_design_system_tokens_1440px.png` | Centralized token showcase, all button & input variants, modal triggers |

---

## 🏛 Architecture & Tech Stack

```
helpdesk-360/
├── shared/                 # Monorepo shared package (Zod schemas, TypeScript types, SLA constants)
├── backend/                # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma             # Primary Prisma schema (SQLite dev / PostgreSQL prod)
│   │   ├── schema.postgresql.prisma  # PostgreSQL production schema with native enums & indexes
│   │   └── seed.ts                   # Deterministic idempotent seed script
│   └── src/
│       ├── middleware/     # Auth, RBAC, Rate Limiting, Validation, Error Handling
│       ├── routes/         # Auth, Tickets, Comments, Dashboard, Users, Health
│       └── services/       # Ticket number generator, status state machine, SQL aggregates
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
│   ├── src/
│   │   ├── components/     # AppShell, Sidebar, Topbar, DataTable, Chips, Skeletons, Modals
│   │   ├── context/        # AuthContext, ToastContext
│   │   └── pages/          # Login, MyTickets, NewTicket, SupportQueue, Detail, Dashboard
├── tests/                  # Playwright end-to-end tests & automated multi-viewport screen captures
├── docs/screenshots/       # 39 verified screenshots exported at 1440px, 1024px, 768px
└── docker-compose.yml      # Multi-container production deployment (PostgreSQL 16 + Backend + Nginx Frontend)
```

### Technology Highlights
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, React Hook Form, Zod, Lucide React, Recharts.
- **Backend**: Node.js v22+, TypeScript, Express.js, Prisma ORM 5, bcryptjs, cookie-parser, express-rate-limit.
- **Database**:
  - Local Zero-Config Persistence: SQLite (`dev.db`) with complete ACID transactions and foreign key enforcement.
  - Production / Docker Deployment: PostgreSQL 16 Alpine (`postgres:16-alpine`) with native database enums and relational indexes.
- **Session Security**: Server-managed database sessions, HTTP-only secure cookies (`helpdesk360_sid`), IP-based login rate limiting, and RBAC middleware.

---

## 🔑 Demo Credentials

Development seeds include pre-configured accounts (Password for all accounts: `Password123!`):

| Role | Name | Email | Purpose |
| :--- | :--- | :--- | :--- |
| **Employee** | Priya Nair | `priya.nair@helpdesk.local` | Request reporting, ticket tracking, employee comments |
| **Employee** | Kavya Raman | `kavya.raman@helpdesk.local` | Secondary requester for role scoping verification |
| **Technician** | Arjun Mehta | `arjun.mehta@helpdesk.local` | Triage queue, ticket assignment, status progression, metrics |
| **Technician** | Rahul Menon | `rahul.menon@helpdesk.local` | IT technician allocations |
| **Technician** | Neha Sharma | `neha.sharma@helpdesk.local` | IT technician allocations |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Library & Setup Database
```bash
npm run build -w shared
npm run db:setup
```
*This command runs Prisma push to initialize tables and indexes, followed by the deterministic seed script populating users and realistic tickets across all categories, priorities, and statuses.*

### 3. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend application: **http://localhost:5173**
- Backend API & Health check: **http://localhost:4000/api/health**

---

## 🧪 Testing & Verification

### Run Backend Integration Tests (Vitest + Supertest)
```bash
npm run test
```
Executes 30 automated integration tests verifying:
- Authentication & session cookie lifecycle
- Role scoping (Employees cannot access others' tickets or technician endpoints)
- Technician triage filtering & search
- Strict status state machine transitions (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`)
- Real database aggregates and KPI calculation parity
- Data persistence and relationship survival across client restarts

### Run Multi-Viewport Playwright Screen Exports
```bash
npm run screenshots -w tests
```
Runs headless Chromium across:
- **1440px** Reference Desktop
- **1024px** Laptop / Tablet
- **768px** Tablet

---

## 🐳 Docker Deployment

To launch the full production environment using Docker Compose:

```bash
docker compose up -d --build
```

Services started:
1. `helpdesk360_postgres`: PostgreSQL 16 on port `5432` with healthcheck.
2. `helpdesk360_backend`: Production Node.js backend on port `4000`.
3. `helpdesk360_frontend`: Nginx serving optimized static assets and proxying `/api` requests on port `5173`.

---

## ⚡ Offline-First Architecture & PWA Caching

HelpDesk 360 is equipped with full offline capability, allowing users to continue working seamlessly through connectivity drops or field environments:

1. **Service Worker (`sw.js`) & App Shell Caching**:
   - Implements stale-while-revalidate for static assets (`index.html`, bundle scripts, fonts, stylesheets).
   - Network-first strategy with cache fallback for `/api/` GET requests (e.g. ticket lists and dashboards).
2. **Persistent Outbox Engine (`syncEngine.ts`)**:
   - Mutations made while disconnected (`CREATE_TICKET`, `ADD_COMMENT`, `UPDATE_STATUS`, `ASSIGN_TECHNICIAN`) are safely persisted in `localStorage` (`helpdesk360_sync_outbox`).
   - Browser refreshes or tab reloads do not discard pending offline changes.
3. **Optimistic Ticket Creation & "Pending Sync" Badging**:
   - Creating a ticket offline immediately assigns a placeholder ticket identifier (e.g. `HD-PENDING-4819`) and places the ticket at the top of the ticket table with a distinctive amber `Pending` chip.
   - Comments posted offline are rendered immediately in the discussion thread with a `Pending sync` tag.
4. **Reactive Topbar & Non-Intrusive Offline Banner**:
   - Topbar badge dynamically changes:
     - 🟢 **Online / System Healthy**
     - 🔵 **Syncing (X)...** (with animated spinner)
     - 🟠 **Offline (X pending / Cached)**
   - Linear-style calm banner notifies the user of disconnected mode and provides a one-click manual **"Sync now"** trigger once connection is restored.
5. **Automatic Background Reconciliation**:
   - Window `online` event listener paired with a 20-second background heartbeat (`/api/health`) automatically drains the outbox, persists records to the backend database, updates cache references, and dispatches toast confirmation.

---

## 🛡 Design Token System & Interaction Quality

- **Theme**: Light theme only (`#F7F8FA` background, `#FFFFFF` surfaces).
- **Brand Accent**: `#3B3FD9` Deep Indigo (primary buttons, active tabs, focus rings).
- **Semantic Priorities**:
  - Urgent: `#D92D20` (Badge: `#FEF3F2`, Border: `#FECDCA`, Text: `#B42318`)
  - High: `#F79009` (Badge: `#FFFAEB`, Border: `#FEDF89`, Text: `#B54708`)
  - Medium: `#2E90FA` (Badge: `#EFF8FF`, Border: `#B2DDFF`, Text: `#175CD3`)
  - Low: `#667085` (Badge: `#F8F9FC`, Border: `#EAECF0`, Text: `#344054`)
- **Semantic Statuses**:
  - Open: Blue
  - In Progress: Amber
  - Resolved: Green
  - Closed: Grey
- **SLA Thresholds**:
  - Urgent: 4 hours (Warning at 3h)
  - High: 8 hours (Warning at 6h)
  - Medium: 24 hours (Warning at 18h)
  - Low: 48 hours (Warning at 36h)
- **Typography**: Inter font family, 20px page headers, 28px numerical metrics, 13/14px body, 12px secondary labels.
- **Spacing**: 8px modular spacing system (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Transitions**: 120ms–180ms subtle feedback transitions. No decorative animations or gradients.
