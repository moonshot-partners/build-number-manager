# Changelog

## [v2.0.0] - 2024-12-19

### 🚀 Major Changes - Post-Action Pattern Implementation

#### ✨ New Features
- **Post-Action Pattern**: Implemented similar to `actions/cache` behavior
- **Failure Protection**: Build numbers are only incremented if the entire job succeeds
- **Safe Increments**: Failed builds no longer consume build numbers

#### 🔄 How it works now:
1. **Main Action**: Reads current number, calculates next number (+1), outputs it
2. **Your Build Steps**: Use the build number for building, testing, deploying  
3. **Post Action**: **ONLY** if all steps succeed, saves the incremented number to repo

#### 🛡️ Failure Protection Examples:
```yaml
- name: Get Build Number
  uses: ./
  with:
    id: staging-branch
    initial_number: 20
    gh_repo: moonshot-partners/build-numbers

- name: Build (might fail)
  run: npm run build
  # If this fails → build number stays unchanged

- name: Test (might fail)  
  run: npm test
  # If this fails → build number stays unchanged

- name: Deploy (might fail)
  run: kubectl apply -f deployment.yaml
  # Only if ALL succeed → build number gets saved
```

#### 📁 Technical Changes:
- Added `post: 'dist/post.js'` to `action.yml`
- Split logic into `main` (read/calculate) and `post` (save) actions
- Added `getCurrentBuildNumber()` and `saveBuildNumber()` methods
- Updated build script to compile both `index.js` and `post.js`
- Enhanced state management using `core.saveState()` and `core.getState()`

#### 🔧 Build Process:
- Single command: `npm run build` now compiles both files
- Generates `dist/index.js` (main action) and `dist/post.js` (post action)

#### 📚 Documentation Updates:
- Updated `README.md` with new behavior explanation
- Enhanced `USAGE_EXAMPLE.md` with failure protection examples
- Added `examples/failure-protection.yml` workflow

#### ⚠️ Breaking Changes:
- Build numbers are no longer saved immediately
- Failed workflows will reuse the same build number on next run
- This is the intended behavior for better build number management

#### 🎯 Benefits:
- ✅ No wasted build numbers on failed builds
- ✅ Consistent numbering for successful deployments
- ✅ Better CI/CD reliability
- ✅ Similar pattern to popular actions like `actions/cache`

---

## [v1.0.0] - Previous Version

### Features
- Basic build number management
- Immediate increment and save
- Repository persistence
- Multiple environment support 
