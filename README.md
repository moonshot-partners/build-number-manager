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
        uses: ./
        with:
          id: staging-branch
          initial_number: 20
          gh_repo: moonshot-partners/build-manager
          
      - name: Use Build Number
        run: |
          echo "Build Number: ${{ steps.build_number.outputs.build_number }}"
          echo "Previous Number: ${{ steps.build_number.outputs.previous_number }}"
```

### Advanced Example with Multiple Environments

```yaml
name: Multi-Environment Build
on:
  push:
    branches: [main, staging, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Determine Environment
        id: env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "env_id=production" >> $GITHUB_OUTPUT
            echo "initial=100" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            echo "env_id=staging" >> $GITHUB_OUTPUT
            echo "initial=20" >> $GITHUB_OUTPUT
          else
            echo "env_id=development" >> $GITHUB_OUTPUT
            echo "initial=1" >> $GITHUB_OUTPUT
          fi
          
      - name: Get Build Number
        id: build_number
        uses: ./
        with:
          id: ${{ steps.env.outputs.env_id }}
          initial_number: ${{ steps.env.outputs.initial }}
          gh_repo: ${{ github.repository }}
          
      - name: Build Application
        run: |
          echo "Building with build number: ${{ steps.build_number.outputs.build_number }}"
          # Your build commands here
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `id` | Unique identifier for the build number (e.g., `staging-branch`, `production`) | ✅ | - |
| `initial_number` | Initial build number if the ID doesn't exist | ✅ | `1` |
| `gh_repo` | GitHub repository in format `owner/repo` | ✅ | - |
| `github_token` | GitHub token for repository access | ❌ | `${{ github.token }}` |

## Outputs

| Output | Description |
|--------|-------------|
| `build_number` | The incremented build number |
| `previous_number` | The previous build number before increment |

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
