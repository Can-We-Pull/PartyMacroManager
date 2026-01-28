// AdvancedControlsPanel.ts - Advanced controls UI component
/** @noSelfInFile */

import type { PartyMacroManager } from '../PartyMacroManager';
import type { AnchorElement, WoWGlobals } from '../types';
import { callMethod } from '../types';

// Type assertion helper for WoW globals
const wowGlobals = globalThis as unknown as WoWGlobals;

export class AdvancedControlsPanel {
  private addon: PartyMacroManager;
  private dialogsSetup = false;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
    // REMOVED: Don't setup dialogs during initialization to avoid tainting StaticPopupDialogs
    // They will be setup lazily when first needed
  }

  private ensureDialogsSetup(): void {
    if (this.dialogsSetup) {
      return;
    }

    this.setupConfirmationDialogs();
    this.dialogsSetup = true;
  }

  private setupConfirmationDialogs(): void {
    // Define confirmation dialogs
    wowGlobals.StaticPopupDialogs = wowGlobals.StaticPopupDialogs || {};

    wowGlobals.StaticPopupDialogs.PMM_CONFIRM_DELETE_MACRO = {
      text: 'Are you sure you want to delete the Party Macro Manager macro?',
      button1: 'Delete',
      button2: 'Cancel',
      OnAccept: () => {
        this.addon.deleteMacro();
      },
      timeout: 0,
      whileDead: true,
      hideOnEscape: true,
      preferredIndex: 3,
    };

    wowGlobals.StaticPopupDialogs.PMM_CONFIRM_CLEAR_SETTINGS = {
      text:
        'Are you sure you want to reset all settings to defaults?\n\n' +
        'This will clear your icon selection, custom texture, and chat preferences.',
      button1: 'Clear',
      button2: 'Cancel',
      OnAccept: () => {
        this.addon.clearSettings();
      },
      timeout: 0,
      whileDead: true,
      hideOnEscape: true,
      preferredIndex: 3,
    };
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    // Advanced Controls Section
    const advancedTitle = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontNormal');
    advancedTitle.SetPoint('TOPLEFT', anchorFrame, 'BOTTOMLEFT', -5, -24);
    advancedTitle.SetText('Advanced Controls:');

    const advancedSubtitle = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontHighlightSmall');
    advancedSubtitle.SetPoint('TOPLEFT', advancedTitle, 'BOTTOMLEFT', 0, -4);
    advancedSubtitle.SetText('Manage macro and settings');

    // Recreate Macro Button
    const recreateButton = CreateFrame('Button', 'PMMRecreateMacroButton', parent, 'UIPanelButtonTemplate') as Button;
    recreateButton.SetPoint('TOPLEFT', advancedSubtitle, 'BOTTOMLEFT', 0, -12);
    recreateButton.SetSize(200, 25);
    recreateButton.SetText('Recreate Macro');

    recreateButton.SetScript('OnClick', () => {
      this.addon.forceUpdate();
    });

    recreateButton.SetScript('OnEnter', (self: Button) => {
      callMethod(GameTooltip, 'SetOwner', self, 'ANCHOR_RIGHT');
      callMethod(GameTooltip, 'SetText', 'Recreate Party Macro', 1, 1, 1);
      callMethod(
        GameTooltip,
        'AddLine',
        'Forces the addon to recreate or update the PartyInterrupt macro based on your current party position.',
        undefined,
        undefined,
        undefined,
        true
      );
      callMethod(GameTooltip, 'Show');
    });

    recreateButton.SetScript('OnLeave', () => {
      callMethod(GameTooltip, 'Hide');
    });

    // Delete Macro Button
    const deleteButton = CreateFrame('Button', 'PMMDeleteMacroButton', parent, 'UIPanelButtonTemplate') as Button;
    deleteButton.SetPoint('TOPLEFT', recreateButton, 'BOTTOMLEFT', 0, -8);
    deleteButton.SetSize(200, 25);
    deleteButton.SetText('Delete Macro');

    deleteButton.SetScript('OnClick', () => {
      this.ensureDialogsSetup();
      StaticPopup_Show('PMM_CONFIRM_DELETE_MACRO');
    });

    deleteButton.SetScript('OnEnter', (self: Button) => {
      callMethod(GameTooltip, 'SetOwner', self, 'ANCHOR_RIGHT');
      callMethod(GameTooltip, 'SetText', 'Delete Party Macro Manager Macro', 1, 1, 1);
      callMethod(
        GameTooltip,
        'AddLine',
        'Removes the PartyInterrupt macro from your macros.',
        undefined,
        undefined,
        undefined,
        true
      );
      callMethod(GameTooltip, 'Show');
    });

    deleteButton.SetScript('OnLeave', () => {
      callMethod(GameTooltip, 'Hide');
    });

    // Clear Settings Button
    const clearButton = CreateFrame('Button', 'PMMClearSettingsButton', parent, 'UIPanelButtonTemplate') as Button;
    clearButton.SetPoint('LEFT', deleteButton, 'RIGHT', 10, 0);
    clearButton.SetSize(200, 25);
    clearButton.SetText('Clear All Settings');

    clearButton.SetScript('OnClick', () => {
      this.ensureDialogsSetup();
      StaticPopup_Show('PMM_CONFIRM_CLEAR_SETTINGS');
    });

    clearButton.SetScript('OnEnter', (self: Button) => {
      callMethod(GameTooltip, 'SetOwner', self, 'ANCHOR_RIGHT');
      callMethod(GameTooltip, 'SetText', 'Clear All Settings', 1, 1, 1);
      callMethod(
        GameTooltip,
        'AddLine',
        'Resets all addon settings to their default values, ' +
          'including icon selection, custom texture, and chat verbosity.',
        undefined,
        undefined,
        undefined,
        true
      );
      callMethod(GameTooltip, 'Show');
    });

    clearButton.SetScript('OnLeave', () => {
      callMethod(GameTooltip, 'Hide');
    });

    // Warning text
    const warningText = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontNormalSmall');
    warningText.SetPoint('TOPLEFT', deleteButton, 'BOTTOMLEFT', 0, -8);
    warningText.SetTextColor(1, 0.5, 0);
    warningText.SetText('⚠ Warning: These actions will prompt for confirmation');

    // Return anchor point for next section (if needed in future)
    return warningText as any as Frame;
  }
}
