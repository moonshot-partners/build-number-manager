# Usage Example

This document shows how to use the Build Number Manager action with the exact parameters mentioned in your requirements.

## Basic Usage

Here's how to use the action with your specific parameters:

```yaml
name: Build with Number Management
on:
  push:
    branches: [staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Get Build Number
        id: build_number
        uses: ./  # or use the published action: moonshot-partners/build-number-manager@v1
        with:
          id: staging-branch
          initial_number: 20
          gh_repo: moonshot-partners/build-numbers

      - name: Use the build number
        run: |
          echo "Current build number: ${{ steps.build_number.outputs.build_number }}"
          echo "Previous build number: ${{ steps.build_number.outputs.previous_number }}"

      - name: Build your application
        run: |
          # Your build commands here
          echo "Building with number ${{ steps.build_number.outputs.build_number }}"
          # If this step fails, the build number won't be incremented in the repo

      - name: Deploy
        run: |
          # Your deployment commands here
          echo "Deploying build ${{ steps.build_number.outputs.build_number }}"
          # Only if ALL steps succeed, the build number gets saved
```

## How it works with your parameters:

1. **`id: staging-branch`** - This creates a unique identifier for your staging branch builds
2. **`initial_number: 20`** - If this is the first time running with this ID, it will start at 20
3. **`gh_repo: moonshot-partners/build-manager`** - This is the repository where build numbers are stored

## What happens (NEW BEHAVIOR):

### ✅ **Safe Increment Pattern** (like actions/cache)

1. **Main Step**: Reads current number, calculates next number (current + 1), outputs it
2. **Your Build Steps**: Use the build number for building, testing, deploying
3. **Post Step**: **ONLY** if all previous steps succeed, saves the incremented number to repo

### 🔄 **Flow Example**:

```
1. Read current number: 25
2. Calculate next: 26
3. Output build_number: 26
4. Run your build steps with number 26
5. IF all steps succeed → Save 26 to repo
6. IF any step fails → Number 25 remains in repo (no increment)
```

### 🛡️ **Failure Protection**:

```yaml
- name: Get Build Number
  id: build_number
  uses: ./
  with:
    id: staging-branch
    initial_number: 20
    gh_repo: moonshot-partners/build-manager

- name: Build (might fail)
  run: |
    npm run build
    # If this fails, build number won't be incremented

- name: Test (might fail)  
  run: |
    npm test
    # If this fails, build number won't be incremented

- name: Deploy (might fail)
  run: |
    kubectl apply -f deployment.yaml
    # Only if ALL steps succeed, number gets saved
```

## Example output:

```json
{
  "staging-branch": 25,
  "production": 100,
  "feature-xyz": 5
}
```

## Multiple environments:

You can use different IDs for different environments:

```yaml
- name: Get Production Build Number
  uses: ./
  with:
    id: production
    initial_number: 100
    gh_repo: moonshot-partners/build-manager

- name: Get Staging Build Number
  uses: ./
  with:
    id: staging-branch
    initial_number: 20
    gh_repo: moonshot-partners/build-manager

- name: Get Feature Build Number
  uses: ./
  with:
    id: feature-${{ github.ref_name }}
    initial_number: 1
    gh_repo: moonshot-partners/build-manager
```

## Integration with Docker builds:

```yaml
- name: Get Build Number
  id: build_number
  uses: ./
  with:
    id: staging-branch
    initial_number: 20
    gh_repo: moonshot-partners/build-manager

- name: Build Docker image
  run: |
    docker build -t myapp:${{ steps.build_number.outputs.build_number }} .
    docker tag myapp:${{ steps.build_number.outputs.build_number }} myapp:latest

- name: Push to registry
  run: |
    docker push myapp:${{ steps.build_number.outputs.build_number }}
    docker push myapp:latest
    # Only if push succeeds, build number gets saved
```

## Key Features:

- ✅ **Safe increments**: Only increments if entire job succeeds
- ✅ **Failure protection**: Failed builds don't consume build numbers
- ✅ **Persistent storage**: Numbers are saved in your repository
- ✅ **Automatic commits**: No manual intervention needed (post-success)
- ✅ **Multiple environments**: Use different IDs for different purposes
- ✅ **Thread-safe**: Uses GitHub's atomic file operations
- ✅ **Post-pattern**: Similar to actions/cache behavior
