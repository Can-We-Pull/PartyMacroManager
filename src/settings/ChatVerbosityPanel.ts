// ChatVerbosityPanel.ts - Chat verbosity selector UI component
/** @noSelfInFile */

import type { PartyMacroManager } from "../PartyMacroManager";
import type { AnchorElement } from "../types";

interface VerbosityOption {
  text: string;
  value: "silent" | "normal" | "verbose";
}

export class ChatVerbosityPanel {
  private addon: PartyMacroManager;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    const db = this.addon.getDB();

    // Chat Verbosity Section
    const chatTitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
    chatTitle.SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", -5, -24);
    chatTitle.SetText("Chat Message Frequency:");

    const chatSubtitle = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
    chatSubtitle.SetPoint("TOPLEFT", chatTitle, "BOTTOMLEFT", 0, -4);
    chatSubtitle.SetText("Control how often the addon sends messages to chat");

    // Verbosity dropdown
    const verbosityOptions: VerbosityOption[] = [
      { text: "Silent - No messages", value: "silent" },
      { text: "Normal - Important updates", value: "normal" },
      { text: "Verbose - All updates", value: "verbose" },
    ];

    const dropdown = CreateFrame("Frame", "PartyMacroVerbosityDropdown", parent, "UIDropDownMenuTemplate") as Frame;
    dropdown.SetPoint("TOPLEFT", chatSubtitle, "BOTTOMLEFT", -15, -8);

    UIDropDownMenu_SetWidth(dropdown, 200);

    UIDropDownMenu_Initialize(dropdown, () => {
      for (let i = 0; i < verbosityOptions.length; i++) {
        const option = verbosityOptions[i];
        const info = UIDropDownMenu_CreateInfo();
        info.text = option.text;
        info.value = option.value;
        info.func = () => {
          db.chatVerbosity = option.value;
          UIDropDownMenu_SetSelectedValue(dropdown, option.value);
          print(`|cff00ff00[PartyMacroManager]|r Chat verbosity set to: ${option.text}`);
        };
        info.checked = db.chatVerbosity === option.value;
        UIDropDownMenu_AddButton(info);
      }
    });

    UIDropDownMenu_SetSelectedValue(dropdown, db.chatVerbosity);

    // Return dropdown as anchor point for next section
    return dropdown;
  }
}
