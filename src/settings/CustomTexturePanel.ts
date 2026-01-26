// CustomTexturePanel.ts - Custom texture input UI component
/** @noSelfInFile */

import type { PartyMacroManager } from "../PartyMacroManager";
import type { AnchorElement } from "../types";

export class CustomTexturePanel {
  private addon: PartyMacroManager;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    const db = this.addon.getDB();

    // Custom Texture Path Section
    const customTitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    customTitle.SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", 0, -8);
    customTitle.SetText("Custom Texture Path:");

    const customSubtitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
    customSubtitle.SetPoint("TOPLEFT", customTitle, "BOTTOMLEFT", 0, -4);
    customSubtitle.SetText(
      "Enter a full texture path (e.g., Interface\\Icons\\INV_Misc_QuestionMark or Ability_Hunter_SniperShot)"
    );

    const customInput = CreateFrame("EditBox", undefined, parent, "InputBoxTemplate") as EditBox;
    customInput.SetPoint("TOPLEFT", customSubtitle, "BOTTOMLEFT", 5, -8);
    customInput.SetSize(400, 20);
    customInput.SetAutoFocus(false);
    customInput.SetText(db.customTexturePath || "");

    const applyButton = CreateFrame("Button", undefined, parent, "UIPanelButtonTemplate") as Button;
    applyButton.SetPoint("LEFT", customInput, "RIGHT", 8, 0);
    applyButton.SetSize(80, 22);
    applyButton.SetText("Apply");
    applyButton.SetScript("OnClick", () => {
      const newPath = customInput.GetText();
      db.customTexturePath = newPath;

      // Update the macro immediately
      this.addon.forceUpdate();

      if (db.chatVerbosity !== "silent") {
        if (newPath && newPath !== "") {
          print(`|cff00ff00[PartyMacroManager]|r Custom texture path applied: ${newPath}`);
        } else {
          print("|cff00ff00[PartyMacroManager]|r Custom texture path cleared");
        }
      }
    });

    // Return input as anchor point for next section
    return customInput;
  }
}
