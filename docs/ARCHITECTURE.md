# PartyMacroManager Architecture

## Overview

PartyMacroManager is built with a clean, class-based architecture using TypeScript-to-Lua. The codebase is organized into logical modules with clear separation of concerns.

## Project Structure

```
src/
├── index.ts                          # Entry point - instantiates main addon
├── PartyMacroManager.ts              # Main addon class
├── types.ts                          # Shared type definitions
├── wow-api.d.ts                      # WoW API TypeScript definitions
├── data/
│   └── iconOptions.json              # Icon preset configuration
└── settings/
    ├── SettingsPanel.ts              # Settings panel coordinator
    ├── IconSelectionPanel.ts         # Icon picker UI
    ├── CustomTexturePanel.ts         # Custom texture input UI
    ├── ChatVerbosityPanel.ts         # Chat verbosity selector UI
    └── AdvancedControlsPanel.ts      # Advanced controls UI
```

## Core Classes

### PartyMacroManager

The main addon class that manages the core functionality:

- **Responsibilities:**
  - Saved variables initialization and management
  - Event handling (ADDON_LOADED, GROUP_ROSTER_UPDATE, etc.)
  - Macro creation, updating, and deletion
  - Party index calculation
  - Slash command registration
  - Periodic macro existence checking

- **Key Methods:**
  - `getDB()` - Access to saved variables
  - `getMyPartyIndex()` - Calculate player's position in party
  - `createOrUpdateMacro()` - Main macro management logic
  - `forceUpdate()` - Force macro recreation
  - `deleteMacro()` - Remove the addon's macro
  - `clearSettings()` - Reset all settings to defaults

### SettingsPanel

Coordinates the settings UI by composing all panel components:

- **Responsibilities:**
  - Create the main settings frame
  - Initialize all panel components
  - Coordinate panel layout
  - Register with WoW settings system

- **Components:**
  - IconSelectionPanel
  - CustomTexturePanel
  - ChatVerbosityPanel
  - AdvancedControlsPanel

### Panel Components

Each settings panel component is a self-contained class:

#### IconSelectionPanel
- Displays grid of preset icons
- Handles icon selection
- Updates macro when icon changes

#### CustomTexturePanel
- Provides input field for custom texture paths
- Validates and applies custom textures
- Clears preset selection when custom path is used

#### ChatVerbosityPanel
- Dropdown selector for chat message frequency
- Options: Silent, Minimal, Normal, Verbose

#### AdvancedControlsPanel
- Pause/resume macro recreation checkbox
- Delete macro button with confirmation
- Clear settings button with confirmation
- Manages StaticPopup dialogs

## Design Principles

### 1. Encapsulation
- Each class has private state and public methods
- No global namespace pollution (except required WoW integration)
- Clear interfaces between components

### 2. Single Responsibility
- Each class has one clear purpose
- Settings panels are independent and composable
- Core logic separated from UI

### 3. Dependency Injection
- Settings panels receive `PartyMacroManager` instance via constructor
- No tight coupling between modules
- Easy to test and maintain

### 4. No Side Effects on Import
- Unlike the previous architecture, importing modules doesn't execute code
- Explicit instantiation in `index.ts`
- Predictable initialization order

## Data Flow

```
index.ts
  └─> Creates PartyMacroManager instance
       ├─> Initializes saved variables
       ├─> Sets up event handlers
       ├─> Creates SettingsPanel
       │    └─> Creates all panel components
       │         └─> Each component stores reference to PartyMacroManager
       └─> Starts periodic checks
```

## Build Process

The TypeScript code is compiled to Lua using TypeScript-to-Lua (TSTL) with bundling:

1. **Transpilation**: `*.ts` → Lua modules
2. **Bundling**: All modules → single `index.lua`
3. **TOC Generation**: Package.json → `PartyMacroManager.toc`
4. **Packaging**: Files → `PartyMacroManager-{version}.zip`

The bundled output uses TSTL's module system with `require()` for imports.

## Event Flow

### Addon Load
1. WoW fires `ADDON_LOADED` event
2. `PartyMacroManager` constructor runs
3. Settings panel initializes after 0.1s delay
4. Initial macro creation after 1s delay

### Party Changes
1. WoW fires `GROUP_ROSTER_UPDATE` event
2. 0.5s delay to ensure data is ready
3. `createOrUpdateMacro()` calculates new party index
4. Macro updated if position changed or doesn't exist

### Periodic Check (every 5s)
1. Check if player is in party
2. Check if macro still exists
3. Recreate if deleted (unless paused)

### User Actions
- Icon selection → `forceUpdate()`
- Custom texture → `forceUpdate()`
- Delete macro → Confirmation dialog → `deleteMacro()`
- Clear settings → Confirmation dialog → `clearSettings()`

## Type Safety

The codebase uses TypeScript for full type checking:

- **types.ts**: Shared interfaces (SavedVariables, IconOption)
- **wow-api.d.ts**: WoW API type definitions
- **Class types**: All classes have proper typing
- **No `any` types**: Minimal use of type assertions

## Testing

- **Unit tests**: Via Vitest for build scripts
- **Type checking**: `npm run lint:ts` (tsc --noEmit)
- **Linting**: `npm run lint:js` (ESLint for scripts)
- **Build verification**: Automated in CI/CD

## Future Enhancements

Potential improvements to the architecture:

1. **Dependency Injection Container**: Formalize DI pattern
2. **Event Bus**: Decouple components further
3. **State Management**: Centralized state with observers
4. **Unit Tests**: Mock WoW API for testing classes
5. **Plugin System**: Allow extending functionality
