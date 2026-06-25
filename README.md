
# StudyCircle v2

A collaborative learning platform built for B.Tech and degree students across Andhra Pradesh and Telangana — bringing study groups, peer doubt-solving, shared notes, and live progress tracking into one real-time workspace.

**Live App:** [studycircle-v2.vercel.app](https://studycircle-v2.vercel.app)

---

## Overview

StudyCircle v2 lets students form study groups, post and resolve doubts, share notes, track progress, and collaborate in real time with role-based access for students, mentors, and admins. It was built and shipped end-to-end by a 3-member team, from system design through production deployment.

## Features

- **Authentication & Security** — JWT-based auth with Google OAuth, bcrypt password hashing, and rate-limited endpoints
- **Study Groups & Workspaces** — create or join collaborative workspaces scoped to subjects or courses
- **Doubt Resolution** — post academic doubts and get peer/mentor responses in a structured thread
- **Notes Sharing** — upload and share notes within groups, with a separate shared-notes layer for public access
- **Real-Time Collaboration** — Socket.io-powered live sessions, notifications, and presence updates
- **Progress Tracking** — per-student progress dashboards for self-paced and group learning
- **Role-Based Views** — distinct dashboards for students, mentors, and admins

## Tech Stack

**Frontend**
- Next.js 15 · React 19 · TypeScript
- Tailwind CSS, Framer Motion
- Socket.io Client, Google OAuth (`@react-oauth/google`)

**Backend**
- Node.js · Express
- PostgreSQL with Sequelize ORM (SQLite for local development)
- Socket.io for real-time events
- JWT + Google OAuth, bcrypt, express-rate-limit

**Infrastructure**
- Frontend deployed on **Vercel**
- Backend deployed on **Render**

## Architecture

```
studycircle-v2/
├── frontend/          Next.js 15 app (App Router)
│   └── src/app/
│       ├── admin/      Admin dashboard
│       ├── mentor/      Mentor views
│       ├── student/     Student dashboard
│       ├── group/       Study group pages
│       ├── workspace/   Collaborative workspace
│       └── api/         Next.js API routes
│
├── backend/           Express API + Socket.io server
│   └── routes/
│       ├── auth.js          Authentication & OAuth
│       ├── groups.js        Study group management
│       ├── doubts.js        Doubt posting & resolution
│       ├── notes.js         Notes upload/sharing
│       ├── sharedNotes.js   Public shared notes
│       ├── progress.js      Progress tracking
│       ├── sessions.js      Live session management
│       └── notifications.js Real-time notifications
│
└── render.yaml         Render deployment config
```

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL (or SQLite for local dev)

### Backend setup
```bash
cd backend
npm install
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Create `.env` files in both `backend/` and `frontend/` with the required environment variables (database connection string, JWT secret, Google OAuth credentials, etc.).

## Team

Built by **Swathi (Team Lead)**, **Bhagya Lakshmi**, and **RathnaRekha** — 3rd-year B.Tech students at Aditya College of Engineering & Technology (ACET), Surampalem.

## License

This project is for academic and portfolio purposes.
