# HelpDesk 360 — Enterprise IT Service Management (ITSM) Platform

A production-grade, full-stack Enterprise IT Service Management (ITSM) platform engineered with the information density, visual discipline, and interaction quality of Linear, Zendesk, and Jira Service Management.

HelpDesk 360 automates employee IT requests, technician triage queues, role-enforced assignment workflows, strict status state machines, service-level agreement (SLA) monitoring, live operational dashboard analytics, AI-assisted ticket classification, and executive PDF/CSV reporting.

---

## 🏛 Architecture & Tech Stack

```
helpdesk-360/
├── shared/                 # Monorepo shared package (Zod schemas, TypeScript types, SLA constants)
│   └── src/
│       ├── types.ts        # Comprehensive database & API contracts
│       ├── schemas.ts      # Strict runtime Zod validation schemas
│       └── constants.ts    # Design tokens, status configurations, SLA policy metrics
├── backend/                # Express REST API, Prisma ORM, SQLite/PostgreSQL
│   ├── prisma/             # Schema definitions, migrations, and seed scripts
│   └── src/
│       ├── middleware/     # Stateless HMAC session auth, RBAC, Rate-limiting, Zod validation
│       ├── routes/         # Tickets, Admin, Auth, Notifications, Knowledge Base, Assets, Reports
│       └── services/       # SLA Escalation runner, AI classification, Email dispatcher, PDF generator
├── frontend/               # React 18, Vite, Tailwind CSS, TanStack Query, Recharts
│   └── src/
│       ├── api/            # Authenticated Axios/fetch client with dual-transport tokens
│       ├── components/     # Enterprise design system (PageHeader, Modal, NotificationCenter, AI Assistant)
│       ├── context/        # Auth, Theme (Light/Dark), Network status, Toast notifications
│       └── pages/          # Employee, Technician, and Admin portal screens
```

---

## 🚀 Eight Core Enterprise Features

### 1. Intelligent Automatic Ticket Assignment
- Deterministically matches incoming support tickets to active, available technicians (`status: 'AVAILABLE'`).
- Prioritizes domain specialists matching the ticket category (`HARDWARE`, `NETWORK`, `SOFTWARE`, `ACCOUNT_ACCESS`).
- Optimizes workload distribution by assigning tickets to eligible technicians with the lowest active ticket count.
- Fast-paths `URGENT` tickets and dispatches instant real-time notifications to on-call engineers.
- Configurable via admin toggle (`PATCH /api/admin/automations/:id/toggle`) with full event audit history.

### 2. Multi-Channel Notifications (In-App, SSE, Web Push, Email)
- **In-App Notification Center**: Dropdown drawer with unread counter, filter toggles, read/unread states, and physics-animated bell.
- **Server-Sent Events (SSE)**: Real-time unidirectional streaming (`GET /api/notifications/stream`) keeping client queues in sync.
- **Web Push**: W3C-standard Push Notification API support (`/api/notifications/push/subscribe`) with VAPID key exchange.
- **Email Dispatch Service**: Responsive enterprise HTML email templates for ticket creation, reassignment, status changes, resolution, and SLA warnings with transactional delivery logging.

### 3. Automatic Ticket Escalation & SLA Breach Detection
- Automated background worker calculates deadlines using server timestamps:
  * **Urgent**: 4-hour resolution target
  * **High**: 8-hour resolution target
  * **Medium**: 24-hour resolution target
  * **Low**: 48-hour resolution target
- **SLA Warning**: Tickets within 60 minutes of breach trigger early warning notifications to assigned technicians.
- **SLA Breach & Auto-Escalation**: Overdue tickets are automatically bumped in priority, marked with `isEscalated: true`, recorded with an `ESCALATED` audit event, and escalated to all system administrators.
- Prevents duplicate escalation triggers via deterministic event state checks.

### 4. Employee Satisfaction Ratings (CSAT)
- Allows employees to rate resolved or closed tickets on a 1–5 star scale with optional written feedback.
- Prevents duplicate submissions by locking the rating form upon submission and showing the recorded score.
- Computes real-time average CSAT, technician leaderboard statistics, and satisfaction rating distributions in the Admin Dashboard and Analytics views.

### 5. Complete Admin Management Panel
- **User Management**: Create/edit accounts, activate/suspend users, assign departments, role administration (`ADMIN`, `TECHNICIAN`, `EMPLOYEE`), and bulk CSV user import.
- **Technician Management**: Set technician status (`AVAILABLE`, `BUSY`, `UNAVAILABLE`), assign specialization domains, set max concurrent ticket capacities, and reassign tickets.
- **System Administration**: Configure SLA target minutes, toggle automation rules, inspect comprehensive audit logs, and review operational system health.

### 6. Knowledge Base & Self-Service FAQ
- Searchable self-service documentation portal categorized by hardware, network, software, and account access.
- Step-by-step troubleshooting guides with view counter tracking and admin publishing controls.
- **Live Ticket Creation Suggestions**: As employees enter their ticket title and description in `NewTicket.tsx`, the system recommends relevant knowledge base articles to resolve issues before submission.

### 7. AI-Powered Ticket Categorization & Recommendations
- Neural/heuristic categorization engine (`POST /api/tickets/ai-suggest`) analyzing ticket titles and descriptions.
- Auto-detects recommended category, suggests appropriate priority level, and identifies urgent critical incidents.
- Emits actionable quick troubleshooting actions and plain-English rationales.
- Includes an interactive **AI Smart Assistant Card** in the ticket creation form with one-click "Apply" actions and safety confirmation dialogs for Urgent priority.
- Fallback resilience: Operates reliably with zero external API dependencies or network latency bottlenecks.

### 8. CSV and Professional PDF Report Export
- Multi-filter reporting center filtering by date range, department, technician, priority, and status.
- **CSV Export**: Standardized comma-separated export formatted for Excel, Google Sheets, or PowerBI.
- **PDF Export**: Standards-compliant binary PDF generation conforming to the PDF-1.4 specification (`GET /api/admin/reports/export-pdf`), including executive summary KPIs, operational charts, and tabular ticket ledger.

---

## 🔑 Default Enterprise Demo Personas

| Role | Name | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Vikram Aditya | `admin@helpdesk.local` | `Password123!` | System configuration, SLAs, user directory, audit logs, PDF exports |
| **Admin** | Meera Patel | `meera.patel@helpdesk.local` | `Password123!` | Global administrative oversight, policy toggles |
| **Technician** | Arjun Mehta | `arjun.mehta@helpdesk.local` | `Password123!` | Hardware specialist, support queue triage, ticket lifecycle updates |
| **Technician** | Rahul Menon | `rahul.menon@helpdesk.local` | `Password123!` | Network engineering specialist, ticket reassignment, internal notes |
| **Technician** | Neha Sharma | `neha.sharma@helpdesk.local` | `Password123!` | Software applications specialist, SLA breach resolution |
| **Technician** | David Chen | `david.chen@helpdesk.local` | `Password123!` | Account access & security identity specialist |
| **Employee** | Priya Nair | `priya.nair@helpdesk.local` | `Password123!` | Engineering department employee, ticket creation, CSAT feedback |
| **Employee** | Kavya Raman | `kavya.raman@helpdesk.local` | `Password123!` | Marketing employee, self-service knowledge base access |
| **Employee** | Rohan Verma | `rohan.verma@helpdesk.local` | `Password123!` | Sales department employee, asset tracking |

---

## 🛠 Local Setup & Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Quickstart
```bash
# 1. Install root dependencies
npm install

# 2. Setup SQLite database, run migrations, and seed demo records
npm run db:setup
npm run db:seed

# 3. Start development servers (Backend on :3001, Frontend on :5173)
npm run dev
```

### Production Build & Test Execution
```bash
# Run complete automated backend test suite (44 vitest specs across 6 test files)
npm test

# Build frontend and backend production bundles
npm run build
```

---

## 🚢 Docker & Production Deployment

### Docker Compose
```bash
# Build and run complete stack via Docker Compose
docker compose up --build -d
```

### Vercel Serverless Deployment
The repository includes native Vercel configuration (`vercel.json`) with stateless HMAC-SHA256 session token verification (`generateSignedToken` and `verifySignedToken`) and an automatic fallback database seed (`production-seed.db` to `/tmp/dev.db`) designed for AWS Lambda/Vercel serverless containers.

Live Production URL: **`https://helpdesk-360.vercel.app`**
