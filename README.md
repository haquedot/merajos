# Orbit ⭐
> **Plan. Focus. Execute. Grow.**

Orbit is an intelligent personal productivity command center that helps professionals, students, developers, researchers, and creators organize their work, plan their day, execute deep work, track habits, manage projects, monitor research, and achieve long-term goals from one unified dashboard.

## Key Features

- 🎯 **Daily Task & MIT Tracker**: Full two-way synchronization with Google Tasks.
- 📅 **Integrated Calendar**: Seamless Google Calendar event management & time-blocking.
- 🚀 **Projects & Clients Workspace**: Track deliverables, milestones, and client accounts.
- 📚 **Research & Career Command Center**: Track paper reading, DSA problem solving, and job applications.
- ⚡ **Daily Performance Analytics**: Automatic 11:45 PM snapshot calculations with email summaries.
- ⚙️ **Custom Preferences**: Dark/Light mode, email notification toggles, and offline data cache.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch Orbit.

## Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, Lucide Icons, Framer Motion
- **Fonts**: Manrope (via `next/font/google`)
- **Database**: MongoDB (Server Snapshots), Dexie.js (Client IndexedDB Cache)
- **Integrations**: Google Tasks API, Google Calendar API, Nodemailer
