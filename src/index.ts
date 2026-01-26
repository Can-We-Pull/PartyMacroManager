// index.ts - Main entry point for PartyMacroManager addon
/** @noSelfInFile */

import { PartyMacroManager } from "./PartyMacroManager";
import { callMethod } from "./types";

// Store addon instance globally so it persists
declare const globalThis: any;

// Wait for ADDON_LOADED event before initializing to ensure saved variables are available
function initAddon() {
  const initFrame = CreateFrame("Frame");
  
  // Use callMethod helper to ensure proper Lua colon syntax (see types.ts for explanation)
  callMethod(initFrame, "RegisterEvent", "ADDON_LOADED");
  callMethod(initFrame, "SetScript", "OnEvent", ((self: Frame, event: string, addonName: string) => {
    if (addonName === "PartyMacroManager") {
      // Initialize the addon now that saved variables are loaded
      globalThis.PartyMacroManagerInstance = new PartyMacroManager();
      callMethod(self, "UnregisterEvent", "ADDON_LOADED");
    }
  }) as any);
}

// Call initialization
initAddon();
