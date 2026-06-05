# 5 Brushes — Online Art Gallery

A full-stack art gallery platform where artists can register, upload artworks for review, and collectors can browse and express interest in pieces.

## Features

- **Public Gallery** — browse all approved artworks with filters by style, price, and search
- **Artwork Detail** — view full artwork info and express buying interest
- **Artist Accounts** — register, log in, upload artworks with image + metadata
- **Artist Dashboard** — manage submitted artworks, track approval status
- **Admin Panel** — approve/reject artwork submissions, view buyer leads
- **Buyer Leads** — collectors fill an interest form; admin and artist both see enquiries

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite                     |
| Routing     | React Router v7                     |
| Backend/DB  | Supabase (Auth + PostgreSQL + RLS)  |
| Image CDN   | Cloudinary                          |
| Hosting     | Vercel                              |

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/krishnatejnk/5brushes.git
cd 5brushes
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

| Variable                      | Where to find it                              |
|-------------------------------|-----------------------------------------------|
| `VITE_SUPABASE_URL`           | Supabase → Project Settings → API            |
| `VITE_SUPABASE_ANON_KEY`      | Supabase → Project Settings → API            |
| `VITE_CLOUDINARY_CLOUD_NAME`  | Cloudinary Dashboard → Account Details       |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload Presets     |

### 3. Run locally
```bash
npm run dev
```

## Setting Up an Admin Account

1. Register as an artist via `/artist/register`
2. In your Supabase dashboard, run this SQL (replace the email):
```sql
update artists set is_admin = true
where email = 'your@email.com';
```
3. Log in — you'll see the Admin Panel link in the navbar.

## Database Schema

Three tables managed by Supabase with Row Level Security:

- **artists** — artist profiles linked to auth.users
- **artworks** — artwork submissions (pending → approved/rejected)
- **leads** — buyer interest enquiries

## Deployment

Deployed on Vercel. Add all four environment variables in Vercel → Project → Settings → Environment Variables.
