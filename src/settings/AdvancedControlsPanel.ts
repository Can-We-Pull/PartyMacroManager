// AdvancedControlsPanel.ts - Advanced controls UI component
/** @noSelfInFile */

import type { PartyMacroManager } from "../PartyMacroManager";
import type { AnchorElement, StaticPopupDialog, WoWGlobals } from "../types";

// Type assertion helper for WoW globals
const wowGlobals = globalThis as unknown as WoWGlobals;

export class AdvancedControlsPanel {
  private addon: PartyMacroManager;
  private pauseCheckbox?: CheckButton;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
    this.setupConfirmationDialogs();
  }

  private setupConfirmationDialogs(): void {
    // Define confirmation dialogs
    wowGlobals.StaticPopupDialogs = wowGlobals.StaticPopupDialogs || {};

    wowGlobals.StaticPopupDialogs.PMM_CONFIRM_DELETE_MACRO = {
      text:
        "Are you sure you want to delete the Party Macro Manager macro?\n\n" +
        "Do you also want to pause automatic recreation?",
      button1: "Delete & Pause",
      button2: "Delete Only",
      button3: "Cancel",
      OnAccept: () => {
        this.addon.deleteMacro();
        const db = this.addon.getDB();
        db.pauseRecreation = true;
        print("|cff00ff00[PartyMacroManager]|r Macro deleted and recreation paused.");
        this.refreshUI();
      },
      OnCancel: () => {
        this.addon.deleteMacro();
        print("|cff00ff00[PartyMacroManager]|r Macro deleted. Recreation is still active.");
      },
      timeout: 0,
      whileDead: true,
      hideOnEscape: true,
      preferredIndex: 3,
    };

    wowGlobals.StaticPopupDialogs.PMM_CONFIRM_CLEAR_SETTINGS = {
      text:
        "Are you sure you want to reset all settings to defaults?\n\n" +
        "This will clear your icon selection, custom texture, and chat preferences.\n\n" +
        "Do you also want to pause automatic recreation?",
      button1: "Clear & Pause",
      button2: "Clear Only",
      button3: "Cancel",
      OnAccept: () => {
        this.addon.clearSettings();
        const db = this.addon.getDB();
        db.pauseRecreation = true;
        print("|cff00ff00[PartyMacroManager]|r Settings cleared and recreation paused.");
        this.refreshUI();
      },
      OnCancel: () => {
        this.addon.clearSettings();
        print("|cff00ff00[PartyMacroManager]|r Settings cleared. Recreation is still active.");
        this.refreshUI();
      },
      timeout: 0,
      whileDead: true,
      hideOnEscape: true,
      preferredIndex: 3,
    };
  }

  public create(parent: Frame, anchorFrame: AnchorElement): Frame {
    const db = this.addon.getDB();

    // Advanced Controls Section
    const advancedTitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    advancedTitle.SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", -5, -24);
    advancedTitle.SetText("Advanced Controls:");

    const advancedSubtitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
    advancedSubtitle.SetPoint("TOPLEFT", advancedTitle, "BOTTOMLEFT", 0, -4);
    advancedSubtitle.SetText("Manage macro recreation and settings");

    // Pause Recreation Checkbox
    const pauseCheckbox = CreateFrame(
      "CheckButton",
      "PMMPauseRecreationCheckbox",
      parent,
      "UICheckButtonTemplate"
    ) as CheckButton;
    pauseCheckbox.SetPoint("TOPLEFT", advancedSubtitle, "BOTTOMLEFT", 0, -12);
    pauseCheckbox.SetSize(24, 24);

    const pauseLabel = pauseCheckbox.CreateFontString(undefined, "ARTWORK", "GameFontHighlight");
    pauseLabel.SetPoint("LEFT", pauseCheckbox, "RIGHT", 5, 0);
    pauseLabel.SetText("Pause automatic macro recreation");

    pauseCheckbox.SetChecked(db.pauseRecreation);

    pauseCheckbox.SetScript("OnClick", (self: CheckButton) => {
      db.pauseRecreation = self.GetChecked();
      const status = db.pauseRecreation ? "paused" : "resumed";
      if (db.chatVerbosity !== "silent") {
        print(`|cff00ff00[PartyMacroManager]|r Automatic recreation ${status}.`);
      }
    });

    pauseCheckbox.SetScript("OnEnter", (self: CheckButton) => {
      GameTooltip.SetOwner(self, "ANCHOR_RIGHT");
      GameTooltip.SetText("Pause Macro Recreation", 1, 1, 1);
      GameTooltip.AddLine(
        "When enabled, the addon will not automatically create or update the macro.",
        undefined,
        undefined,
        undefined,
        true
      );
      GameTooltip.Show();
    });

    pauseCheckbox.SetScript("OnLeave", () => {
      GameTooltip.Hide();
    });

    this.pauseCheckbox = pauseCheckbox;

    // Delete Macro Button
    const deleteButton = CreateFrame("Button", "PMMDeleteMacroButton", parent, "UIPanelButtonTemplate") as Button;
    deleteButton.SetPoint("TOPLEFT", pauseCheckbox, "BOTTOMLEFT", 0, -16);
    deleteButton.SetSize(200, 25);
    deleteButton.SetText("Delete Macro");

    deleteButton.SetScript("OnClick", () => {
      StaticPopup_Show("PMM_CONFIRM_DELETE_MACRO");
    });

    deleteButton.SetScript("OnEnter", (self: Button) => {
      GameTooltip.SetOwner(self, "ANCHOR_RIGHT");
      GameTooltip.SetText("Delete Party Macro Manager Macro", 1, 1, 1);
      GameTooltip.AddLine(
        "Removes the PartyInterrupt macro from your macros. " +
          "You can choose to pause recreation to prevent it from being recreated.",
        undefined,
        undefined,
        undefined,
        true
      );
      GameTooltip.Show();
    });

    deleteButton.SetScript("OnLeave", () => {
      GameTooltip.Hide();
    });

    // Clear Settings Button
    const clearButton = CreateFrame("Button", "PMMClearSettingsButton", parent, "UIPanelButtonTemplate") as Button;
    clearButton.SetPoint("LEFT", deleteButton, "RIGHT", 10, 0);
    clearButton.SetSize(200, 25);
    clearButton.SetText("Clear All Settings");

    clearButton.SetScript("OnClick", () => {
      StaticPopup_Show("PMM_CONFIRM_CLEAR_SETTINGS");
    });

    clearButton.SetScript("OnEnter", (self: Button) => {
      GameTooltip.SetOwner(self, "ANCHOR_RIGHT");
      GameTooltip.SetText("Clear All Settings", 1, 1, 1);
      GameTooltip.AddLine(
        "Resets all addon settings to their default values, " +
          "including icon selection, custom texture, and chat verbosity.",
        undefined,
        undefined,
        undefined,
        true
      );
      GameTooltip.Show();
    });

    clearButton.SetScript("OnLeave", () => {
      GameTooltip.Hide();
    });

    // Warning text
    const warningText = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormalSmall");
    warningText.SetPoint("TOPLEFT", deleteButton, "BOTTOMLEFT", 0, -8);
    warningText.SetTextColor(1, 0.5, 0);
    warningText.SetText("⚠ Warning: These actions will prompt for confirmation");

    // Return anchor point for next section (if needed in future)
    return warningText as any as Frame;
  }

  private refreshUI(): void {
    if (this.pauseCheckbox) {
      const db = this.addon.getDB();
      this.pauseCheckbox.SetChecked(db.pauseRecreation);
    }
  }
}
