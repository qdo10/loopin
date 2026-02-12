# Loopin

Beautiful client portals for freelancers. Share project progress, deliverables, and updates — no client login required.

## Features

- 📊 **Project Dashboard** - Manage all your client projects in one place
- 🎯 **Milestones** - Track project phases with clear status indicators
- 📝 **Updates** - Post updates that clients see instantly
- 📁 **Deliverables** - Upload files for clients to download
- 🔗 **Share with a Link** - No client login needed
- 📱 **Mobile Responsive** - Looks great on any device

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Payments:** Stripe
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

## Getting Started

### 1. Clone and install

```bash
cd loopin
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase-schema.sql`
3. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Pricing Model

- **Free:** 1 active project, 100MB storage
- **Pro ($9/mo):** Unlimited projects, 5GB storage, custom branding

## License

MIT
