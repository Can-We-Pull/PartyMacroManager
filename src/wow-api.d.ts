// WoW API Type Definitions
// This file contains TypeScript definitions for World of Warcraft API functions used in this addon

/** @noSelfInFile */

// Frame Types
declare interface Frame extends LuaUserdata {
  RegisterEvent(event: string): void;
  UnregisterEvent(event: string): void;
  UnregisterAllEvents(): void;
  SetScript(
    scriptType: "OnEvent" | "OnUpdate" | "OnShow" | "OnHide" | "OnEnter" | "OnLeave" | "OnClick" | "OnDragStart" | "OnDragStop",
    handler: ((this: Frame, ...args: any[]) => void) | null
  ): void;
  SetPoint(point: string, relativeTo?: Frame | FontString, relativePoint?: string, xOffset?: number, yOffset?: number): void;
  SetSize(width: number, height: number): void;
  SetWidth(width: number): void;
  SetHeight(height: number): void;
  GetBottom(): number | undefined;
  CreateTexture(name?: string, layer?: string, template?: string): Texture;
  CreateFontString(name?: string, layer?: string, template?: string): FontString;
  Show(): void;
  Hide(): void;
  IsShown(): boolean;
  SetScrollChild(child: Frame): void;
  GetName(): string | undefined;
  name?: string;
  SetMovable(movable: boolean): void;
  EnableMouse(enable: boolean): void;
  RegisterForDrag(button: string): void;
  StartMoving(): void;
  StopMovingOrSizing(): void;
  SetFrameStrata(strata: string): void;
  SetParent(parent: Frame | undefined): void;
}

declare interface Texture extends LuaUserdata {
  SetAllPoints(frame?: Frame): void;
  SetTexture(texture: string | number): void;
  SetTexCoord(left: number, right: number, top: number, bottom: number): void;
  SetColorTexture(r: number, g: number, b: number, a?: number): void;
  Show(): void;
  Hide(): void;
}

declare interface FontString extends LuaUserdata {
  SetPoint(point: string, relativeTo?: Frame | FontString, relativePoint?: string, xOffset?: number, yOffset?: number): void;
  SetText(text: string): void;
  SetTextColor(r: number, g: number, b: number, a?: number): void;
  GetBottom(): number | undefined;
  SetWidth(width: number): void;
  SetJustifyH(justify: string): void;
}

declare interface Button extends Frame {
  SetNormalTexture(texture: string): void;
  SetPushedTexture(texture: string): void;
  SetHighlightTexture(texture: string, blend?: string): void;
  SetText(text: string): void;
}

declare interface CheckButton extends Button {
  SetChecked(checked: boolean): void;
  GetChecked(): boolean;
}

declare interface EditBox extends Frame {
  SetText(text: string): void;
  GetText(): string;
  SetAutoFocus(autoFocus: boolean): void;
  ClearFocus(): void;
  SetMaxLetters(maxLetters: number): void;
  HighlightText(start?: number, end?: number): void;
}

declare interface Slider extends Frame {
  SetMinMaxValues(min: number, max: number): void;
  SetValue(value: number): void;
  GetValue(): number;
  SetValueStep(step: number): void;
  SetObeyStepOnDrag(obey: boolean): void;
}

// Global WoW API Functions
declare const UIParent: Frame;

declare function CreateFrame(
  frameType: "Frame" | "Button" | "CheckButton" | "EditBox" | "Slider" | "ScrollFrame",
  name?: string,
  parent?: Frame,
  template?: string
): any;

declare function GetNumGroupMembers(): number;
declare function IsInRaid(): boolean;
declare function UnitExists(unit: string): boolean;
declare function UnitGUID(unit: string): string;
declare function InCombatLockdown(): boolean;
declare function StaticPopup_Visible(which: string): boolean;
// Returns the macro index (1-based), or 0 if not found
declare function GetMacroIndexByName(name: string): number;
declare function GetNumMacros(): LuaMultiReturn<[number, number]>;
declare function GetMacroInfo(index: number): string | undefined;
declare function GetAddOnInfo(name: string): LuaMultiReturn<[string | undefined, string | undefined]>;
declare function CreateMacro(
  name: string,
  icon: string | number,
  body: string,
  perCharacter?: boolean
): number;
declare function EditMacro(
  index: number | string,
  name?: string,
  icon?: string | number,
  body?: string
): void;
declare function DeleteMacro(name: string | number): void;
declare function print(...args: any[]): void;
declare function pcall<T extends (...args: any[]) => any>(fn: T, ...args: Parameters<T>): LuaMultiReturn<[true, ReturnType<T>] | [false, string]>;
declare function tostring(value: any): string;

// C_Timer API
declare namespace C_Timer {
  function After(seconds: number, callback: () => void): void;
  function NewTicker(
    seconds: number,
    callback: () => void,
    iterations?: number
  ): { Cancel(): void };
}

// Settings API
declare interface SettingsCategory {
  GetID(): number;
}

declare namespace Settings {
  function OpenToCategory(categoryIDOrName: string | number): void;
  function RegisterCanvasLayoutCategory(
    category: any,
    name: string,
    order?: number
  ): SettingsCategory;
  function RegisterAddOnCategory(category: SettingsCategory): void;
}

// GameTooltip
declare const GameTooltip: {
  SetOwner(owner: Frame, anchor: string): void;
  SetText(text: string, r?: number, g?: number, b?: number, wrap?: boolean): void;
  AddLine(text: string, r?: number, g?: number, b?: number, wrap?: boolean): void;
  Show(): void;
  Hide(): void;
};

declare function GameTooltip_SetDefaultAnchor(tooltip: typeof GameTooltip, owner: Frame): void;

// UIDropDownMenu API
declare function UIDropDownMenu_SetWidth(frame: Frame, width: number): void;
declare function UIDropDownMenu_Initialize(frame: Frame, initFunc: () => void): void;
declare function UIDropDownMenu_CreateInfo(): any;
declare function UIDropDownMenu_AddButton(info: any): void;
declare function UIDropDownMenu_SetSelectedValue(frame: Frame, value: any): void;

// StaticPopup API
declare function StaticPopup_Show(which: string): void;
declare const StaticPopupDialogs: Record<string, any>;

// Slash Commands
declare const SlashCmdList: Record<string, (msg: string, editBox?: any) => void>;

// Global Saved Variables
declare let PartyMacroManagerDB: {
  macroIcon: string;
  customTexturePath: string;
  chatVerbosity: "silent" | "minimal" | "normal" | "verbose";
  pauseRecreation: boolean;
};

// Global Addon Namespace
declare let PartyMacroManager: PartyMacroManagerNamespace | undefined;

interface PartyMacroManagerNamespace {
  GetMyPartyIndex(): number | null;
  CreateOrUpdateMacro(): void;
  ForceUpdate(): void;
  DeleteMacro(): boolean;
  ClearSettings(): void;
  Settings?: {
    CreateOptionsPanel(): void;
    IconSelection?: {
      Create(parent: Frame, anchorFrame: FontString): FontString;
    };
    CustomTexture?: {
      Create(parent: Frame, anchorFrame: FontString): FontString;
    };
    ChatVerbosity?: {
      Create(parent: Frame, anchorFrame: FontString): FontString;
    };
    AdvancedControls?: {
      Create(parent: Frame, anchorFrame: FontString): Frame;
      RefreshUI?(): void;
    };
  };
}

// String functions
declare namespace string {
  function format(formatString: string, ...args: any[]): string;
  function match(str: string, pattern: string): string | undefined;
}

// Table functions  
declare namespace table {
  function insert<T>(list: T[], value: T): void;
  function insert<T>(list: T[], pos: number, value: T): void;
  function sort<T>(list: T[], comp?: (a: T, b: T) => boolean): void;
}

// Math functions
declare namespace math {
  function floor(x: number): number;
  function abs(x: number): number;
}
