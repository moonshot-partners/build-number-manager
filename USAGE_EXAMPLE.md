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
```

## How it works with your parameters:

1. **`id: staging-branch`** - This creates a unique identifier for your staging branch builds
2. **`initial_number: 20`** - If this is the first time running with this ID, it will start at 20
3. **`gh_repo: moonshot-partners/build-manager`** - This is the repository where build numbers are stored

## What happens:

1. **First run**: If `staging-branch` doesn't exist, it creates it with value 20, then outputs 21
2. **Subsequent runs**: It reads the current value, increments by 1, saves it, and outputs the new number
3. **Storage**: Build numbers are stored in `.github/build-numbers.json` in your repository
4. **Automatic commit**: After incrementing, the action commits the updated numbers back to the repo

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
```

## Key Features:

- ✅ **Always increments**: Every run outputs current number + 1
- ✅ **Persistent storage**: Numbers are saved in your repository
- ✅ **Automatic commits**: No manual intervention needed
- ✅ **Multiple environments**: Use different IDs for different purposes
- ✅ **Thread-safe**: Uses GitHub's atomic file operations 
