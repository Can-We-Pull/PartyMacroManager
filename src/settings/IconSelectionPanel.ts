// IconSelectionPanel.ts - Icon selection UI component
/** @noSelfInFile */

import type { IconOption, AnchorElement } from "../types";
import { callMethod } from "../types";
import type { PartyMacroManager } from "../PartyMacroManager";
import * as iconOptionsData from "../data/iconOptions.json";

interface IconButton extends Button {
  border?: Texture;
  iconTexture?: string;
}

export class IconSelectionPanel {
  private addon: PartyMacroManager;
  private iconOptions: IconOption[];
  private buttons: IconButton[] = [];

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
    this.iconOptions = iconOptionsData as IconOption[];
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    const db = this.addon.getDB();

    // Icon Selection Section
    const iconTitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    iconTitle.SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", 0, -16);
    iconTitle.SetText("Macro Icon:");

    const subtitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlight");
    subtitle.SetPoint("TOPLEFT", iconTitle, "BOTTOMLEFT", 0, -4);
    subtitle.SetText("Select a preset icon or use a custom texture path below:");

    // Icon buttons
    const buttonSize = 40;
    const padding = 8;
    const iconsPerRow = 5;

    for (let i = 0; i < this.iconOptions.length; i++) {
      const iconData = this.iconOptions[i];
      const button = CreateFrame("Button", undefined, parent) as IconButton;
      button.SetSize(buttonSize, buttonSize);

      const row = math.floor(i / iconsPerRow);
      const col = i % iconsPerRow;

      if (i === 0) {
        button.SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", 0, -12);
      } else {
        const xOffset = col * (buttonSize + padding);
        const yOffset = -12 - row * (buttonSize + padding + 20);
        button.SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", xOffset, yOffset);
      }

      // Icon texture
      const icon = button.CreateTexture(undefined, "ARTWORK");
      icon.SetAllPoints();
      icon.SetTexCoord(0.07, 0.93, 0.07, 0.93);

      // Try to set the texture, handle both formats
      if (iconData.texture.indexOf("Interface") === 0) {
        icon.SetTexture(iconData.texture);
      } else {
        icon.SetTexture(`Interface\\Icons\\${iconData.texture}`);
      }

      // Border
      const border = button.CreateTexture(undefined, "OVERLAY");
      border.SetAllPoints();
      border.SetColorTexture(1, 1, 1, 0.3);
      border.Hide();

      // Label
      const label = button.CreateFontString(undefined, "OVERLAY", "GameFontNormalSmall");
      label.SetPoint("TOP", button, "BOTTOM", 0, -2);
      label.SetText(iconData.name);

      button.SetScript("OnEnter", () => {
        border.Show();
        callMethod(GameTooltip, "SetOwner", button, "ANCHOR_RIGHT");
        callMethod(GameTooltip, "SetText", iconData.name);
        callMethod(GameTooltip, "Show");
      });

      button.SetScript("OnLeave", () => {
        if (db.macroIcon !== iconData.texture || db.customTexturePath !== "") {
          border.Hide();
        }
        callMethod(GameTooltip, "Hide");
      });

      button.SetScript("OnClick", () => {
        db.macroIcon = iconData.texture;
        db.customTexturePath = ""; // Clear custom path

        // Update all button borders
        for (let j = 0; j < this.buttons.length; j++) {
          this.buttons[j].border!.Hide();
        }
        border.Show();

        // Update the macro immediately
        this.addon.forceUpdate();

        if (db.chatVerbosity !== "silent") {
          print(`|cff00ff00[PartyMacroManager]|r Icon changed to: ${iconData.name}`);
        }
      });

      button.border = border;
      button.iconTexture = iconData.texture;
      this.buttons.push(button);

      // Show border for currently selected icon
      if (db.macroIcon === iconData.texture && db.customTexturePath === "") {
        border.Show();
      }
    }

    // Calculate position for next section
    const lastRow = math.floor((this.iconOptions.length - 1) / iconsPerRow);
    const nextY = -12 - (lastRow + 1) * (buttonSize + padding + 20) - 20;

    // Return anchor point for next section
    const anchor = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    anchor.SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", 0, nextY);
    anchor.SetText("");
    return anchor;
  }
}
