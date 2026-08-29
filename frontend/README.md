# EduPredict — Big Data & Predictive Analytics for Education

A complete, role-based frontend for an education analytics platform, built with **React (Vite)** and **Tailwind CSS**. Every module described in the brief is implemented and interactive using realistic mock data — no backend required.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Demo accounts

Use the "Use demo credentials" link on the sign-in screen, or log in manually:

| Role          | Email                       | Password      |
|---------------|------------------------------|---------------|
| Administrator | admin@edupredict.edu         | admin123      |
| Teacher       | teacher@edupredict.edu       | teacher123    |
| Student       | student@edupredict.edu       | student123    |
| Analyst       | analyst@edupredict.edu       | analyst123    |

You can also sign up as a brand new account for any role from the Sign Up screen. Forgot-password flow uses a simulated 6-digit code: **123456**.

## What's included

- **Authentication** — Login, Signup, Forgot/Reset Password, role selection, simulated JWT stored in `localStorage`, logout.
- **Role-based dashboards** — Admin, Teacher, Student, Analyst, each with its own KPIs, charts, and feeds.
- **Management modules** — Students, Teachers, Courses, Departments, each with search, filters, pagination, and full add/edit/delete (CRUD) via modals.
- **Big data pipeline views** — Data Ingestion (drag-and-drop upload simulation with progress bars and validation history), HDFS Storage (capacity, file explorer), Spark Processing (start/stop controls, running/completed jobs, live streaming log console).
- **Real-time & intelligence** — Live activity view with auto-refresh toggle, Machine Learning Hub (model cards, tabbed prediction feeds with confidence/risk), Analytics Dashboard (line, bar, donut, scatter, and heatmap charts, all custom SVG).
- **Utilities** — Reports generator (PDF/Excel/CSV export simulation), Notification Center (filterable, markable as read), Support (tickets, feedback, bug reports), Settings (profile, password, theme, language).

## Notes on the implementation

- All data is generated client-side (`src/data/mockData.js`) so the app is fully explorable without any server. CRUD actions update in-memory React state via `DataContext` for the duration of the session.
- Authentication is simulated: tokens are base64-encoded JSON, not cryptographically signed. This demonstrates the login/session lifecycle for evaluation purposes, not production security.
- Charts are hand-built SVG components (no charting library dependency) so they're easy to restyle or extend.
- Dark mode is available from Settings (or the topbar toggle) and persists across reloads.
- Structure follows the requested layout: `src/components`, `src/pages`, `src/layouts`, `src/context`, plus `src/data` for mock data and `src/utils` for shared helpers (nav config).

## Project structure

```
src/
  context/       AuthContext, ThemeContext, DataContext
  layouts/       AuthLayout (split-screen), DashboardLayout (sidebar + topbar)
  components/    Sidebar, Topbar, DataTable, Modal, StatCard, Badges, RoleCard, Toast, charts/
  pages/
    auth/            Login, Signup, ForgotPassword, ResetPassword
    dashboards/      AdminDashboard, TeacherDashboard, StudentDashboard, AnalystDashboard
    management/      Students, Teachers, Courses, Departments
    bigdata/         DataIngestion, HDFSStorage, SparkProcessing
    realtime/        LiveView
    ml/              MLHub
    analytics/       AnalyticsDashboard
    utilities/       Reports, Notifications, Support, Settings
  data/          mockData.js — all generated data
  utils/         nav.js — role-based navigation config
```
