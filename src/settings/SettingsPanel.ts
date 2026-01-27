// SettingsPanel.ts - Main settings panel coordinator
/** @noSelfInFile */

import type { PartyMacroManager } from "../PartyMacroManager";
import type { AnchorElement } from "../types";
import { tryCallMethod } from "../types";
import { IconSelectionPanel } from "./IconSelectionPanel";
import { CustomTexturePanel } from "./CustomTexturePanel";
import { ChatVerbosityPanel } from "./ChatVerbosityPanel";
import { AdvancedControlsPanel } from "./AdvancedControlsPanel";

export class SettingsPanel {
  private addon: PartyMacroManager;
  private iconSelection: IconSelectionPanel;
  private customTexture: CustomTexturePanel;
  private chatVerbosity: ChatVerbosityPanel;
  private advancedControls: AdvancedControlsPanel;
  private categoryID?: number;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
    this.iconSelection = new IconSelectionPanel(addon);
    this.customTexture = new CustomTexturePanel(addon);
    this.chatVerbosity = new ChatVerbosityPanel(addon);
    this.advancedControls = new AdvancedControlsPanel(addon);

    // Initialize settings UI after all modules load
    C_Timer.After(0.1, () => {
      this.createOptionsPanel();
    });
  }

  public getCategoryID(): number | undefined {
    return this.categoryID;
  }

  private createOptionsPanel(): void {
    const panel = CreateFrame("Frame") as Frame;
    panel.name = "Party Macro Manager";

    // Create a scroll frame (use panel as parent, not UIParent)
    const scrollFrame = CreateFrame("ScrollFrame", undefined, panel, "UIPanelScrollFrameTemplate") as Frame;
    scrollFrame.SetPoint("TOPLEFT", panel, "TOPLEFT", 3, -4);
    scrollFrame.SetPoint("BOTTOMRIGHT", panel, "BOTTOMRIGHT", -27, 4);

    // Create the scroll child (content container)
    const scrollChild = CreateFrame("Frame") as Frame;
    scrollFrame.SetScrollChild(scrollChild);
    scrollChild.SetWidth(650);
    scrollChild.SetHeight(1); // Will be adjusted dynamically

    // Title
    const title = scrollChild.CreateFontString(undefined, "ARTWORK", "GameFontNormalLarge");
    title.SetPoint("TOPLEFT", scrollChild, "TOPLEFT", 16, -16);
    title.SetText("Party Macro Manager Options");

    // Create each settings section
    let lastAnchor: FontString | Frame = title;

    // Icon Selection Section
    lastAnchor = this.iconSelection.create(scrollChild, lastAnchor);

    // Custom Texture Section
    lastAnchor = this.customTexture.create(scrollChild, lastAnchor);

    // Chat Verbosity Section
    lastAnchor = this.chatVerbosity.create(scrollChild, lastAnchor);

    // Advanced Controls Section
    lastAnchor = this.advancedControls.create(scrollChild, lastAnchor);

    // Calculate and set scroll child height
    let totalHeight = 600; // Default safe height
    if (lastAnchor !== undefined) {
      // Use tryCallMethod helper for proper Lua colon syntax (see types.ts for explanation)
      const bottom = tryCallMethod<AnchorElement, number>(lastAnchor, "GetBottom");
      if (bottom !== undefined) {
        totalHeight = math.abs(bottom) + 100;
      }
    }
    scrollChild.SetHeight(totalHeight);

    // Hide the panel by default (only show when accessed through settings)
    panel.Hide();

    // Register the panel and store the category ID
    const category = Settings.RegisterCanvasLayoutCategory(panel, panel.name!);
    Settings.RegisterAddOnCategory(category);
    // Use tryCallMethod helper for proper Lua colon syntax
    const categoryID = tryCallMethod<typeof category, number>(category, "GetID");
    if (categoryID !== undefined) {
      this.categoryID = categoryID;
    }
  }
}
