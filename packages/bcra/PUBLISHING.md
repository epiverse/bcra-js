# Publishing Guide for BCRA Package

**For Maintainers Only**

This document provides comprehensive instructions for publishing new versions of the BCRA package to NPM.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Publication Checklist](#pre-publication-checklist)
- [Publishing Workflow](#publishing-workflow)
- [Post-Publication Verification](#post-publication-verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Best Practices](#best-practices)

---

## Prerequisites

Before publishing, ensure you have:

1. **Repository Access**
   - Write access to the `epiverse/bcra-js` repository
   - Ability to trigger GitHub Actions workflows

2. **NPM Token Configured**
   - `NPM_TOKEN` secret is properly configured in GitHub repository settings
   - Token has publish permissions for the `bcra` package

3. **Local Development Environment**
   - Node.js 18+ installed
   - Git configured with your credentials
   - Clone of the repository

---

## Pre-Publication Checklist

Complete these steps before publishing:

### 1. Code Quality

- [ ] All tests pass locally (`npm test`)
- [ ] Code coverage meets requirements (>90%)
- [ ] Build succeeds without warnings (`npm run build`)
- [ ] No console errors or warnings
- [ ] TypeScript definitions are up-to-date

### 2. Documentation

- [ ] README.md is updated with new features
- [ ] CHANGELOG.md is updated (if exists)
- [ ] JSDoc comments are complete
- [ ] API changes are documented
- [ ] Migration guide provided (for breaking changes)

### 3. Version Management

- [ ] Version number follows [Semantic Versioning](https://semver.org/)
- [ ] Version is bumped in `package.json`
- [ ] Git branch is clean (no uncommitted changes)
- [ ] Latest changes pulled from `main` branch

### 4. Cross-Validation

- [ ] All cross-validation tests pass (R vs JS)
- [ ] Race-specific models validated: 110/110 ✓
- [ ] Age edge cases validated: 23/23 ✓
- [ ] Pattern numbers validated: 108/108 ✓

---

## Publishing Workflow

### Step 1: Update Version Number

Use npm's built-in versioning commands:

```bash
cd packages/bcra

# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features, backward compatible (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major

# For pre-release versions
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0
```

**Note**: `npm version` automatically creates a git commit and tag. You may want to use the `--no-git-tag-version` flag if you prefer to commit manually.

### Step 2: Review Changes

```bash
# Check what will be published
npm pack --dry-run

# Verify package contents
npm pack
tar -tzf bcra-*.tgz
rm bcra-*.tgz

# Check bundle sizes
ls -lh dist/
```

**Expected bundle sizes:**
- ES Module: ~14 KB (gzipped: ~6 KB)
- UMD: ~14 KB (gzipped: ~6 KB)

### Step 3: Commit Version Bump

```bash
# Add version change
git add package.json

# Commit with descriptive message
git commit -m "chore: bump version to X.Y.Z"

# Push to main branch
git push origin main
```

### Step 4: Trigger GitHub Actions Workflow

1. Navigate to the GitHub repository
2. Go to **Actions** tab
3. Select **"Publish to NPM"** workflow from the left sidebar
4. Click **"Run workflow"** button (top right)
5. Ensure `main` branch is selected
6. Click **"Run workflow"** to start

### Step 5: Monitor Workflow Execution

Watch the workflow logs for:

- ✅ **Tests Pass**: All 450+ tests should pass
- ✅ **Build Success**: Both ES and UMD bundles created
- ✅ **Bundle Size Check**: Bundles under 50KB
- ✅ **Package Verification**: Contents validated
- ✅ **Version Check**: Version doesn't exist on NPM
- ✅ **NPM Publish**: Package published successfully
- ✅ **Git Tag Created**: Version tag pushed to repository
- ✅ **GitHub Release**: Release created with CDN links

**Typical workflow duration**: 2-3 minutes

---

## Post-Publication Verification

After successful publication, verify the package is available:

### 1. NPM Registry

Visit https://www.npmjs.com/package/bcra

**Check:**
- [ ] Version number matches
- [ ] Package size is reasonable (~15 KB)
- [ ] README displays correctly
- [ ] License is GPL-3.0-or-later
- [ ] Links work (repository, issues, homepage)

### 2. CDN Availability

Test CDN links (replace `X.Y.Z` with actual version):

**jsDelivr:**
```
https://cdn.jsdelivr.net/npm/bcra@X.Y.Z/dist/bcra.es.js
https://cdn.jsdelivr.net/npm/bcra@X.Y.Z/dist/bcra.umd.js
```

**unpkg:**
```
https://unpkg.com/bcra@X.Y.Z/dist/bcra.es.js
https://unpkg.com/bcra@X.Y.Z/dist/bcra.umd.js
```

**Skypack:**
```
https://cdn.skypack.dev/bcra@X.Y.Z
```

**Note**: CDNs may take 5-10 minutes to propagate after publication.

### 3. Installation Test

Create a test project and install the package:

```bash
mkdir bcra-test && cd bcra-test
npm init -y
npm install bcra@X.Y.Z

# Test ES Module import
node -e "import('bcra').then(m => console.log('✓ ES Module:', typeof m.calculateRisk))"

# Test CommonJS require
node -e "const { calculateRisk } = require('bcra'); console.log('✓ CommonJS:', typeof calculateRisk)"
```

### 4. Functionality Test

```bash
# Create test file
cat > test.mjs << 'EOF'
import { calculateRisk, RaceCode } from 'bcra';

const result = calculateRisk({
  id: 1,
  initialAge: 40,
  projectionEndAge: 50,
  race: RaceCode.WHITE,
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 0,
});

console.log('✓ Calculation successful:', result.success);
console.log('✓ Absolute Risk:', result.absoluteRisk.toFixed(2) + '%');
EOF

node test.mjs
```

**Expected output:**
```
✓ Calculation successful: true
✓ Absolute Risk: 2.34%
```

### 5. GitHub Release

Visit https://github.com/epiverse/bcra-js/releases

**Verify:**
- [ ] Release tag matches version (`vX.Y.Z`)
- [ ] Release notes include installation and CDN links
- [ ] Release is not marked as pre-release (unless intentional)

---

## Troubleshooting

### Publication Fails: "Version already exists"

**Problem**: The version number already exists on NPM.

**Solution**:
```bash
# Check published versions
npm view bcra versions

# Bump to next version
npm version patch  # or minor/major

# Commit and retry
git add package.json
git commit -m "chore: bump version to X.Y.Z"
git push origin main
```

### Tests Failing in GitHub Actions

**Problem**: Tests pass locally but fail in CI.

**Solution**:
1. Pull latest changes: `git pull origin main`
2. Clean install: `rm -rf node_modules && npm ci`
3. Run tests locally: `npm test`
4. Check Node.js version matches CI (v20)
5. Review failing test output in GitHub Actions logs

### Bundle Size Too Large

**Problem**: Bundle exceeds 50KB threshold.

**Solution**:
1. Analyze bundle composition:
   ```bash
   npm run build
   ls -lh dist/
   ```
2. Check for accidentally bundled dependencies
3. Review recent changes for large additions
4. Consider code splitting or tree shaking

### CDN Links Not Working

**Problem**: CDN returns 404 error.

**Solution**:
1. Wait 10-15 minutes for CDN propagation
2. Clear CDN cache (if applicable)
3. Verify version number in URL
4. Check NPM package was published successfully

### GitHub Release Not Created

**Problem**: Package published but no GitHub release.

**Solution**:
1. Check GitHub Actions workflow logs for errors
2. Verify `GITHUB_TOKEN` has correct permissions
3. Manually create release using GitHub UI:
   - Go to Releases → Draft a new release
   - Tag: `vX.Y.Z`
   - Title: `Release vX.Y.Z`
   - Include CDN links from workflow template

---

## Rollback Procedures

### Deprecating a Published Version

If a critical bug is discovered after publication:

```bash
# Deprecate the problematic version
npm deprecate bcra@X.Y.Z "Critical bug: [brief description]. Use version X.Y.Z+1 instead."
```

**Important**: NPM does not allow unpublishing after 24 hours. Deprecation is the recommended approach.

### Publishing a Hotfix

For critical bugs requiring immediate fix:

1. Create hotfix branch:
   ```bash
   git checkout -b hotfix/X.Y.Z+1
   ```

2. Fix the issue and add tests

3. Bump patch version:
   ```bash
   npm version patch
   ```

4. Follow normal publishing workflow

5. Deprecate broken version (see above)

### Rolling Back to Previous Version

Users can install previous versions:

```bash
# Install specific version
npm install bcra@X.Y.Z-1

# Or use version range
npm install bcra@~X.Y.0
```

---

## Best Practices

### Version Numbering

Follow [Semantic Versioning](https://semver.org/) strictly:

**MAJOR.MINOR.PATCH**

- **MAJOR** (X.0.0): Breaking API changes
  - Removing or renaming exported functions
  - Changing function signatures incompatibly
  - Removing race codes or constants

- **MINOR** (1.X.0): New features, backward compatible
  - Adding new race models
  - Adding new helper functions
  - Enhancing existing features without breaking changes

- **PATCH** (1.0.X): Bug fixes and minor improvements
  - Fixing calculation errors
  - Improving error messages
  - Documentation updates
  - Performance optimizations

### Release Frequency

- **Patch releases**: As needed for bug fixes (no delay)
- **Minor releases**: Every 2-4 weeks for new features
- **Major releases**: Planned releases (6+ months), with migration guide

### Communication

Before major releases:

1. **Announce breaking changes** in GitHub Discussions
2. **Provide migration guide** in documentation
3. **Tag issues** with milestone for next major version
4. **Give users advance notice** (at least 2 weeks)

### Testing

Always test thoroughly before publishing:

1. Run full test suite locally
2. Test on multiple Node.js versions (18, 20, 22)
3. Test in browser environments
4. Verify TypeScript definitions
5. Check cross-validation against R package

### Documentation

Keep documentation synchronized with code:

1. Update README.md with new features
2. Update JSDoc comments for API changes
3. Add examples for new functionality
4. Update TypeScript definitions
5. Maintain CHANGELOG.md (if exists)

---

## Additional Resources

- **Semantic Versioning**: https://semver.org/
- **NPM Publishing Guide**: https://docs.npmjs.com/cli/v10/commands/npm-publish
- **GitHub Actions**: https://docs.github.com/en/actions
- **Repository**: https://github.com/epiverse/bcra-js

---

## Support

For questions about publishing:

- **Repository Issues**: https://github.com/epiverse/bcra-js/issues
- **GitHub Discussions**: https://github.com/epiverse/bcra-js/discussions
- **Maintainer**: Jeya Balaji Balasubramanian

---

**Last Updated**: November 2025
**Current Version**: 1.0.1
