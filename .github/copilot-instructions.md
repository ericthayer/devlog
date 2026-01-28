# Copilot Instructions - DevLog (Brutalist Case Study Engine)

## Project Overview
A React + TypeScript app for generating UX/FE case studies from design artifacts using Gemini AI. Brutalist UI aesthetic with yellow/black theme. Now includes role-based authentication (publisher/reader).

**IMPORTANT!** Before you start a task, or make a new change, follow these _rules_:

- DO NOT change the visual design, theme styling, or composition of the UI once a `checkpoint`, and/or a component or pattern has been established. 

- DO NOT revert any "styling" (CSS/Layout) or "scripting" (TS/JSX) change intentionally made by me.

- DO NOT make changes outside the scope of the requested feature, i.e., don't modify the main navigation when asked to build a data table.

- ALWAYS break out code into reusable components ready for export via ES module

## Development Guidelines - Standards and Best Practices
Refer to the `.github/instructions/development-standards.instructions.md` file for detailed coding standards and best practices.

## Agent Instructions
When contributing to the DevLog application with AI chat agents, please adhere to the following guidelines: `./AGENTS.md`

## Architecture & Data Flow

### Authentication & Authorization
- **Roles**: `publisher` (full CRUD) and `reader` (read-only published content)
- **Sign-up Flow**: New users default to `reader` role; can request publisher access
- **Publisher Requests**: Tracked in `user_roles.publisher_requested` column for admin approval
- **OAuth Support**: Google and GitHub providers enabled via Supabase Auth
- **Auth Pattern**: App checks `user` from context, shows [LoginView](src/components/LoginView.tsx) if not authenticated
- **Permission Checks**: Pass `canEdit` (bool) down to components based on `user.role === 'publisher'`

### Three-Layer Data System
1. **Supabase (Primary)**: PostgreSQL database + Storage bucket for production data
2. **LocalStorage (Secondary)**: Browser persistence fallback (`devsigner_data_v3` key)
3. **Demo Data**: Default content in `src/utils/demoData.ts` if no data exists

**Critical Pattern**: [App.tsx](src/App.tsx#L52-L88) loads Supabase first, then overlays localStorage synchronously (they race). DB write operations in `src/services/dbService.ts` handle BOTH database records AND storage uploads.

### Authentication & Authorization
- **AuthContext**: [contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) manages auth state with Supabase Auth
- **Roles**: `publisher` (full CRUD) and `reader` (read-only published content)
- **User Roles Table**: Links `auth.users` to roles in `user_roles` table
- **RLS Policies**: Database-level permissions enforce role-based access (see [supabase/migrations/001_auth_and_rls.sql](supabase/migrations/001_auth_and_rls.sql))

**Auth Pattern**: App checks `user` from context, shows [LoginView](src/components/LoginView.tsx) if not authenticated. Pass `canEdit` (bool) down to components based on `user.role === 'publisher'`.

### Database Schema Mapping
**Frontend (camelCase) ↔ Database (snake_case)**:
- `nextSteps` ↔ `next_steps`
- `seoMetadata` ↔ `seo_metadata`
- `originalName` ↔ `original_name`
- `aiName` ↔ `ai_name`
- `date` ↔ `created_at`

Assets use `case_study_id` foreign key. Always map in both directions (see [App.tsx](src/App.tsx#L56-L73) and [dbService.ts](src/services/dbService.ts#L99-L101)).

## AI-Powered Workflows

### Asset Analysis
Files uploaded trigger two-phase AI analysis via [geminiService.ts](src/services/geminiService.ts):
1. **analyzeAsset**: Extracts metadata for naming convention `[topic]-[type]-[context]-[variant]-[version].[ext]`
2. **generateCaseStudy**: Synthesizes all assets into structured case study

**Models Used**:
- `gemini-2.5-flash`: With thinking mode (set `thinkingBudget` + `maxOutputTokens` together)
- `gemini-2.0-flash`: Faster, no thinking mode

All Gemini calls use typed JSON schemas via `responseSchema` parameter.

### Storage Upload Pattern
[dbService.ts](src/services/dbService.ts#L54-L78) converts blob URLs to Supabase Storage:
```typescript
if (assetUrl.startsWith('blob:')) {
  const blob = await fetch(assetUrl).then(r => r.blob());
  await supabase.storage.from('assets').upload(`${newId}/${asset.aiName}`, blob, { upsert: true });
  assetUrl = supabase.storage.from('assets').getPublicUrl(filePath).data.publicUrl;
}
```

## Error Handling Patterns

### Toast Notifications
[Toast](src/components/Toast.tsx) component displays error messages. Usage pattern in [App.tsx](src/App.tsx):
```typescript
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// Show error
setErrorMessage(`Failed to save: ${error.message}`);

// Toast auto-dismisses or user closes
{errorMessage && <Toast message={errorMessage} onClose={() => setErrorMessage(null)} type="error" />}
```

### Try-Catch Patterns
- **AI Operations**: Catch and retry without thinking mode if thinking fails ([geminiService.ts](src/services/geminiService.ts#L64-L68))
- **Database Operations**: Catch, log, show toast, but don't block UI ([App.tsx](src/App.tsx#L284-L290))
- **File Processing**: Return `null` for failed files, continue processing others ([App.tsx](src/App.tsx#L164-L167))

### Optimistic Updates
Save operations update UI immediately, then sync to database. If DB fails, show error but keep optimistic UI state ([App.tsx](src/App.tsx#L337-L345)).

## Environment Variables
Required in `.env`:
- `VITE_API_KEY`: Google Gemini API key
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key (client-side safe)

## Development Commands
- `npm run dev`: Vite dev server on port 3000
- `npm run build`: TypeScript compile + Vite build
- `npm test`: Run Vitest tests
- `npm run test:ui`: Interactive test UI
- `npm run test:coverage`: Test coverage report

## Testing Strategy

### Test Files Location
Tests in `src/tests/` directory. Name tests `*.test.tsx` or `*.test.ts`.

### Testing Libraries
- **Vitest**: Test runner (Jest-compatible API)
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: Custom matchers

### Running Tests
```bash
npm test              # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

### Example Test Pattern
See [src/tests/BrutalistButton.test.tsx](src/tests/BrutalistButton.test.tsx) for component testing and [src/tests/geminiService.test.ts](src/tests/geminiService.test.ts) for service mocking.

## Key Conventions

### File Uploads
- ZIP files auto-extract (filters by `SUPPORTED_UNPACK_EXTENSIONS` in [App.tsx](src/App.tsx#L27))
- Files >30MB skip blob URL creation to prevent browser memory issues
- Auto-rename controlled by `preferences.autoRename` (calls Gemini on every file)

### Component Structure
- **Views**: Full-screen pages (TimelineView, EditorView, ArticleView, SettingsView, LoginView)
- **Modal Components**: ProcessingModal, ManualAssetModal, Toast
- **Contexts**: AuthContext for authentication state
- All use `lucide-react` icons, Tailwind + brutalist yellow/black theme

### State Management
Single root state in [App.tsx](src/App.tsx) - no Redux/Context except AuthContext. Pass callbacks down for mutations.

### Permission Checks
Check `canEdit` (derived from `user.role === 'publisher'`) before showing create/edit/delete UI. Readers can only view published case studies.

## Supabase Configuration

### Authentication Setup
1. Enable email auth + OAuth (Google, GitHub) in Supabase Dashboard
2. Run migration: [supabase/migrations/001_auth_and_rls.sql](supabase/migrations/001_auth_and_rls.sql)
3. Creates `user_roles` table with publisher/reader roles + `publisher_requested` flag
4. Sets up RLS policies for role-based access

### OAuth Provider Setup
1. Enable Google/GitHub in Supabase Dashboard → Authentication → Providers
2. Add OAuth credentials from Google Cloud Console / GitHub Developer Settings
3. Set redirect URLs to your deployment URL
4. Users signing in via OAuth default to reader role

### Publisher Role Approval Workflow
New users can request publisher access during sign-up. Admin approval required:
1. Query: `SELECT * FROM user_roles WHERE publisher_requested = true`
2. Approve: `UPDATE user_roles SET role = 'publisher', publisher_requested = false WHERE user_id = '...'`
3. User must re-login to see updated permissions

### Storage Bucket Policies
The `assets` bucket needs RLS policies for authenticated access:
```sql
-- Insert policy (publishers only)
CREATE POLICY "Publishers can upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assets' AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'publisher'));

-- Read policy (all authenticated users)
CREATE POLICY "Authenticated users can view assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assets');
```

### Common Issues
- **Authorization errors**: Check RLS policies and user role in `user_roles` table
- **UUID mismatch**: [dbService.ts](src/services/dbService.ts#L5-L7) checks if `id` is UUID before upserting; temp IDs ignored
- **Asset deletion**: On save, old assets for case study are deleted then re-inserted ([dbService.ts](src/services/dbService.ts#L47))
- **Storage upload fails**: Ensure user is authenticated and has publisher role

## Styling Notes
- Tailwind + custom brutalist theme in [constants.tsx](src/constants.tsx)
- Yellow (`#fcd34d`) as primary, black borders `border-4 border-black`
- No smooth animations - hard state transitions match brutalist aesthetic
- Error states use red (`#dc2626`), success uses green (`#16a34a`)

## Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide covering Vercel, Netlify, and Supabase configuration.

