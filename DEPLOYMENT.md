# Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Google Gemini API key
- Supabase project (with database and storage configured)
- Node.js 18+ installed locally

## Environment Variables

Set these variables in your deployment platform:

```env
VITE_API_KEY=your_google_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

### 1. Database Tables

Create the required tables (if not already exists):

```sql
CREATE TABLE case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  problem TEXT,
  approach TEXT,
  outcome TEXT,
  next_steps TEXT,
  tags TEXT[],
  seo_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  ai_name TEXT NOT NULL,
  type TEXT,
  topic TEXT,
  context TEXT,
  variant TEXT,
  version TEXT,
  file_type TEXT,
  url TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Run Authentication Migration

Execute the migration file to set up authentication and RLS policies:

```bash
# From your local machine
psql your_supabase_connection_string < supabase/migrations/001_auth_and_rls.sql
```

Or use Supabase Dashboard → SQL Editor and paste the contents of `supabase/migrations/001_auth_and_rls.sql`.

### 3. Storage Bucket

Create a bucket named `assets` in Supabase Storage. The RLS policies from the migration will handle permissions.

### 4. Configure Email Auth

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Set site URL to your deployment URL

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/devlog)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `VITE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Build Configuration

Vercel will auto-detect Vite. If needed, configure:

**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

## Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the app:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify Dashboard:
   - Go to Site Settings → Build & Deploy → Environment
   - Add the three environment variables

### netlify.toml Configuration

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Post-Deployment

### 1. Create First User

Visit your deployed app and sign up with an email and password. Choose the "publisher" role for admin access.

### 2. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Add your deployment URL to the list of redirect URLs
- Example: `https://your-app.vercel.app`

### 3. Test Authentication

1. Sign up a new user
2. Check that the user appears in Supabase Dashboard → Authentication → Users
3. Verify the `user_roles` table has the correct role

### 4. Upload a Case Study

Test the full flow:
1. Upload design files
2. Generate a case study
3. Verify files appear in Supabase Storage
4. Check database records in `case_studies` and `assets` tables

## Troubleshooting

### Authentication Errors

**Error**: "User not found" or "Invalid login credentials"
- Verify email confirmation settings in Supabase
- Check that email provider is enabled

**Error**: "Access denied" or "Row level security"
- Ensure RLS policies are properly configured
- Verify user has a role in `user_roles` table

### Storage Upload Errors

**Error**: "StorageApiError: headers must have required property 'authorization'"
- Check that storage RLS policies allow authenticated uploads
- Verify user is logged in before uploading

### Build Errors

**Error**: Missing environment variables
- Ensure all `VITE_*` variables are set in deployment platform
- Restart the build after adding variables

**Error**: Type errors during build
- Run `npm run build` locally first to catch issues
- Check TypeScript configuration in `tsconfig.json`

## Monitoring & Maintenance

### Check Supabase Logs

Monitor your deployment:
- Database logs: Supabase Dashboard → Database → Logs
- Storage logs: Supabase Dashboard → Storage → Logs
- Auth logs: Supabase Dashboard → Authentication → Logs

### Update Dependencies

```bash
npm update
npm audit fix
```

### Database Backups

Supabase provides automatic backups. For manual backups:
```bash
pg_dump your_supabase_connection_string > backup.sql
```
