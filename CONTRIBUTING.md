# Contributing to DevLog

Thank you for your interest in contributing to DevLog! This guide will help you understand our development workflow and standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [AI Guidance System](#ai-guidance-system)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Commit Conventions](#commit-conventions)

## Getting Started

### Prerequisites

- Node.js v18+
- Git
- GitHub account
- GitHub CLI (`gh`) recommended for PR creation

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ericthayer/devlog.git
   cd devlog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys:
   # - VITE_API_KEY (Google Gemini)
   # - VITE_SUPABASE_URL
   # - VITE_SUPABASE_ANON_KEY
   ```

4. **Run database migrations**
   - See [README.md](README.md#supabase-configuration) for Supabase setup

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

We use feature branches for all development:

```bash
# Create a feature branch
git checkout -b feat/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description

# Or for documentation
git checkout -b docs/what-youre-documenting
```

**Branch naming conventions:**
- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates
- `perf/` - Performance improvements

### Making Changes

1. **Before coding**: Check the [AI Guidance System](#ai-guidance-system)
2. **Write code**: Follow [Code Standards](#code-standards)
3. **Add tests**: All features should have tests
4. **Run tests**: `npm test`
5. **Build**: Verify with `npm run build`
6. **Commit**: Follow [Commit Conventions](#commit-conventions)

### Submitting Changes

1. **Push your branch**
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request**
   
   **Option A: GitHub CLI (Recommended)**
   ```bash
   gh pr create --base main --head your-branch-name
   ```
   
   **Option B: Manual**
   - Go to https://github.com/ericthayer/devlog/pulls
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   
   See [.github/GITHUB_AUTH_SETUP.md](.github/GITHUB_AUTH_SETUP.md) for authentication setup.

3. **Wait for review**
   - Address any feedback
   - Make requested changes
   - Push updates to the same branch

## AI Guidance System

DevLog uses a comprehensive AI guidance framework in the `.github/` directory. This helps maintain consistency and quality when working with AI assistants like GitHub Copilot.

### Three-Layer Structure

#### 1. **Instructions** (`.github/instructions/`)
Scope-specific rules that apply to certain file types:

- `development-standards.instructions.md` - TypeScript/React standards, APCA contrast
- `web-interface-guidelines.instructions.md` - UI/UX requirements (24px hit targets, keyboard support)
- `github-issue.instructions.md` - Issue creation format
- `storybook.instructions.md` - Storybook usage

**When to use**: Reference before creating components or UI elements.

#### 2. **Rules** (`.github/rules/`)
Architectural principles that govern the codebase:

- `component-architecture.md` - Folder-per-component pattern
- `spec-driven-development.md` - SDD methodology (create SPEC.md before coding)
- `supabase.md` - Database, auth, RLS best practices
- `accessibility.md` - WCAG compliance
- `web-performance.md` - Performance optimization

**When to use**: Reference when making architectural decisions.

#### 3. **Skills** (`.github/skills/`)
Executable workflows and templates:

- `scaffold_component/` - Component creation workflow
- `accessibility_audit/` - Testing checklist
- `vercel-react-best-practices/` - 45 performance rules

**When to use**: Follow when building new features.

### Using the Guidance System

1. **Before starting work**: Check relevant instructions and rules
2. **During development**: Reference skills for workflows
3. **In PR reviews**: Cite rules when suggesting changes
4. **With AI assistants**: The system is attached to Copilot instructions automatically

See [.github/README.md](.github/README.md) for detailed guidance system documentation.

## Code Standards

### TypeScript/React Standards

- Follow the [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/)
- Use TypeScript for all new code
- Use functional components with hooks
- Define prop types with TypeScript interfaces
- Avoid `any` types

See [.github/instructions/development-standards.instructions.md](.github/instructions/development-standards.instructions.md) for complete standards.

### Project Structure

```
src/
├── components/       # React components (one per folder)
├── contexts/         # React contexts
├── services/         # Business logic (API calls, external services)
├── utils/           # Pure utility functions
├── tests/           # Test files
└── types.ts         # Shared TypeScript types
```

### Component Architecture

Follow the **Folder-per-Component** pattern:

```
src/components/MyComponent/
├── MyComponent.tsx       # Component implementation
├── MyComponent.test.tsx  # Tests
├── index.ts             # Named export: export { MyComponent } from './MyComponent'
└── SPEC.md              # Component specification (optional)
```

See [.github/rules/component-architecture.md](.github/rules/component-architecture.md) for details.

### Styling

- Use Tailwind CSS utility classes
- Follow brutalist theme (yellow/black, hard borders, no smooth animations)
- APCA contrast minimum: 60 for normal text, 45 for large text
- Hit targets: minimum 24px × 24px

## Testing

### Running Tests

```bash
npm test              # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

### Writing Tests

- Place tests in `src/tests/` directory
- Name tests `*.test.tsx` or `*.test.ts`
- Use Vitest + React Testing Library
- Follow existing test patterns in `src/tests/`

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- Aim for 80%+ coverage on new code
- All exported functions should have tests
- All components should have basic render tests

## Pull Requests

### PR Template

Use the template in [.github/pr-template-commits.md](.github/pr-template-commits.md) or let `gh pr create` auto-fill.

### PR Checklist

Before submitting:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Documentation updated (if needed)
- [ ] Accessibility requirements met (24px targets, keyboard support)
- [ ] APCA contrast verified for UI changes

### Review Process

1. PRs require at least one approval
2. All CI checks must pass
3. Address reviewer feedback promptly
4. Squash commits before merging (if requested)

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature (triggers **minor** version bump)
- `fix:` - Bug fix (triggers **patch** version bump)
- `docs:` - Documentation changes (triggers **patch** version bump)
- `refactor:` - Code refactoring (triggers **patch** version bump)
- `test:` - Adding or updating tests (no version bump)
- `perf:` - Performance improvements (triggers **patch** version bump)
- `build:` - Build system or dependencies (triggers **patch** version bump)
- `ci:` - CI configuration changes (no version bump)
- `chore:` - Maintenance tasks (no version bump)

### Breaking Changes

To trigger a **major** version bump, include `BREAKING CHANGE:` in the commit footer or use `!`:

```bash
feat(api)!: redesign authentication flow

BREAKING CHANGE: The signIn method now requires a role parameter.
```

### Examples

```bash
feat(auth): add OAuth login support

fix(upload): resolve file size calculation error

docs(readme): update Supabase setup instructions

refactor(components): move all files to src/ directory

perf(gemini): implement response caching to reduce API calls
```

## Releases

This project uses automated releases via semantic-release. When commits are merged to `main`:

1. Commit messages are analyzed
2. Version is automatically bumped based on commit types
3. CHANGELOG.md is updated
4. GitHub release is created
5. Related PRs/issues are commented with release info

See [RELEASES.md](RELEASES.md) for complete release documentation.

## Need Help?

- **Questions**: Open a [GitHub Discussion](https://github.com/ericthayer/devlog/discussions)
- **Bugs**: Open an [Issue](https://github.com/ericthayer/devlog/issues)
- **Security**: Email [maintainer contact info]
- **AI Agents**: See [AGENTS.md](AGENTS.md) for AI-specific guidelines

## Additional Resources

- [README.md](README.md) - Project overview and setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - AI agent architecture guide
- [.github/GITHUB_AUTH_SETUP.md](.github/GITHUB_AUTH_SETUP.md) - GitHub authentication setup

---

**Thank you for contributing to DevLog!** 🎉
