# DevLog AI Guidance System

This directory contains a comprehensive framework for AI-assisted development, ensuring consistency, quality, and adherence to best practices across the project.

## 📁 Directory Structure

```
.github/
├── README.md                    # This file
├── copilot-instructions.md      # Main AI architecture guide
├── GITHUB_AUTH_SETUP.md         # GitHub authentication setup
├── pr-template-commits.md       # PR description template
├── instructions/                # Scope-specific guidelines
│   ├── development-standards.instructions.md
│   ├── web-interface-guidelines.instructions.md
│   ├── github-issue.instructions.md
│   ├── github-release-notes.instructions.md
│   └── storybook.instructions.md
├── rules/                       # Architectural principles
│   ├── accessibility.md
│   ├── component-architecture.md
│   ├── react-19-compiler.md
│   ├── spec-driven-development.md
│   ├── supabase.md
│   ├── tailwind-v4.md
│   ├── three-js-react.md
│   └── web-performance.md
├── skills/                      # Executable workflows
│   ├── accessibility_audit/
│   ├── scaffold_component/
│   ├── vercel-react-best-practices/
│   └── workflows/
└── prompts/                     # Agent prompt templates
    └── create-pr.prompt.md
```

## 🎯 Three-Layer Framework

### Layer 1: Instructions (Scope-Specific)

Files in `instructions/` apply to specific file types or contexts using frontmatter:

```yaml
---
applyTo: '**/*.tsx'
---
```

**When these apply:**
- Automatically loaded by AI when working with matching files
- Referenced in code reviews for specific file types
- Used to enforce patterns on particular scopes

**Key files:**
- `development-standards.instructions.md` - TypeScript/React standards, Airbnb style, APCA contrast
- `web-interface-guidelines.instructions.md` - MUST/SHOULD/NEVER UI rules, accessibility (24px targets, keyboard)
- `github-issue.instructions.md` - Issue template and format
- `github-release-notes.instructions.md` - Release notes structure
- `storybook.instructions.md` - Storybook usage patterns

### Layer 2: Rules (Architectural Principles)

Files in `rules/` define non-negotiable architectural patterns:

**When to reference:**
- Making architectural decisions
- Designing new features
- Reviewing code structure
- Setting up infrastructure

**Key files:**
- `component-architecture.md` - Folder-per-component with named exports
- `spec-driven-development.md` - Create SPEC.md before coding ("Zero Vibe Rule")
- `supabase.md` - Database, auth, RLS, storage best practices
- `accessibility.md` - WCAG compliance requirements
- `react-19-compiler.md` - React 19 optimization patterns
- `web-performance.md` - Performance optimization guidelines

### Layer 3: Skills (Executable Workflows)

Files in `skills/` provide step-by-step workflows:

**When to use:**
- Creating new components
- Running audits
- Following complex procedures
- Applying best practice patterns

**Key skills:**

#### `scaffold_component/`
Component creation workflow with SDD:
1. Create SPEC.md with requirements
2. Generate component structure
3. Implement with tests
4. Document in Storybook

#### `accessibility_audit/`
Comprehensive accessibility testing:
- Keyboard navigation check
- Screen reader compatibility
- Color contrast validation
- ARIA attributes review

#### `vercel-react-best-practices/`
45 performance rules across 8 categories:
- **Async** (7 rules) - API routes, dependencies, parallel fetching, suspense
- **Bundle** (6 rules) - Dynamic imports, barrel imports, tree shaking
- **Client** (4 rules) - Event listeners, localStorage, SWR dedup
- **JS** (11 rules) - Caching, batching, early exits
- **Rendering** (8 rules) - SVG, hydration, transitions
- **Re-render** (10 rules) - Memo, derived state, lazy init
- **Server** (7 rules) - Auth, caching, serialization

## 🚀 How to Use This System

### For Developers

#### Starting a New Feature

1. **Check Instructions**
   - Read relevant `instructions/` files for your file types
   - Example: Building a component? Read `web-interface-guidelines.instructions.md`

2. **Review Rules**
   - Understand architectural constraints
   - Example: New component? Follow `component-architecture.md` folder structure

3. **Follow Skills**
   - Use workflow templates
   - Example: Run `scaffold_component/` to create proper structure

4. **Reference in PRs**
   - Cite specific rules when reviewing
   - Link to guidance files in comments

#### Making Changes

```bash
# Before coding a component
cat .github/rules/component-architecture.md
cat .github/instructions/web-interface-guidelines.instructions.md

# During development
# Follow patterns in .github/skills/scaffold_component/

# Before PR
cat .github/pr-template-commits.md
```

### For AI Assistants

The guidance system is automatically integrated into AI tools:

**GitHub Copilot:**
- Reads `copilot-instructions.md` for architecture
- Applies `instructions/` files based on `applyTo` patterns
- References `rules/` for decision-making

**Creating Features:**
1. Read relevant `instructions/` and `rules/`
2. Generate code following patterns
3. Reference `skills/` for workflows
4. Use `prompts/` for common tasks

### Common Workflows

#### Creating a New Component

```bash
# 1. Review guidance
cat .github/rules/component-architecture.md
cat .github/rules/spec-driven-development.md

# 2. Create SPEC.md first (SDD)
# Document requirements, props, behavior

# 3. Scaffold component following folder pattern
mkdir src/components/MyComponent
touch src/components/MyComponent/{MyComponent.tsx,index.ts,SPEC.md}

# 4. Implement with accessibility in mind
cat .github/instructions/web-interface-guidelines.instructions.md
```

#### Running an Accessibility Audit

```bash
# Follow the checklist
cat .github/skills/accessibility_audit/SKILL.md

# Check key requirements:
# - 24px × 24px minimum hit targets
# - APCA contrast ≥60 (normal) / ≥45 (large)
# - Keyboard navigation functional
# - Screen reader labels present
```

#### Optimizing Performance

```bash
# Review best practices
cat .github/skills/vercel-react-best-practices/SKILL.md

# Check specific patterns
cat .github/skills/vercel-react-best-practices/rules/rerender-memo.md
cat .github/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
```

## 📖 Key Concepts

### Spec-Driven Development (SDD)

From `rules/spec-driven-development.md`:

> Create SPEC.md BEFORE writing code. No exceptions.

**The "Zero Vibe Rule":** If you're coding based on vibes, stop and write the spec.

**Template:**
```markdown
# Component/Feature Name

## Purpose
[Why this exists]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## API/Props
[Interface definition]

## Behavior
[How it works]

## Changelog
[Track changes to spec during implementation]
```

### Folder-per-Component

From `rules/component-architecture.md`:

```
src/components/MyComponent/
├── MyComponent.tsx       # Implementation
├── MyComponent.test.tsx  # Tests
├── index.ts             # export { MyComponent } from './MyComponent'
└── SPEC.md              # Specification
```

**Why:** Encapsulation, discoverability, and maintainability.

### Accessibility First

From `instructions/web-interface-guidelines.instructions.md`:

**MUST:**
- Hit targets ≥24px × 24px
- APCA contrast ≥60 (normal text)
- Full keyboard navigation
- Proper ARIA labels

**SHOULD:**
- Focus indicators visible
- Skip links for navigation
- Semantic HTML

## 🔄 Updating the Guidance System

### When to Update

- **New patterns emerge** → Add to `rules/`
- **Common mistakes** → Add to `instructions/`
- **Repeated workflows** → Create in `skills/`
- **File type standards** → Update `instructions/` `applyTo` patterns

### How to Update

1. **Create/edit file** in appropriate directory
2. **Test with AI** to verify it's followed correctly
3. **Document in this README** if structural change
4. **Update `copilot-instructions.md`** if architecture changes
5. **Commit with `docs:` prefix**

### File Naming

- **Instructions:** `topic.instructions.md`
- **Rules:** `topic.md`
- **Skills:** `skill-name/SKILL.md`
- **Prompts:** `action-name.prompt.md`

## 🛠️ Utilities

### GitHub Authentication
See [GITHUB_AUTH_SETUP.md](GITHUB_AUTH_SETUP.md) for:
- GitHub CLI setup
- Personal access token generation
- mcp_github tools configuration

### PR Templates
Use [pr-template-commits.md](pr-template-commits.md) for consistent PR descriptions.

### Prompts
Reusable AI prompts in `prompts/`:
- `create-pr.prompt.md` - Automated PR creation from commits

## 📚 Additional Resources

- **[copilot-instructions.md](copilot-instructions.md)** - Complete architecture guide for AI
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Developer contribution guide
- **[AGENTS.md](../AGENTS.md)** - AI agent-specific guidelines
- **[README.md](../README.md)** - Project overview

## 💡 Philosophy

This guidance system embodies:

1. **Explicit over Implicit** - Written standards beat tribal knowledge
2. **Automation over Documentation** - Executable workflows beat manuals
3. **Consistency over Cleverness** - Predictable patterns beat one-off solutions
4. **Accessibility First** - Inclusive design is not optional
5. **Performance by Default** - Optimization patterns built-in

---

**Questions?** See [CONTRIBUTING.md](../CONTRIBUTING.md) or open a discussion.
