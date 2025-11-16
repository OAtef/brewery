# GitHub Repository Setup Checklist

## ✅ Pre-Push Checklist

Before pushing your code to GitHub, ensure:

### 1. GitHub Actions are Enabled
- [ ] Go to Repository → **Settings** → **Actions** → **General**
- [ ] Select "Allow all actions and reusable workflows"

### 2. Repository Secrets (Optional)
Go to **Settings** → **Secrets and variables** → **Actions**:
- [ ] Add `CODECOV_TOKEN` (optional - for coverage badges)
- [ ] Add `DATABASE_URL` (if deploying to production)

### 3. Branch Protection Rules (Recommended)
Go to **Settings** → **Branches** → **Add rule** for `main`:
- [ ] ✅ Require a pull request before merging
- [ ] ✅ Require status checks to pass before merging
- [ ] ✅ Select required status checks:
  - [ ] `test (18.x)`
  - [ ] `test (20.x)` 
  - [ ] `lint`
  - [ ] `build`
- [ ] ✅ Require branches to be up to date before merging
- [ ] ✅ Include administrators (optional but recommended)

### 4. Workflow Permissions
Go to **Settings** → **Actions** → **General**:
- [ ] Select "Read and write permissions"
- [ ] ✅ Allow GitHub Actions to create and approve pull requests

## 🚀 First Test

After setup, test your pipeline:

1. **Push to a feature branch:**
   ```bash
   git checkout -b test-ci-pipeline
   git add .
   git commit -m "Test CI pipeline"
   git push origin test-ci-pipeline
   ```

2. **Check Actions tab** - You should see:
   - ✅ "Pre-commit Checks" workflow running
   - ✅ Tests passing
   - ✅ Build succeeding

3. **Create a Pull Request:**
   - ✅ "Pull Request Validation" workflow should run
   - ✅ Test results should appear as PR comment
   - ✅ All status checks should pass before merge is allowed

## 📊 Expected Workflow Behavior

### On Push to Feature Branch:
- Triggers: `Pre-commit Checks` (fast validation)
- Duration: ~3-5 minutes
- Tests: Basic test suite + build verification

### On Pull Request:
- Triggers: `Pull Request Validation` + `CI/CD Pipeline`
- Duration: ~5-10 minutes  
- Tests: Full test suite with coverage + detailed reporting

### On Push to Main:
- Triggers: `CI/CD Pipeline` + `Branch Protection`
- Duration: ~8-12 minutes
- Tests: Full test suite + build + coverage upload

## 🆘 Troubleshooting

### If workflows don't trigger:
1. Check if GitHub Actions are enabled
2. Verify workflow files are in `.github/workflows/`
3. Check repository permissions

### If tests fail in CI but pass locally:
1. Environment variables might be missing
2. Database connection issues
3. Node.js version differences

### If branch protection blocks everything:
1. Temporarily disable protection rules
2. Push initial code
3. Re-enable protection rules

## 🎯 Quick Commands

Test your setup locally before pushing:
```bash
# Run the same tests as CI
npm run test:ci

# Run pre-commit checks
npm run pre-commit

# Check if build works
npm run build
```

## 📋 Minimal Setup (No Branch Protection)

If you want the pipeline without branch protection:
- [ ] Enable GitHub Actions
- [ ] Push your code
- [ ] Workflows will run automatically on push/PR

That's it! The workflows are already configured and will work immediately.
