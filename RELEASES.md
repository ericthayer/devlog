# Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and package publishing based on [Conventional Commits](https://www.conventionalcommits.org/).

## How It Works

1. **Commit Messages**: Follow conventional commit format
2. **Automatic Versioning**: Semantic-release analyzes commits and determines version bumps
3. **Changelog Generation**: Automatically generates CHANGELOG.md
4. **GitHub Releases**: Creates GitHub releases with release notes
5. **Git Tags**: Tags releases in the repository

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types and Version Bumps

| Type | Description | Version Bump | Example |
|------|-------------|--------------|---------|
| `feat` | New feature | **Minor** (0.x.0) | `feat(auth): add OAuth login` |
| `fix` | Bug fix | **Patch** (0.0.x) | `fix(upload): resolve file size error` |
| `perf` | Performance improvement | **Patch** (0.0.x) | `perf(gemini): optimize API calls` |
| `refactor` | Code refactoring | **Patch** (0.0.x) | `refactor(components): move to src/` |
| `docs` | Documentation | **Patch** (0.0.x) | `docs(readme): update setup guide` |
| `build` | Build system changes | **Patch** (0.0.x) | `build(deps): update vite to v6` |
| `test` | Test additions/updates | **No release** | `test(auth): add login tests` |
| `ci` | CI/CD changes | **No release** | `ci(actions): add release workflow` |
| `chore` | Maintenance tasks | **No release** | `chore(deps): update dev deps` |
| **BREAKING CHANGE** | Breaking change | **Major** (x.0.0) | See below |

### Breaking Changes

To trigger a major version bump, include `BREAKING CHANGE:` in the commit footer:

```
feat(api): redesign authentication flow

BREAKING CHANGE: The signIn method now requires a role parameter.
Users must update their authentication calls to include the role.
```

Or use `!` after the type/scope:

```
feat(api)!: redesign authentication flow
```

## Release Workflow

### Automatic Releases (Recommended)

Releases happen automatically when commits are pushed to protected branches:

1. **Main Branch** (`main`):
   - Triggers production releases
   - Version: `1.0.0`, `1.1.0`, `2.0.0`, etc.

2. **Beta Branch** (`beta`):
   - Triggers pre-releases
   - Version: `1.0.0-beta.1`, `1.0.0-beta.2`, etc.

### Manual Release Trigger

You can manually trigger a release via GitHub Actions:

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Select the branch
4. Click **Run workflow**

## What Gets Released

The release process:

1. ✅ Analyzes commit messages since last release
2. ✅ Determines version bump based on commit types
3. ✅ Updates `package.json` version
4. ✅ Generates/updates `CHANGELOG.md`
5. ✅ Creates a Git tag
6. ✅ Pushes changes back to repository
7. ✅ Creates GitHub release with notes
8. ✅ Attaches build artifacts (`dist/**`)
9. ✅ Comments on related PRs and issues

## Changelog

The changelog is automatically generated in `CHANGELOG.md` with sections:

- **Features** - New functionality
- **Bug Fixes** - Fixes to existing features
- **Performance Improvements** - Optimizations
- **Code Refactoring** - Code improvements
- **Documentation** - Docs updates
- **Build System** - Build/dependency changes

Tests, CI, and chores are excluded from the changelog.

## GitHub Token Permissions

The release workflow requires a GitHub token with these permissions:

- ✅ **contents: write** - Update repository files
- ✅ **issues: write** - Comment on issues
- ✅ **pull-requests: write** - Comment on PRs

These are automatically provided by `${{ secrets.GITHUB_TOKEN }}` in GitHub Actions.

## Development Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feat/awesome-feature

# Make changes with conventional commits
git commit -m "feat(upload): add drag-and-drop support"
git commit -m "test(upload): add drag-drop tests"
git commit -m "docs(readme): document drag-drop feature"

# Push and create PR
git push origin feat/awesome-feature
gh pr create --base main
```

### After PR Merge

1. PR is merged to `main`
2. GitHub Actions automatically triggers
3. Semantic-release analyzes commits
4. If releasable commits exist:
   - Version is bumped (e.g., `1.2.0` → `1.3.0`)
   - Changelog is updated
   - GitHub release is created
   - PR is commented with release info

### Beta Releases

For testing features before production:

```bash
# Create feature branch from beta
git checkout -b feat/experimental beta

# Make changes
git commit -m "feat(ai): add GPT-4 support"

# Merge to beta branch
git checkout beta
git merge feat/experimental
git push origin beta

# Semantic-release creates: 1.3.0-beta.1
```

## Versioning Strategy

This project follows [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** version (`x.0.0`): Breaking changes
- **MINOR** version (`0.x.0`): New features (backward compatible)
- **PATCH** version (`0.0.x`): Bug fixes and improvements

## Configuration Files

### `.releaserc.json`

Configures semantic-release behavior:
- Commit analysis rules
- Changelog generation
- GitHub release settings
- Git commit strategy

### `.github/workflows/release.yml`

GitHub Actions workflow:
- Triggers on `main` and `beta` branches
- Runs build and tests
- Executes semantic-release

## Troubleshooting

### No Release Created

**Possible reasons:**

1. **No releasable commits**: Only `chore`, `test`, or `ci` commits
   - **Solution**: Ensure at least one `feat`, `fix`, `perf`, `refactor`, `docs`, or `build` commit

2. **Invalid commit format**: Commits don't follow conventional format
   - **Solution**: Use proper format: `type(scope): subject`

3. **No changes since last release**: All commits already released
   - **Solution**: This is expected behavior

### Release Failed

Check GitHub Actions logs:

1. Go to **Actions** → **Release** workflow
2. Click on failed run
3. Check error messages

**Common issues:**

- **Token permissions**: Ensure `GITHUB_TOKEN` has required permissions
- **Build failure**: Fix build errors before release
- **Test failure**: Fix failing tests

### Force Release

If you need to force a release without waiting for commits:

```bash
# Create an empty commit with feat type
git commit --allow-empty -m "feat: trigger release"
git push origin main
```

## Best Practices

1. **Always use conventional commits** - Enables automation
2. **Write descriptive commit messages** - Appears in changelog
3. **Test before merging to main** - Avoid broken releases
4. **Use scopes** - Helps organize changelog (`feat(auth):`, `fix(ui):`)
5. **Document breaking changes** - Include migration guide in commit body
6. **Keep PRs focused** - One feature/fix per PR for cleaner releases

## Examples

### Good Commit Messages

```bash
feat(auth): add Google OAuth integration
fix(upload): resolve file size validation error
perf(gemini): implement response caching
docs(contributing): add release process guide
refactor(components): migrate to folder-per-component pattern
```

### Bad Commit Messages

```bash
update stuff
fixed bug
WIP
asdf
Updated files
```

## Release Checklist

Before merging to `main`:

- [ ] All tests passing
- [ ] Build succeeds
- [ ] Commit messages follow conventional format
- [ ] Breaking changes documented in commit footer
- [ ] CHANGELOG preview looks correct
- [ ] PR approved and ready to merge

## Additional Resources

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.
