# PartyMacroManager

[![Code Review](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/lint.yml/badge.svg)](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/lint.yml)
[![Release](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/release.yml/badge.svg)](https://github.com/Can-We-Pull/PartyMacroManager/actions/workflows/release.yml)

Auto-creates interrupt macros based on party position for World of Warcraft.

## Development Setup

This project uses **TypeScript-to-Lua (TSTL)** for type-safe World of Warcraft addon development. The project is transitioning from a hybrid TypeScript/Lua approach to a **pure TypeScript** implementation with a modern build system.

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

2. **(Optional) Configure custom WoW path:**
   
   If you have multiple WoW installations or a non-standard path, create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and set your WoW client root path:
   ```bash
   # Point to the root of your client version (_retail_, _classic_era_, _classic_)
   # The script automatically appends /Interface/AddOns/PartyMacroManager
   WOW_RETAIL_PATH=/path/to/World of Warcraft/_retail_
   
   # WSL example:
   WOW_RETAIL_PATH=/mnt/c/Program Files (x86)/World of Warcraft/_retail_
   ```
   
   If you don't create `.env.local`, the dev script will auto-detect your WoW installation.

3. **Start development mode:**
   ```bash
   npm run dev
   ```
   
   This will:
   - Transpile TypeScript to Lua automatically using TSTL
   - Watch for changes in `src/` (`.ts` files)
   - Auto-detect your WoW addon directory (or use your `.env.local` path)
   - Sync transpiled Lua files to your WoW addon directory
   - Generate the `.toc` file from `package.json`

4. **Build for distribution:**
   ```bash
   npm run build
   ```
   
   This creates a production build in `dist/`:
   - `dist/dev/` - Development files (ready to copy to WoW)
   - `dist/PartyMacroManager-<version>.zip` - Distribution package

## Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start watch mode - transpile TS and sync to WoW |
| `npm run build` | Create a production build (zip file for distribution) |
| `npm run build 1.2.3` | Build with a specific version number |
| `npm run transpile` | Transpile TypeScript to Lua once |

### Testing & Quality
| Command | Description |
|---------|-------------|
| `npm test` | Run bundle size regression test |
| `npm run test:update-baseline` | Update bundle size baseline (after intentional changes) |
| `npm run lint` | Run all linters (TypeScript + JavaScript) |
| `npm run lint:ts` | TypeScript type checking only |
| `npm run lint:js` | Run JavaScript/ESLint only |
| `npm run lint:workflows` | Lint GitHub Actions workflow files |
| `npm run lint:fix` | Auto-format and fix all issues |

## Project Structure

```
PartyMacroManager/
├── src/                                # TypeScript source files
│   ├── index.ts                       # Entry point - instantiates addon
│   ├── PartyMacroManager.ts           # Main addon class
│   ├── types.ts                       # Shared type definitions
│   ├── wow-api.d.ts                   # WoW API type definitions
│   ├── settings/                      # Settings UI classes
│   │   ├── SettingsPanel.ts           # Settings panel coordinator
│   │   ├── IconSelectionPanel.ts      # Icon picker UI
│   │   ├── CustomTexturePanel.ts      # Custom texture input UI
│   │   ├── ChatVerbosityPanel.ts      # Chat verbosity selector UI
│   │   └── AdvancedControlsPanel.ts   # Advanced controls UI
│   └── data/                          # Data files
│       └── iconOptions.json           # Icon presets configuration
├── dist/                               # Build output (generated)
│   ├── dev/                           # Development build
│   │   ├── index.lua                  # Bundled transpiled TypeScript
│   │   └── *.toc                      # Generated .toc file
│   └── PartyMacroManager-<version>.zip  # Distribution package
├── scripts/                            # Build tools (ES modules)
│   ├── dev.mjs                        # Watch mode with auto-sync
│   └── build.mjs                      # Production build with .toc generation
├── docs/                               # Documentation
│   ├── ARCHITECTURE.md                # Architecture overview
│   └── JAVASCRIPT_TOOLING.md          # Build system documentation
├── tsconfig.json                       # TypeScript-to-Lua configuration
├── eslint.config.mjs                   # JavaScript linting configuration
├── vitest.config.js                    # Test runner configuration
├── commitlint.config.cjs               # Commit message linting
└── package.json                        # Project dependencies and scripts
```

## Architecture

This addon is built with a **clean, class-based architecture** using TypeScript:

- **PartyMacroManager**: Main addon class managing core functionality
- **SettingsPanel**: Coordinator for all settings UI components
- **Panel Components**: Self-contained, composable UI classes
- **No side-effect imports**: Explicit instantiation for predictable behavior
- **Single bundle output**: All code compiled to one `index.lua` file

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development Workflow

### TypeScript-to-Lua Transpilation

This project uses **TypeScript-to-Lua** for type-safe WoW addon development:

```typescript
// src/PartyMacroManager.ts
export class PartyMacroManager {
  private db: SavedVariables;
  
  public getMyPartyIndex(): number | null {
    const numGroupMembers = GetNumGroupMembers() || 0;
    // TypeScript provides full type safety and IntelliSense
    return IsInRaid() ? 1 : null;
  }
}
```

Transpiles to clean, idiomatic Lua:

```lua
-- Bundled in dist/dev/index.lua
PartyMacroManager = __TS__Class()
function PartyMacroManager.prototype.getMyPartyIndex(self)
  local numGroupMembers = GetNumGroupMembers() or 0
  return IsInRaid() and 1 or nil
end
```

**Benefits:**
- ✅ Full TypeScript type safety with class-based design
- ✅ Compile-time error checking
- ✅ Comprehensive WoW API type definitions (`wow-api.d.ts`)
- ✅ Modern ES6+ syntax (classes, arrow functions, const/let, template strings)
- ✅ Proper encapsulation and separation of concerns
- ✅ Automated `.toc` file generation from `package.json`
- ✅ Single bundled output for clean distribution
- ✅ Clean, idiomatic Lua output

### Build System

The project uses a modern build system with:

- **TypeScript-to-Lua with bundling** - Transpiles TypeScript to single Lua 5.1 bundle
- **Automated .toc generation** - Reads metadata from `package.json` addon section
- **Auto-detection** - Finds your WoW addon directory (Windows/macOS/Linux/Wine/Bottles)
- **Distribution packaging** - Creates `.zip` files ready for CurseForge/Wago

#### Addon Metadata

The `.toc` file is automatically generated from `package.json`:

```json
{
  "version": "1.1.0",
  "addon": {
    "title": "Party Macro Manager",
    "notes": "Auto-creates interrupt macros based on party position",
    "author": "Darcilynn",
    "interface": ["120000", "110207", "50503", "38000", "20505", "11508"],
    "savedVariables": ["PartyMacroManagerDB"],
    "loadOrder": ["index.lua"]
  }
}
```

### Watch Mode
```bash
npm run dev
```
- Watches `src/` for TypeScript changes
- Automatically transpiles TypeScript to Lua using TSTL
- Syncs transpiled files to WoW addon directory
- Generates `.toc` file
- Cross-platform (works on Windows, macOS, Linux, Wine, Bottles)

### VS Code Integration

The project includes VS Code configuration for an optimal development experience:

- **IntelliSense** - Full TypeScript IntelliSense with WoW API type definitions
- **Type Checking** - Real-time TypeScript error detection
- **Inline Linting** - See lint errors directly in the editor as you type
- **Tasks** - Run common commands from VS Code's task runner (Cmd/Ctrl+Shift+P → "Tasks: Run Task")
  - Watch & Sync to WoW
  - Transpile TypeScript
  - Lint TypeScript Files
  - Build Addon

**Recommended Extensions** (VS Code will prompt to install):
- `typescript` - TypeScript language support (built-in)
- `usernamehw.errorlens` - Shows errors inline in the editor
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

### Bundle Size Testing
The project includes automated bundle size regression testing to prevent unintended growth:
```bash
npm test                        # Check bundle size against baseline
npm run test:update-baseline    # Update baseline after intentional changes
```

The test will fail if the bundle size increases by more than 5% from the baseline. All tests run automatically in CI/CD on every pull request.

### Linting
The project includes comprehensive linting for both Lua and JavaScript:

```bash
npm run lint              # Run all linters
npm run lint:lua          # Lua code only
npm run lint:js           # JavaScript code only
npm run lint:workflows    # GitHub Actions workflows
npm run format            # Format Lua with StyLua
npm run lint:fix          # Format + fix all issues
```

**Code Quality Tools:**
- **StyLua** - Industry-standard Lua formatter (like Prettier for JS)
- **Luacheck** - Lua static analyzer via Node.js bindings
- **ESLint** - JavaScript linting for build scripts
- **actionlint** - GitHub Actions workflow linter (requires local setup, see below)

### Setting Up Workflow Linting (actionlint)

To lint GitHub Actions workflows locally and catch issues before CI:

#### Linux (Ubuntu/Debian)
```bash
# Install shellcheck (required by actionlint)
sudo apt-get update && sudo apt-get install -y shellcheck

# Install actionlint
curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash | bash -s latest /usr/local/bin
sudo chmod +x /usr/local/bin/actionlint
```

#### macOS
```bash
# Install with Homebrew
brew install actionlint shellcheck
```

#### Windows
```powershell
# Using Chocolatey
choco install actionlint shellcheck

# Or using Scoop
scoop install actionlint shellcheck
```

#### Verify Installation
```bash
actionlint --version
shellcheck --version
npm run lint:workflows
```

This will catch YAML syntax errors, shellcheck issues, and GitHub Actions best practices violations before you push to CI.

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
- Direct Lua editing without type safety
- Shell scripts for builds
- No dependency management

This project uses a **modern TypeScript-to-Lua workflow**:
- ✅ **TypeScript-to-Lua (TSTL)** - Write type-safe TypeScript, compile to Lua
- ✅ Full IntelliSense and compile-time error checking
- ✅ Custom WoW API type definitions for autocomplete
- ✅ `package.json` for scripts and dependencies
- ✅ `npm run` commands (familiar from React, Angular, Vue, etc.)
- ✅ Automatic transpilation and file watching
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
- ✅ Environment-based configuration (`.env.local`)
- ✅ Professional testing with Vitest
- ✅ Code quality with TypeScript + ESLint
- ✅ Automated CI/CD with GitHub Actions

## Why TypeScript-to-Lua?

If you're coming from TypeScript/JavaScript, this setup will feel natural:
- **Type Safety**: Catch errors at compile time, not runtime in WoW
- **Better DX**: Full IntelliSense, autocomplete, and refactoring support
- **Modern Syntax**: Use ES6+ features (arrow functions, const/let, template strings)
- **WoW API Types**: Custom type definitions for WoW's API
- **Same Commands**: `npm run dev`, `npm run build`, `npm test`
- **Same Patterns**: `.env` files, `node_modules/`, `.gitignore`
- **Watch Mode**: Works the same as `tsc --watch`

The TypeScript code is transpiled to clean, readable Lua that runs natively in WoW. The **developer experience** is modern TypeScript, but the runtime is standard Lua.

### TypeScript Example

```typescript
// TypeScript with full type safety
PMM.GetMyPartyIndex = function (): number | null {
  const numGroupMembers = GetNumGroupMembers() || 0;
  
  if (numGroupMembers === 0 || IsInRaid()) {
    return 1;
  }
  
  const playerGUID = UnitGUID("player");
  const members: Array<{ guid: string; unit: string }> = [];
  
  members.push({ guid: playerGUID, unit: "player" });
  
  for (let i = 1; i <= 4; i++) {
    const unit = `party${i}`;
    if (UnitExists(unit)) {
      members.push({ guid: UnitGUID(unit), unit });
    }
  }
  
  table.sort(members, (a, b) => a.guid < b.guid);
  
  for (let i = 0; i < members.length; i++) {
    if (members[i].guid === playerGUID) {
      return i + 1;
    }
  }
  
  return null;
};
```

Transpiles to clean Lua:
```lua
PMM.GetMyPartyIndex = function()
    local numGroupMembers = GetNumGroupMembers() or 0
    if (numGroupMembers == 0) or IsInRaid() then
        return 1
    end
    local playerGUID = UnitGUID("player")
    local members = {}
    table.insert(members, {guid = playerGUID, unit = "player"})
    for i = 1, 4 do
        local unit = ("party" .. tostring(i))
        if UnitExists(unit) then
            table.insert(members, {guid = UnitGUID(unit), unit = unit})
        end
    end
    table.sort(members, function(a, b) return a.guid < b.guid end)
    for i = 0, #members - 1 do
        if members[i + 1].guid == playerGUID then
            return i + 1
        end
    end
    return nil
end
```

## License

See [license.md](license.md)
