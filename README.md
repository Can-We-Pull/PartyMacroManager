# PartyMacroManager

[![Code Review](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/lint.yml/badge.svg)](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/lint.yml)
[![Release](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/release.yml/badge.svg)](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/release.yml)

Auto-creates interrupt macros based on party position for World of Warcraft.

## Development Setup

This project uses a **Node.js-based toolchain** (similar to TypeScript projects) for a familiar development experience, even though the addon itself is written in Lua.

### Prerequisites

- [Volta](https://volta.sh/) - Fast, reliable Node.js version manager
- World of Warcraft Retail

> **Note:** This project uses Volta to automatically manage Node.js and npm versions. Once Volta is installed, it will automatically use the correct versions (Node 22.x, npm 11.x) when you `cd` into this directory.

If you don't have Volta installed:
```bash
# Install Volta (macOS/Linux)
curl https://get.volta.sh | bash

# Or on Windows
# Download and run the installer from https://volta.sh
```

### Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your WoW path:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and set your WoW **_retail_** folder path (NOT the AddOns folder):
   ```bash
   # The script automatically appends /Interface/AddOns/PartyMacroManager
   WOW_RETAIL_PATH=/path/to/World of Warcraft/_retail_
   
   # WSL example (no escaped spaces needed):
   WOW_RETAIL_PATH=/mnt/c/Program Files (x86)/World of Warcraft/_retail_
   ```

3. **Start development mode:**
   ```bash
   npm run dev
   ```
   
   This will watch your source files and automatically copy changes to your WoW addon directory.

## Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start watch mode - automatically syncs changes to WoW |
| `npm run build` | Create a production build (zip file for distribution) |
| `npm run build 1.2.3` | Build with a specific version number |

### Testing & Quality
| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run all linters (Lua + JavaScript) |
| `npm run lint:lua` | Run Lua linter only |
| `npm run lint:js` | Run JavaScript/ESLint only |
| `npm run lint:fix` | Auto-fix all fixable issues |
| `npm run lint:js:fix` | Auto-fix JavaScript issues only |

## Project Structure

```
PartyMacroManager/
├── src/                    # Source files (Lua code)
│   ├── Core.lua           # Main addon logic
│   ├── Settings.lua       # Settings panel
│   └── *.toc              # Addon metadata
├── scripts/               # Build and dev tools (Node.js)
│   ├── dev.cjs           # Watch mode script
│   ├── build.cjs         # Production build script
│   ├── lint.cjs          # Lua linting script
│   ├── lint-fix.mjs      # Auto-fix Lua issues
│   └── fixers/           # Fixer modules with tests
├── .env.local            # Your local WoW path (not in git)
├── .env.local.example    # Example environment config
├── .luacheckrc           # Lua linting configuration
├── eslint.config.mjs     # JavaScript linting configuration
├── vitest.config.js      # Test runner configuration
├── commitlint.config.cjs # Commit message linting
└── package.json          # Project dependencies and scripts
```

## Development Workflow

### Watch Mode (Like TypeScript --watch)
```bash
npm run dev
```
- Watches `src/` for changes
- Uses SHA256 caching to avoid unnecessary copies
- Automatically syncs to your WoW addon directory
- Cross-platform (works on Windows, macOS, Linux)

### VS Code Integration

The project includes VS Code configuration for an optimal development experience:

- **IntelliSense** - Lua Language Server with WoW API globals configured
- **Inline Linting** - See lint errors directly in the editor as you type
- **Tasks** - Run common commands from VS Code's task runner (Cmd/Ctrl+Shift+P → "Tasks: Run Task")
  - Watch & Sync to WoW
  - Lint Lua Files
  - Fix Lint Issues
  - Build Addon

**Recommended Extensions** (VS Code will prompt to install):
- `sumneko.lua` - Lua Language Server
- `usernamehw.errorlens` - Shows errors inline in the editor

### Building for Production
```bash
npm run build
```
- Reads version from `package.json`
- Updates `.toc` file version
- Creates `PartyMacroManager.zip` for distribution

To build with a custom version:
```bash
npm run build 1.2.3
```

## Testing & Code Quality

### Running Tests
The project uses **Vitest** for fast, modern JavaScript testing:
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode for development
npm run test:ui           # Visual test interface
npm run test:coverage     # Generate coverage report
```

All tests run automatically in CI/CD on every pull request.

### Linting
The project includes comprehensive linting for both Lua and JavaScript:

```bash
npm run lint              # Run all linters
npm run lint:lua          # Lua code only
npm run lint:js           # JavaScript code only
npm run lint:fix          # Auto-fix all issues
```

**Note:** Luacheck requires the system binary. It's automatically installed via luarocks and added to PATH.

## CI/CD Workflows

The project uses GitHub Actions for automated quality checks and releases:

### Code Review (runs on every PR and push)
- ✅ Lua linting with luacheck
- ✅ JavaScript linting with ESLint
- ✅ Automated tests with Vitest
- ✅ Code coverage reporting
- ✅ Auto-formatting validation

### Build PR Preview
- 📦 Builds addon for every pull request
- 📎 Uploads artifacts for testing
- 💬 Comments on PR with download instructions

### Release (runs on main branch)
- 🚀 Automatic semantic versioning
- 🏷️ Creates GitHub releases with tags
- 📦 Builds and attaches distribution zip
- 📝 Updates version in package.json and .toc files

## How This Differs from Standard Lua Development

Most WoW addon developers use:
- Manual file copying or symlinks
- Shell scripts for builds
- No dependency management

This project uses a **modern JavaScript workflow**:
- ✅ `package.json` for scripts and dependencies
- ✅ `npm run` commands (familiar from React, Angular, Vue, etc.)
- ✅ Automatic file watching with caching
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
- ✅ Environment-based configuration (`.env.local`)
- ✅ Professional testing with Vitest (25 tests, 100% passing)
- ✅ Code quality with ESLint + luacheck
- ✅ Automated CI/CD with GitHub Actions

## Why This Approach?

If you're coming from TypeScript/JavaScript, this setup will feel familiar:
- Same commands (`npm run dev`, `npm run build`)
- Same patterns (`.env` files, `node_modules/`, `.gitignore`)
- Same tools (Node.js, npm)
- File watching works the same as `tsc --watch`

The Lua code itself isn't transpiled—it's copied directly to WoW. But the **developer experience** matches modern JavaScript tooling.

## License

See [license.md](license.md)
