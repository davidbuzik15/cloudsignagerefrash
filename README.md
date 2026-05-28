# Presentv Player - Digital Signage System

A simple, stable, and fast digital signage system that allows you to create and manage public persistent links for displaying HTML/iframe embeds on multiple screens simultaneously.

## Features

- 📺 Display embedded content (Canva, YouTube, Google Slides, custom HTML) on multiple screens
- 🔗 Permanent public links that never change
- ⚡ Real-time refresh from dashboard without touching screens
- 🌐 Offline fallback - continues displaying content even without internet
- 📱 Works on TVs, Android TV, Google TV, Chrome, Mini PCs, Kiosk mode
- 🎨 Dark, modern, minimal dashboard
- 🚀 Built with Next.js, TypeScript, Tailwind CSS, and Supabase

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **Offline:** Service Worker, Cache API, LocalStorage
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- Vercel account (for deployment)

### Setup

1. Clone the repository
```bash
git clone https://github.com/davidbuzik15/cloudsignagerefrash.git
cd cloudsignagerefrash
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

4. Initialize Supabase schema
- Run SQL scripts in `db/schema.sql`
- Enable Realtime for `players` table

5. Run development server
```bash
npm run dev
```

6. Open http://localhost:3000

## Project Structure

```
src/
├── pages/
│   ├── dashboard/          # Dashboard management
│   ├── player/[slug].tsx   # Player display page
│   └── api/                # API routes
├── components/
│   ├── Dashboard/
│   ├── PlayerForm/
│   └── PlayerGrid/
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── cache.ts            # Cache/LocalStorage
│   └── sanitize.ts         # HTML sanitization
├── hooks/
│   ├── useRealtime.ts      # Realtime listener
│   └── useCache.ts         # Cache management
└── utils/
    └── helpers.ts
```

## License

MIT
