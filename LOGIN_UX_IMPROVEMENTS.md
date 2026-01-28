# LoginView UX Improvements

## Changes Made

### 1. Password Visibility Toggle ✅
- Added eye/eye-off icon button in password field
- Toggle between password obfuscation and plain text
- Uses lucide-react `Eye` and `EyeOff` icons
- Positioned absolutely in input field (right side)

**Implementation:**
```tsx
const [showPassword, setShowPassword] = useState(false);

<input type={showPassword ? 'text' : 'password'} ... />
<button onClick={() => setShowPassword(!showPassword)}>
  <Icon name={showPassword ? 'EyeOff' : 'Eye'} />
</button>
```

### 2. Publisher Role by Request Only ✅
- All new sign-ups default to `reader` role
- Added checkbox to request publisher access during sign-up
- Publisher requests tracked in `user_roles.publisher_requested` column
- Success message shown when publisher access requested
- Admin must manually approve via SQL query

**Implementation:**
```tsx
const [requestPublisher, setRequestPublisher] = useState(false);

// On sign-up
await signUp(email, password, 'reader', requestPublisher);
```

**Database:**
```sql
ALTER TABLE user_roles ADD COLUMN publisher_requested BOOLEAN DEFAULT FALSE;
```

**Admin Approval Process:**
```sql
-- Check pending requests
SELECT * FROM user_roles WHERE publisher_requested = true;

-- Approve user
UPDATE user_roles 
SET role = 'publisher', publisher_requested = false 
WHERE user_id = 'xxx-xxx-xxx';
```

### 3. OAuth Provider Login (Google & GitHub) ✅
- Added "OR CONTINUE WITH" section below email/password form
- Google and GitHub OAuth buttons with provider icons
- Uses Supabase Auth's `signInWithOAuth()` method
- OAuth users auto-assigned reader role on first login
- Redirect handled automatically by Supabase

**Implementation:**
```tsx
const signInWithProvider = async (provider: 'google' | 'github') => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
};
```

**OAuth First-Time Login Flow:**
1. User clicks Google/GitHub button
2. Redirects to provider for authentication
3. Provider redirects back to app
4. `getUserRole()` checks if user has role
5. If no role exists, creates reader role automatically
6. User is logged in with reader access

## UI/UX Design

### Sign-Up Form
- Reader access highlighted in yellow box (default)
- Publisher request shown as checkbox option
- Clear iconography (BookOpen for reader, Crown for publisher)
- Helpful descriptions under each option
- Success banner if publisher access requested

### OAuth Buttons
- Consistent brutalist styling
- Provider icons (Chrome for Google, Github for GitHub)
- Disabled state during loading
- Secondary variant for non-primary action

### Visual Hierarchy
1. Email/Password form (primary)
2. Divider line
3. OAuth options (secondary)
4. Role permissions info (footer)

## Updated Files

**Components:**
- `src/components/LoginView.tsx` - Complete redesign with all 3 features

**Contexts:**
- `src/contexts/AuthContext.tsx` - Added `signInWithProvider()` and `requestPublisher` param

**Database:**
- `supabase/migrations/001_auth_and_rls.sql` - Added `publisher_requested` column

**Documentation:**
- `.github/copilot-instructions.md` - Updated OAuth and approval workflow docs

## Next Steps for Setup

1. **Enable OAuth Providers in Supabase:**
   - Dashboard → Authentication → Providers
   - Enable Google OAuth
   - Enable GitHub OAuth
   - Configure redirect URLs

2. **Google OAuth Setup:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

3. **GitHub OAuth Setup:**
   - Go to GitHub Developer Settings
   - Create OAuth App
   - Authorization callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

4. **Test Flow:**
   - Sign up with email (request publisher access)
   - Check database for `publisher_requested = true`
   - Approve via SQL
   - Sign out and sign in again to see publisher role
   - Test Google OAuth sign-in
   - Test GitHub OAuth sign-in

## Security Considerations

- OAuth users cannot request publisher access during first login (by design)
- They must contact admin separately or feature can be added later
- All role checks happen server-side via RLS policies
- Publisher approval requires database access (admin-only)

All features are complete and ready for testing! 🎉
