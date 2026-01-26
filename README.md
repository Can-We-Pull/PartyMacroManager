# PartyMacroManager

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start watch mode - automatically syncs changes to WoW |
| `npm run build` | Create a production build (zip file for distribution) |
| `npm run build 1.2.3` | Build with a specific version number |
| `npm run lint` | Run Lua linter to check code quality |
| `npm run lint:fix` | Auto-fix whitespace and formatting issues |

## Project Structure

```
PartyMacroManager/
├── src/                    # Source files (Lua code)
│   ├── Core.lua           # Main addon logic
│   ├── Settings.lua       # Settings panel
│   └── *.toc              # Addon metadata
├── scripts/               # Build and dev tools (Node.js)
│   ├── dev.js            # Watch mode script
│   └── build.js          # Production build script
├── .env.local            # Your local WoW path (not in git)
├── .env.local.example    # Example environment config
├── .luacheckrc           # Lua linting configuration
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

### Code Quality (Optional)
The project includes `luacheck` as a dev dependency for linting:
```bash
npm run lint
```

**Note:** Luacheck requires the system binary to be installed. The setup automatically installs it via luarocks to `~/.luarocks/bin/` and adds it to your PATH in `.zshrc`.

## How This Differs from Standard Lua Development

Most WoW addon developers use:
- Manual file copying or symlinks
- Shell scripts for builds
- No dependency management

This project uses a **TypeScript-style workflow**:
- ✅ `package.json` for scripts and dependencies
- ✅ `npm run` commands (familiar from React, Angular, Vue, etc.)
- ✅ Automatic file watching with caching
- ✅ Cross-platform compatibility
- ✅ Environment-based configuration (`.env.local`)
- ✅ Optional linting support

## Why This Approach?

If you're coming from TypeScript/JavaScript, this setup will feel familiar:
- Same commands (`npm run dev`, `npm run build`)
- Same patterns (`.env` files, `node_modules/`, `.gitignore`)
- Same tools (Node.js, npm)
- File watching works the same as `tsc --watch`

The Lua code itself isn't transpiled—it's copied directly to WoW. But the **developer experience** matches modern JavaScript tooling.

## License

See [license.md](license.md)
