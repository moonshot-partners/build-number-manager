# Build Number Manager

A GitHub Action that manages build numbers across repositories with automatic incrementing and persistence.

## Features

- 🔢 **Safe Build Number Management**: Automatically increments build numbers only on successful builds
- 💾 **Persistent Storage**: Stores build numbers in your repository using a JSON file
- 🔄 **Atomic Operations**: Ensures build numbers are always incremented safely
- 🏷️ **Multiple Identifiers**: Support for multiple build number sequences (e.g., staging, production, feature branches)
- 📝 **Post-Success Commits**: Only commits incremented numbers after successful workflow completion
- 🛡️ **Failure Protection**: Failed builds don't consume build numbers (similar to actions/cache pattern)

## Usage

### Basic Example

```yaml
name: Build and Deploy
on:
  push:
    branches: [staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Get Build Number
        id: build_number
        uses: moonshot-partners/build-number-manager@v1.0.0
        with:
          id: staging-branch
          initial_number: 20
          gh_repo: moonshot-partners/build-manager # repo where the action will store the state
          # Optional: Use Personal Access Token instead of default github.token
          # github_token: ${{ secrets.MY_GITHUB_PAT }}
          
      - name: Use Build Number
        run: |
          echo "Build Number: ${{ steps.build_number.outputs.build_number }}"
          echo "Previous Number: ${{ steps.build_number.outputs.previous_number }}"
```



## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `id` | Unique identifier for the build number (e.g., `staging-branch`, `production`) | ✅ | - |
| `initial_number` | Initial build number if the ID doesn't exist | ✅ | `1` |
| `gh_repo` | GitHub repository in format `owner/repo` | ✅ | - |
| `github_token` | GitHub token for repository access. Use Personal Access Token if you need custom permissions | ❌ | `${{ github.token }}` |

## Outputs

| Output | Description |
|--------|-------------|
| `build_number` | The incremented build number |
| `previous_number` | The previous build number before increment |

## Initial Number Behavior

When using the action for the first time with a new `id`:

- **`previous_number`**: Will be set to the `initial_number` value
- **`build_number`**: Will be set to `initial_number + 1`

**Example**: If you set `initial_number: 50` for a new ID:
- First run: `previous_number = 50`, `build_number = 51`
- Second run: `previous_number = 51`, `build_number = 52`
- And so on...

This ensures that the first actual build uses `initial_number + 1`, while still providing a meaningful previous number for reference.

## How It Works

1. **Initialization**: When first run with a new `id`, creates a build numbers file at `.github/build-numbers.json`
2. **Retrieval**: Reads the current build number for the specified `id`
3. **Increment**: Calculates next number (current + 1) and outputs it
4. **Build Process**: Your workflow uses the build number for building, testing, deploying
5. **Post Action**: **ONLY** if all workflow steps succeed, commits the incremented number to the repository
6. **Failure Protection**: If any step fails, the build number remains unchanged in the repository

## Build Numbers File Structure

The action stores build numbers in `.github/build-numbers.json`:

```json
{
  "staging-branch": 25,
  "production": 150,
  "feature-auth": 5
}
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Building for Distribution

```bash
# Build and package the action
npm run package
```

This creates a `dist/` directory with the compiled action ready for use.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run build` to compile
6. Submit a pull request

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/moonshot-partners/build-number-manager/issues) page. 
