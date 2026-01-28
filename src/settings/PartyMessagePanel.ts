// PartyMessagePanel.ts - Party message format customization UI component
/** @noSelfInFile */

import type { PartyMacroManager } from "../PartyMacroManager";
import type { AnchorElement } from "../types";
import { callMethod } from "../types";

export class PartyMessagePanel {
  private addon: PartyMacroManager;
  private editBox?: any;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    const db = this.addon.getDB();

    // Party Message Section
    const messageTitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    messageTitle.SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", -5, -24);
    messageTitle.SetText("Party Message Format:");

    const messageSubtitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
    messageSubtitle.SetPoint("TOPLEFT", messageTitle, "BOTTOMLEFT", 0, -4);
    messageSubtitle.SetText("Customize the message sent to party chat. Use %i for raid icon marker.");

    const exampleText = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
    exampleText.SetPoint("TOPLEFT", messageSubtitle, "BOTTOMLEFT", 0, -4);
    exampleText.SetText("|cff888888Example: 'Interrupting %i' becomes 'Interrupting {rt3}'|r");

    // Create background for edit box
    const editBoxBg = CreateFrame("Frame", undefined, parent, "BackdropTemplate") as any;
    callMethod(editBoxBg, "SetPoint", "TOPLEFT", exampleText, "BOTTOMLEFT", 5, -8);
    callMethod(editBoxBg, "SetSize", 400, 30);
    callMethod(editBoxBg, "SetBackdrop", {
      bgFile: "Interface\\ChatFrame\\ChatFrameBackground",
      edgeFile: "Interface\\Tooltips\\UI-Tooltip-Border",
      tile: true,
      tileSize: 16,
      edgeSize: 16,
      insets: { left: 4, right: 4, top: 4, bottom: 4 },
    });
    callMethod(editBoxBg, "SetBackdropColor", 0, 0, 0, 0.5);
    callMethod(editBoxBg, "SetBackdropBorderColor", 0.4, 0.4, 0.4, 1);

    // Create edit box
    const editBox = CreateFrame("EditBox", undefined, editBoxBg) as any;
    this.editBox = editBox;
    callMethod(editBox, "SetPoint", "LEFT", editBoxBg, "LEFT", 10, 0);
    callMethod(editBox, "SetPoint", "RIGHT", editBoxBg, "RIGHT", -10, 0);
    callMethod(editBox, "SetHeight", 20);
    callMethod(editBox, "SetFontObject", "ChatFontNormal");
    callMethod(editBox, "SetAutoFocus", false);
    callMethod(editBox, "SetMaxLetters", 50);

    // Set initial text
    const currentFormat = db.partyMessageFormat || "Interrupting %i";
    callMethod(editBox, "SetText", currentFormat);

    // Handle text changes
    callMethod(editBox, "SetScript", "OnEnterPressed", () => {
      const text = callMethod(editBox, "GetText") as string;
      if (text === "") {
        // Prevent empty format
        const defaultFormat = "Interrupting %i";
        callMethod(editBox, "SetText", defaultFormat);
        db.partyMessageFormat = defaultFormat;
        print(`|cff00ff00[PartyMacroManager]|r Party message format cannot be empty. Reverted to default.`);
      } else {
        db.partyMessageFormat = text;
      }
      callMethod(editBox, "ClearFocus");
      this.addon.forceUpdate();
      print(`|cff00ff00[PartyMacroManager]|r Party message format updated to: ${text}`);
    });

    callMethod(editBox, "SetScript", "OnEscapePressed", () => {
      callMethod(editBox, "SetText", db.partyMessageFormat || "Interrupting %i");
      callMethod(editBox, "ClearFocus");
    });

    callMethod(editBox, "SetScript", "OnEditFocusLost", () => {
      // Save on focus lost as well
      const text = callMethod(editBox, "GetText") as string;
      if (text !== db.partyMessageFormat) {
        if (text === "") {
          // Prevent empty format
          const defaultFormat = "Interrupting %i";
          callMethod(editBox, "SetText", defaultFormat);
          db.partyMessageFormat = defaultFormat;
          print(`|cff00ff00[PartyMacroManager]|r Party message format cannot be empty. Reverted to default.`);
        } else {
            db.partyMessageFormat = text;
        }
        this.addon.forceUpdate();
      }
    });

    // Reset button
    const resetButton = CreateFrame("Button", undefined, parent, "UIPanelButtonTemplate") as Button;
    resetButton.SetPoint("LEFT", editBoxBg, "RIGHT", 10, 0);
    resetButton.SetSize(80, 25);
    resetButton.SetText("Reset");

    resetButton.SetScript("OnClick", () => {
      const defaultFormat = "Interrupting %i";
      db.partyMessageFormat = defaultFormat;
      callMethod(editBox, "SetText", defaultFormat);
      this.addon.forceUpdate();
      print(`|cff00ff00[PartyMacroManager]|r Party message format reset to default`);
    });

    // Add tooltip to reset button
    resetButton.SetScript("OnEnter", () => {
      GameTooltip.SetOwner(resetButton, "ANCHOR_RIGHT");
      callMethod(GameTooltip, "AddLine", "Reset to Default");
      callMethod(GameTooltip, "AddLine", "Resets the message format to 'Interrupting %i'", 1, 1, 1, true);
      GameTooltip.Show();
    });

    resetButton.SetScript("OnLeave", () => {
      GameTooltip.Hide();
    });

    // Return the edit box background as anchor point for next section
    return editBoxBg;
  }
}
