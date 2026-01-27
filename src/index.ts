// index.ts - Main entry point for PartyMacroManager addon
/** @noSelfInFile */

import { PartyMacroManager } from "./PartyMacroManager";
import { callMethod } from "./types";

// Store addon instance globally so it persists
declare const globalThis: any;

// Wait for ADDON_LOADED event before initializing to ensure saved variables are available
function initAddon() {
  const initFrame = CreateFrame("Frame");
  let addonLoaded = false;
  let playerInWorld = false;
  let addonInstance: PartyMacroManager | null = null;
  
  const tryInitialize = () => {
    if (addonLoaded && playerInWorld && !addonInstance) {
      // Initialize the addon now that saved variables are loaded and we're in the world
      // Store locally instead of globally to avoid global taint
      addonInstance = new PartyMacroManager();
      callMethod(initFrame, "UnregisterAllEvents");
    }
  };
  
  // Use callMethod helper to ensure proper Lua colon syntax (see types.ts for explanation)
  callMethod(initFrame, "RegisterEvent", "ADDON_LOADED");
  callMethod(initFrame, "RegisterEvent", "PLAYER_ENTERING_WORLD");
  callMethod(initFrame, "SetScript", "OnEvent", ((self: Frame, event: string, addonName?: string) => {
    if (event === "ADDON_LOADED" && addonName === "PartyMacroManager") {
      addonLoaded = true;
      tryInitialize();
    } else if (event === "PLAYER_ENTERING_WORLD") {
      playerInWorld = true;
      tryInitialize();
    }
  }) as any);
}

// Call initialization
initAddon();
