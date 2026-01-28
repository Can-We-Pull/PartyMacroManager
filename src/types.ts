// Shared type definitions for the addon
/** @noSelfInFile */

export interface IconOption {
  name: string;
  texture: string | number;
}

export interface SavedVariables {
  macroIcon: string;
  customTexturePath: string;
  chatVerbosity: "silent" | "normal" | "verbose";
  partyMessageFormat?: string;
}

// Union type for UI elements that can serve as anchor points in settings panels
export type AnchorElement = FontString | Frame | EditBox;

// WoW global declarations for addon-specific globals
export interface WoWGlobals {
  PartyMacroManagerDB: SavedVariables;
  PartyMacroManagerInstance: import("./PartyMacroManager").PartyMacroManager;
  SLASH_PARTYMACRO1: string;
  SLASH_PARTYMACRO2: string;
  StaticPopupDialogs: Record<string, StaticPopupDialog>;
}

export interface StaticPopupDialog {
  text: string;
  button1?: string;
  button2?: string;
  button3?: string;
  OnAccept?: () => void;
  OnCancel?: () => void;
  OnAlt?: () => void;
  timeout?: number;
  whileDead?: boolean;
  hideOnEscape?: boolean;
  preferredIndex?: number;
}

/**
 * TSTL Workaround Utility
 * 
 * With @noSelfInFile, TypeScript-to-Lua generates `frame.Method(args)` which doesn't pass `self`.
 * WoW API methods require colon syntax `frame:Method(args)` (equivalent to `frame.Method(frame, args)`).
 * These helpers extract methods and call them with the object as first argument to ensure correct
 * Lua calling convention.
 */
export function callMethod<T, R>(
  obj: T,
  methodName: string,
  ...args: unknown[]
): R {
  const method = (obj as Record<string, unknown>)[methodName] as (
    self: T,
    ...args: unknown[]
  ) => R;
  return method(obj, ...args);
}

/**
 * Safely calls a method that might not exist, returning undefined if not found.
 */
export function tryCallMethod<T, R>(
  obj: T,
  methodName: string,
  ...args: unknown[]
): R | undefined {
  const method = (obj as Record<string, unknown>)[methodName] as
    | ((self: T, ...args: unknown[]) => R)
    | undefined;
  if (method) {
    return method(obj, ...args);
  }
  return undefined;
}
