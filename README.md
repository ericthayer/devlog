# DevLog - Brutalist Case Study Engine

A React + TypeScript application for generating UX/FE case studies from design artifacts using AI. Features a brutalist UI aesthetic with a distinctive yellow/black theme and role-based authentication.

## Purpose

DevLog analyzes design assets (wireframes, mockups, prototypes) and automatically generates professional case studies. Upload your work files, and the AI synthesizes them into structured documentation with timeline views, detailed breakdowns, and exportable articles.

Supports two user roles:
- **Publisher**: Full access to create, edit, and delete case studies
- **Reader**: View published case studies only

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development workflow and branch strategy
- Code standards and testing requirements
- Pull request process
- AI guidance system overview

## AI Guidance System

DevLog includes a comprehensive AI development framework in [.github/](.github/README.md) with three layers:

1. **Instructions** - Scope-specific guidelines (TypeScript standards, UI requirements, accessibility)
2. **Rules** - Architectural principles (component structure, SDD, Supabase patterns)
3. **Skills** - Executable workflows (scaffolding, audits, performance best practices)

This system helps maintain consistency and quality across the codebase. See [.github/README.md](.github/README.md) for details.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (brutalist theme)
- **AI**: Google Gemini API (2.5-flash with thinking mode)
- **Database**: Supabase (PostgreSQL + Storage)
- **Authentication**: Supabase Auth with RLS
- **Testing**: Vitest + React Testing Library
- **Fallback**: LocalStorage persistence
- **Icons**: lucide-react

## Setup

### Prerequisites
- Node.js (v18+)
- Google Gemini API key
- Supabase project

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` with:

```env
VITE_API_KEY=your_google_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration

#### 1. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `assets`
3. Make it public or configure RLS policies (see migration file)

#### 2. Run Database Migration

Apply the authentication and RLS policies:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/001_auth_and_rls.sql`
3. Paste and run the SQL

This will:
- Create `user_roles` table for role management
- Set up RLS policies for `case_studies` and `assets` tables
- Configure storage policies for authenticated access

#### 3. Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable the Email provider
3. Configure email templates (optional)
4. Set your site URL in Authentication → URL Configuration

### Alternative: Quick Setup (Public Storage)

For development/testing without authentication, apply these simpler storage policies:

```sql
-- Insert policy
CREATE POLICY "Upload" ON storage.objects FOR INSERT TO public 
WITH CHECK (bucket_id = 'assets');

-- Read policy  
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'assets');

-- Update policy
CREATE POLICY "Update" ON storage.objects FOR UPDATE TO public 
USING (bucket_id = 'assets') WITH CHECK (bucket_id = 'assets');
```

**Note**: This bypasses authentication. Use only for local development.

## Development

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm test             # Run tests in watch mode
npm run test:ui      # Interactive test UI
npm run test:coverage # Test coverage report
```

## Testing

Tests are written using Vitest and React Testing Library.

### Running Tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Interactive UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Files

- Component tests: `src/tests/*.test.tsx`
- Service tests: `src/tests/*.test.ts`
- Test setup: `src/tests/setup.ts`

### Example Tests

See existing examples:
- [BrutalistButton.test.tsx](src/tests/BrutalistButton.test.tsx) - Component testing
- [geminiService.test.ts](src/tests/geminiService.test.ts) - Service mocking

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions covering:
- Vercel deployment
- Netlify deployment  
- Supabase configuration
- Environment variables
- Post-deployment checklist

Quick deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Then add environment variables in Vercel Dashboard and redeploy.

## Key Features

- **AI-Powered Analysis**: Automatic asset naming and case study generation
- **Role-Based Access**: Publisher (admin) and Reader roles with RLS
- **ZIP Support**: Auto-extract design files from archives
- **Three-Layer Persistence**: Supabase → LocalStorage → Demo data
- **Brutalist UI**: Bold yellow/black aesthetic with hard transitions
- **Export Ready**: Generate shareable case study articles
- **Testing Suite**: Comprehensive tests with Vitest
- **Type Safety**: Full TypeScript coverage

## Architecture

- **Authentication**: Supabase Auth with custom roles (publisher/reader)
- **Authorization**: Row-level security policies in PostgreSQL
- **Data Flow**: Database-first with localStorage overlay
- **State Management**: Single root state with AuthContext
- **File Handling**: Blob URLs for small files, direct storage for >30MB
- **Naming Convention**: AI generates `[topic]-[type]-[context]-[variant]-[version]` filenames
- **Error Handling**: Optimistic updates with toast notifications

## Project Structure

```
devlog/
├── src/
│   ├── components/       # React components
│   │   ├── LoginView.tsx # Authentication UI
│   │   ├── TimelineView.tsx
│   │   ├── EditorView.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── services/         # Business logic
│   │   ├── geminiService.ts # AI integration
│   │   └── dbService.ts     # Supabase operations
│   ├── tests/            # Test files
│   │   ├── setup.ts
│   │   └── *.test.tsx
│   └── utils/            # Utilities
│       ├── supabase.ts   # Supabase client
│       └── demoData.ts   # Fallback data
├── supabase/
│   └── migrations/       # SQL migrations
│       └── 001_auth_and_rls.sql
├── .github/              # AI guidance system
│   ├── instructions/     # Scope-specific guidelines
│   ├── rules/           # Architectural principles
│   └── skills/          # Executable workflows
├── CONTRIBUTING.md       # Developer guide
├── DEPLOYMENT.md         # Deployment guide
└── README.md             # This file
```

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed architecture documentation.

## Resources

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide (Vercel, Netlify, Supabase)
- **[.github/README.md](.github/README.md)** - AI guidance system documentation
- **[AGENTS.md](AGENTS.md)** - AI agent development guidelines
