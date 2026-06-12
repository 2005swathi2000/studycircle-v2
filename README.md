# StudyCircle — Collaborative Learning Workspace

**StudyCircle** is a structured, collaborative study ecosystem designed specifically for B.Tech, engineering, and degree college students in Andhra Pradesh and Telangana (Vijayawada, Guntur, Vizag, and Hyderabad clusters). 

It bridges the gap between solitary study and group learning by introducing a three-tier system connecting **Students**, **Mentors**, and **Administrators** in real-time.

---

## 🎯 Core Project Objectives
* **Resolve Student Isolation**: Convert lonely study sessions into group accountability boards.
* **Drive Placement Readiness**: Foster peer support, mock schedules, and doubt solving in core computer science subjects (DBMS, OS, DSA, CN).
* **Direct Mentor Engagement**: Allow college guides/teachers to publish notes, hold cohorts, and directly nudge lagging students to recover consistency.

---

## 🚀 Key Features & Modules

### 1. Distraction-Free Co-Studying Rooms (Live Lounges)
* Virtual group desks where students co-study in silence with real-time ticking presence timers.
* Peer logs show active session study duration.

### 2. Doubt-Solving Arena
* Integrated StackOverflow-style Q&A board inside circles.
* Peers and mentors can answer questions. Students can accept the best answer to close the doubt.

### 3. Shared Notes Repository
* Structured folder organization where mentors/admins upload and publish verified study guides, syllabus frameworks, and lecture sheets.
* Students can view, search, and download PDFs.

### 4. Interactive Schedules (Sessions)
* Calendar schedules of live reviews, exam revisions, and mentor office hours with ticking countdown alarms.

### 5. Gamified Streaks & Progress Circles
* Tracks weekly study hours against target goals, consistent streak days (flame indicators), and awards levels based on study logs.

---

## 👥 Three-Tier Role System

### 👨‍🎓 Student Role
* **My Learning Space**: View consistency statistics, streaks, and weekly progress.
* **Join Circles**: Browse and join university study groups.
* **Live Study**: Join audio lounges and co-study.
* **Doubt Resolver**: Ask questions and help peers.

### 👨‍🏫 Mentor Role
* **Classroom Command Center**: Monitor overall attendance benchmarks and community engagement.
* **Lagging Student Nudges**: Check which students have dropping study logs and click "Nudge" to send a focus reminder.
* **Resource Publisher**: Upload verified files (lectures, exams, syllabus guides).
* **Schedule Creator**: Plan upcoming study sessions on students' calendars.

### 🛡️ Admin Role
* **Platform Monitor**: Audit system health, total active circles, and data sizes.
* **Coordinator Approvals Console**: Verify and approve newly registered Mentors/Admins before they can access platform controls.

---

## 💻 Tech Stack
* **Frontend**: Next.js 15 (App Router), React, TailwindCSS, Lucide Icons, HTML/JS.
* **Backend**: Node.js, Express, SQLite, Sequelize ORM, Socket.IO (Real-time presence).

---

## 🛠️ How to Run the Project

### 1. Run the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync and seed the database with demo profiles:
   ```bash
   node force-seed.js
   ```
4. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Run the Frontend (Next.js)
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

---

## 🌟 Demo Accounts
The database is pre-seeded with these credentials:
* **Student**: `student.demo@studycircle.com` (Password: `Demo@123`)
* **Mentor**: `mentor.demo@studycircle.com` (Password: `Demo@123`)
* **Admin**: `admin.demo@studycircle.com` (Password: `Demo@123`)
