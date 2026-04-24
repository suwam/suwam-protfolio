# Suwam Subedi Portfolio

A deployment-ready React, Vite and Tailwind portfolio for Suwam Subedi. The public website works with static fallback content and can optionally connect to Supabase for admin-managed projects, blog posts, contact submissions, analytics and chatbot settings.

## Local Development

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and add Supabase values when using the CMS/admin features:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The public portfolio still renders without these values. Contact falls back to email and the chatbot is hidden.

## Build

```bash
npm run build
npm run preview
```

## Deployment

- Build command: `npm run build`
- Output directory: `dist`
- SPA routing is configured for Netlify via `public/_redirects` and for Vercel via `vercel.json`.
- The existing `CNAME` file is kept for custom-domain static hosting.
