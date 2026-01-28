// PartyMacroManager.ts - Main addon class
/** @noSelfInFile */

import type { SavedVariables } from './types';
import { SettingsPanel } from './settings/SettingsPanel';
import { logFactory } from './utils/logger';

export class PartyMacroManager {
  private static readonly ADDON_NAME = 'PartyMacroManager';
  private static readonly MACRO_NAME = 'PartyInterrupt';

  private db: SavedVariables;
  private lastPartyIndex: number | null = null;
  private frame: Frame;
  private settingsPanel: SettingsPanel;
  private isLoggingOut = false;
  private originalEventHandler: ((self: Frame, event: string, ...args: any[]) => void) | null = null;
  private logFn: (message: string, type?: 'info' | 'warn' | 'error') => void;

  constructor() {
    // Initialize saved variables with defaults
    (globalThis as any).PartyMacroManagerDB = (globalThis as any).PartyMacroManagerDB || {
      macroIcon: 'Ability_Hunter_SniperShot',
      customTexturePath: '',
      chatVerbosity: 'normal' as const,
      partyMessageFormat: 'Interrupting %i',
    };

    this.db = (globalThis as any).PartyMacroManagerDB as SavedVariables;

    // Apply defaults for any missing keys using direct property assignment
    if (this.db.macroIcon === undefined) this.db.macroIcon = 'Ability_Hunter_SniperShot';
    if (this.db.customTexturePath === undefined) this.db.customTexturePath = '';
    if (this.db.chatVerbosity === undefined) this.db.chatVerbosity = 'normal';
    if (this.db.partyMessageFormat === undefined) this.db.partyMessageFormat = 'Interrupting %i';

    // Initialize logger
    const logFunction = logFactory(this.db);
    this.logFn = (message: string, type?: 'info' | 'warn' | 'error') => logFunction(message, type);

    this.frame = CreateFrame('Frame');
    this.settingsPanel = new SettingsPanel(this);
    this.setupEvents();
    this.setupSlashCommands();
    // REMOVED: this.hookStaticPopups(); - This was causing taint!

    this.logFn('Loaded. Use /partymacro or /pm to manually update. Use /pm config for options.', 'info');
  }

  public getDB(): SavedVariables {
    return this.db;
  }

  public log(message: string, type?: 'info' | 'warn' | 'error'): void {
    this.logFn(message, type);
  }

  public getSettingsPanel(): SettingsPanel {
    return this.settingsPanel;
  }

  private setupEvents(): void {
    this.frame.RegisterEvent('PLAYER_LEAVING_WORLD');
    this.frame.RegisterEvent('GROUP_ROSTER_UPDATE');
    this.frame.RegisterEvent('PLAYER_ENTERING_WORLD');

    const eventHandler = ((self: Frame, event: string, ...args: any[]) => {
      // Handle logout FIRST and stop all processing immediately
      if (event === 'PLAYER_LEAVING_WORLD') {
        this.isLoggingOut = true;
        // Unregister all events to stop receiving any more callbacks
        this.frame.UnregisterAllEvents();
        // Clear the event script entirely
        this.frame.SetScript('OnEvent', null);
        return;
      }

      // Also skip if ANY static popup is visible
      for (let i = 1; i <= 4; i++) {
        const popup = (globalThis as any)[`StaticPopup${i}`];
        if (popup && popup.which) {
          // A popup is showing, don't do anything
          return;
        }
      }

      if (event === 'GROUP_ROSTER_UPDATE' || event === 'PLAYER_ENTERING_WORLD') {
        // Debug: Log when we receive these events
        if (this.db.chatVerbosity === 'verbose') {
          this.logFn(`Event received: ${event}`, 'info');
        }
        // Call directly without timer to avoid any pending callbacks during logout
        this.createOrUpdateMacro();
      }
    }) as any;

    this.originalEventHandler = eventHandler;
    this.frame.SetScript('OnEvent', eventHandler);

    // Check if we're already in a party after initialization - call directly
    this.createOrUpdateMacro();
  }

  private setupSlashCommands(): void {
    (globalThis as any).SLASH_PARTYMACRO1 = '/partymacro';
    (globalThis as any).SLASH_PARTYMACRO2 = '/pm';
    SlashCmdList['PARTYMACRO'] = (msg: string) => {
      if (msg === 'config' || msg === 'options') {
        const categoryID = this.settingsPanel.getCategoryID();
        if (categoryID !== undefined) {
          Settings.OpenToCategory(categoryID);
        } else {
          this.logFn('Settings panel not yet initialized. Please try again.', 'error');
        }
      } else {
        this.createOrUpdateMacro();
      }
    };
  }

  public getMyPartyIndex(): number | null {
    // Returns 1-5 based on party position
    const numGroupMembers = GetNumGroupMembers() || 0;

    // Not in a group, or in a raid
    if (numGroupMembers === 0 || IsInRaid()) {
      return 1;
    }

    // Must be in a 5-player party
    if (numGroupMembers > 5) {
      return 1;
    }

    // Get player GUID
    const playerGUID = UnitGUID('player');
    const members: Array<{ guid: string; unit: string }> = [];

    members.push({ guid: playerGUID, unit: 'player' });

    for (let i = 1; i <= 4; i++) {
      const unit = `party${i}`;
      if (UnitExists(unit)) {
        members.push({ guid: UnitGUID(unit), unit });
      }
    }

    // Sort by GUID to get consistent ordering
    table.sort(members, (a, b) => a.guid < b.guid);

    // Find our index
    for (let i = 0; i < members.length; i++) {
      if (members[i].guid === playerGUID) {
        return i + 1; // Lua is 1-indexed
      }
    }

    return null;
  }

  public createOrUpdateMacro(): void {
    // Don't do anything if we're logging out, in combat lockdown, or if any static popup is showing
    if (this.isLoggingOut || InCombatLockdown() || StaticPopup_Visible('CAMP') || StaticPopup_Visible('QUIT')) {
      return;
    }

    this.performMacroUpdate();
  }

  private performMacroUpdate(): void {
    const partyIndex = this.getMyPartyIndex();

    if (partyIndex === null) {
      if (this.db.chatVerbosity !== 'silent') {
        this.logFn('Not in a 5-player party. Macro not created.', 'error');
      }
      this.lastPartyIndex = null;
      return;
    }

    // Check if macro exists
    const macroIndex = GetMacroIndexByName(PartyMacroManager.MACRO_NAME);
    const macroExists = macroIndex !== 0;

    // Skip update only if: position unchanged AND macro still exists
    if (partyIndex === this.lastPartyIndex && macroExists) {
      return; // No change, skip update
    }

    // Build macro text - use string.char(10) for newline since \n gets double-escaped by TSTL
    const newline = string.char(10);
    // Replace %i in the party message format with the raid marker (use Lua's gsub directly)
    const messageFormat = this.db.partyMessageFormat || 'Interrupting %i';
    const raidMarker = string.format('{rt%d}', partyIndex);
    const partyMessage = string.gsub(messageFormat, '%%i', raidMarker, 1)[0]; // gsub returns (result, count)
    const macroText = `/focus${newline}${string.format('/tm %d', partyIndex)}${newline}/p ${partyMessage}`;

    // Determine which icon to use
    let selectedIcon: string;
    const customPath = this.db.customTexturePath;
    if (customPath && customPath !== '') {
      selectedIcon = customPath;
    } else {
      selectedIcon = this.db.macroIcon || 'Ability_Hunter_SniperShot';
    }

    if (!macroExists) {
      // Create new macro
      const [numGlobalMacros] = GetNumMacros();
      if (numGlobalMacros >= 36) {
        this.logFn('Cannot create macro - global macro limit reached!', 'error');
        this.lastPartyIndex = null;
        return;
      }

      CreateMacro(PartyMacroManager.MACRO_NAME, selectedIcon, macroText);

      const verbosity = this.db.chatVerbosity;
      if (verbosity === 'normal' || verbosity === 'verbose') {
        this.logFn(`Macro '${PartyMacroManager.MACRO_NAME}' created for party position ${partyIndex}`, 'info');
      }
    } else {
      // Update existing macro - macroIndex is guaranteed to be a valid number here since macroExists is true
      EditMacro(macroIndex as number, PartyMacroManager.MACRO_NAME, selectedIcon, macroText);

      if (this.db.chatVerbosity === 'verbose') {
        this.logFn(`Macro '${PartyMacroManager.MACRO_NAME}' updated for party position ${partyIndex}`, 'info');
      } else if (this.db.chatVerbosity === 'normal' && this.lastPartyIndex !== partyIndex) {
        this.logFn(`Macro updated for party position ${partyIndex}`, 'info');
      }
    }

    this.lastPartyIndex = partyIndex;
  }

  public forceUpdate(): void {
    this.lastPartyIndex = null;
    this.createOrUpdateMacro();
  }

  public deleteMacro(): boolean {
    const macroIndex = GetMacroIndexByName(PartyMacroManager.MACRO_NAME);
    if (macroIndex !== 0) {
      DeleteMacro(PartyMacroManager.MACRO_NAME);
      this.lastPartyIndex = null;
      if (this.db.chatVerbosity !== 'silent') {
        this.logFn(`Macro '${PartyMacroManager.MACRO_NAME}' deleted.`, 'info');
      }
      return true;
    } else {
      if (this.db.chatVerbosity !== 'silent') {
        this.logFn(`Macro '${PartyMacroManager.MACRO_NAME}' not found.`, 'warn');
      }
      return false;
    }
  }

  public clearSettings(): void {
    // Store current verbosity before reset to determine if we should print
    const previousVerbosity = this.db.chatVerbosity;

    // Reset to defaults
    this.db.macroIcon = 'Ability_Hunter_SniperShot';
    this.db.customTexturePath = '';
    this.db.chatVerbosity = 'normal';
    this.db.partyMessageFormat = 'Interrupting %i';

    if (previousVerbosity !== 'silent') {
      this.logFn('Settings reset to defaults.', 'info');
    }
  }
}
