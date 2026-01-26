// PartyMacroManager.ts - Main addon class
/** @noSelfInFile */

import type { SavedVariables } from "./types";
import { SettingsPanel } from "./settings/SettingsPanel";

export class PartyMacroManager {
  private static readonly ADDON_NAME = "PartyMacroManager";
  private static readonly MACRO_NAME = "PartyInterrupt";
  
  private db: SavedVariables;
  private lastPartyIndex: number | null = null;
  private frame: Frame;
  private settingsPanel: SettingsPanel;
  private ticker: { Cancel(): void } | null = null;

  constructor() {
    // Initialize saved variables with defaults
    (globalThis as any).PartyMacroManagerDB = (globalThis as any).PartyMacroManagerDB || {
      macroIcon: "Ability_Hunter_SniperShot",
      customTexturePath: "",
      chatVerbosity: "normal" as const,
      pauseRecreation: false,
    };

    this.db = (globalThis as any).PartyMacroManagerDB as SavedVariables;

    // Apply defaults for any missing keys using direct property assignment
    if (this.db.macroIcon === undefined) this.db.macroIcon = "Ability_Hunter_SniperShot";
    if (this.db.customTexturePath === undefined) this.db.customTexturePath = "";
    if (this.db.chatVerbosity === undefined) this.db.chatVerbosity = "normal";
    if (this.db.pauseRecreation === undefined) this.db.pauseRecreation = false;

    this.frame = CreateFrame("Frame");
    this.settingsPanel = new SettingsPanel(this);
    this.setupEvents();
    this.setupSlashCommands();
    this.startPeriodicCheck();

    const loadMsg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Loaded. Use /partymacro or /pm to manually update. Use /pm config for options.`;
    print(loadMsg);
  }

  public getDB(): SavedVariables {
    return this.db;
  }

  public getSettingsPanel(): SettingsPanel {
    return this.settingsPanel;
  }

  private setupEvents(): void {
    this.frame.RegisterEvent("GROUP_ROSTER_UPDATE");
    this.frame.RegisterEvent("PLAYER_ENTERING_WORLD");

    this.frame.SetScript("OnEvent", ((self: Frame, event: string, ...args: any[]) => {
      if (event === "GROUP_ROSTER_UPDATE" || event === "PLAYER_ENTERING_WORLD") {
        // Small delay to ensure group data is ready
        C_Timer.After(0.5, () => this.createOrUpdateMacro());
      }
    }) as any);

    // Check if we're already in a party after initialization
    C_Timer.After(1, () => {
      this.createOrUpdateMacro();
    });
  }

  private setupSlashCommands(): void {
    (globalThis as any).SLASH_PARTYMACRO1 = "/partymacro";
    (globalThis as any).SLASH_PARTYMACRO2 = "/pm";
    SlashCmdList["PARTYMACRO"] = (msg: string) => {
      if (msg === "config" || msg === "options") {
        const categoryID = this.settingsPanel.getCategoryID();
        if (categoryID !== undefined) {
          Settings.OpenToCategory(categoryID);
        } else {
          print("|cffff0000[PartyMacroManager]|r Settings panel not yet initialized. Please try again.");
        }
      } else {
        this.createOrUpdateMacro();
      }
    };
  }

  private startPeriodicCheck(): void {
    // Periodic check to detect if macro was deleted by user
    this.ticker = C_Timer.NewTicker(5, () => {
      // Skip if recreation is paused
      if (this.db.pauseRecreation) {
        return;
      }

      // Only check if we're in a party
      const partyIndex = this.getMyPartyIndex();
      if (partyIndex !== null) {
        const macroIndex = GetMacroIndexByName(PartyMacroManager.MACRO_NAME);
        if (macroIndex === 0) {
          // Macro was deleted, recreate it
          const verbosity = this.db.chatVerbosity;
          if (verbosity === "normal" || verbosity === "verbose") {
            const msg = `|cffff9900[${PartyMacroManager.ADDON_NAME}]|r Macro was deleted. Recreating...`;
            print(msg);
          }
          this.createOrUpdateMacro();
        }
      }
    });
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
    const playerGUID = UnitGUID("player");
    const members: Array<{ guid: string; unit: string }> = [];

    members.push({ guid: playerGUID, unit: "player" });

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
    // Check if recreation is paused
    if (this.db.pauseRecreation) {
      return;
    }

    const partyIndex = this.getMyPartyIndex();

    if (partyIndex === null) {
      if (this.db.chatVerbosity !== "silent") {
        const msg = `|cffff0000[${PartyMacroManager.ADDON_NAME}]|r Not in a 5-player party. Macro not created.`;
        print(msg);
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
    const macroText = `/focus${newline}${string.format("/tm %d", partyIndex)}${newline}${string.format("/p Interrupting {rt%d}", partyIndex)}`;

    // Determine which icon to use
    let selectedIcon: string;
    const customPath = this.db.customTexturePath;
    if (customPath && customPath !== "") {
      selectedIcon = customPath;
    } else {
      selectedIcon = this.db.macroIcon || "Ability_Hunter_SniperShot";
    }

    if (!macroExists) {
      // Create new macro
      const [numGlobalMacros] = GetNumMacros();
      if (numGlobalMacros >= 36) {
        const msg = `|cffff0000[${PartyMacroManager.ADDON_NAME}]|r Cannot create macro - global macro limit reached!`;
        print(msg);
        this.lastPartyIndex = null;
        return;
      }

      CreateMacro(PartyMacroManager.MACRO_NAME, selectedIcon, macroText);

      const verbosity = this.db.chatVerbosity;
      if (verbosity === "normal" || verbosity === "verbose") {
        const msg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Macro '${PartyMacroManager.MACRO_NAME}' created for party position ${partyIndex}`;
        print(msg);
      }
    } else {
      // Update existing macro - macroIndex is guaranteed to be a valid number here since macroExists is true
      EditMacro(macroIndex as number, PartyMacroManager.MACRO_NAME, selectedIcon, macroText);

      if (this.db.chatVerbosity === "verbose") {
        const msg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Macro '${PartyMacroManager.MACRO_NAME}' updated for party position ${partyIndex}`;
        print(msg);
      } else if (
        this.db.chatVerbosity === "normal" &&
        this.lastPartyIndex !== partyIndex
      ) {
        const msg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Macro updated for party position ${partyIndex}`;
        print(msg);
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
      if (this.db.chatVerbosity !== "silent") {
        const msg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Macro '${PartyMacroManager.MACRO_NAME}' deleted.`;
        print(msg);
      }
      return true;
    } else {
      if (this.db.chatVerbosity !== "silent") {
        const msg = `|cffff9900[${PartyMacroManager.ADDON_NAME}]|r Macro '${PartyMacroManager.MACRO_NAME}' not found.`;
        print(msg);
      }
      return false;
    }
  }

  public clearSettings(): void {
    // Store current verbosity before reset to determine if we should print
    const previousVerbosity = this.db.chatVerbosity;
    
    // Reset to defaults
    this.db.macroIcon = "Ability_Hunter_SniperShot";
    this.db.customTexturePath = "";
    this.db.chatVerbosity = "normal";
    this.db.pauseRecreation = false;

    if (previousVerbosity !== "silent") {
      const msg = `|cff00ff00[${PartyMacroManager.ADDON_NAME}]|r Settings reset to defaults.`;
      print(msg);
    }
  }
}
