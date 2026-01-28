// IconDropdownPanel.ts - Icon selection with searchable dropdown UI component
/** @noSelfInFile */

import type { IconOption, AnchorElement } from '../types';
import { callMethod } from '../types';
import type { PartyMacroManager } from '../PartyMacroManager';
import * as allIconsData from '../data/iconOptions.json';

export class IconDropdownPanel {
  private addon: PartyMacroManager;
  private allIcons: IconOption[];
  private dropdown?: any;
  private searchBox?: any;
  private iconPreview?: any;
  private filteredIcons: IconOption[];
  private browseButton?: any;

  constructor(addon: PartyMacroManager) {
    this.addon = addon;
    this.allIcons = allIconsData as IconOption[];
    this.filteredIcons = this.allIcons;
  }

  public create(parent: Frame, anchorFrame: AnchorElement): AnchorElement {
    const db = this.addon.getDB();

    // Icon Selection Section
    const iconTitle = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontNormal');
    iconTitle.SetPoint('TOPLEFT', anchorFrame, 'BOTTOMLEFT', 0, -16);
    iconTitle.SetText('Macro Icon:');

    const subtitle = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontHighlightSmall');
    subtitle.SetPoint('TOPLEFT', iconTitle, 'BOTTOMLEFT', 0, -4);
    subtitle.SetText('Search and select an icon from the dropdown:');

    // Current icon preview
    const previewFrame = CreateFrame('Frame', undefined, parent) as any;
    callMethod(previewFrame, 'SetPoint', 'TOPLEFT', subtitle, 'BOTTOMLEFT', 0, -12);
    callMethod(previewFrame, 'SetSize', 40, 40);

    const previewBg = callMethod(previewFrame, 'CreateTexture', undefined, 'BACKGROUND') as Texture;
    previewBg.SetAllPoints();
    previewBg.SetColorTexture(0, 0, 0, 0.5);

    const previewIcon = callMethod(previewFrame, 'CreateTexture', undefined, 'ARTWORK') as Texture;
    previewIcon.SetAllPoints();
    callMethod(previewIcon, 'SetTexCoord', 0.07, 0.93, 0.07, 0.93);
    this.iconPreview = previewIcon;

    // Set current icon
    this.updateIconPreview(db.macroIcon);

    // Search box
    const searchBoxBg = CreateFrame('Frame', undefined, parent, 'BackdropTemplate') as any;
    callMethod(searchBoxBg, 'SetPoint', 'LEFT', previewFrame, 'RIGHT', 10, 0);
    callMethod(searchBoxBg, 'SetSize', 300, 30);
    callMethod(searchBoxBg, 'SetBackdrop', {
      bgFile: 'Interface\\ChatFrame\\ChatFrameBackground',
      edgeFile: 'Interface\\Tooltips\\UI-Tooltip-Border',
      tile: true,
      tileSize: 16,
      edgeSize: 16,
      insets: { left: 4, right: 4, top: 4, bottom: 4 },
    });
    callMethod(searchBoxBg, 'SetBackdropColor', 0, 0, 0, 0.5);
    callMethod(searchBoxBg, 'SetBackdropBorderColor', 0.4, 0.4, 0.4, 1);

    const searchBox = CreateFrame('EditBox', undefined, searchBoxBg) as any;
    this.searchBox = searchBox;
    callMethod(searchBox, 'SetPoint', 'LEFT', searchBoxBg, 'LEFT', 10, 0);
    callMethod(searchBox, 'SetPoint', 'RIGHT', searchBoxBg, 'RIGHT', -10, 0);
    callMethod(searchBox, 'SetHeight', 20);
    callMethod(searchBox, 'SetFontObject', 'ChatFontNormal');
    callMethod(searchBox, 'SetAutoFocus', false);
    callMethod(searchBox, 'SetMaxLetters', 50);
    callMethod(searchBox, 'SetText', 'Search icons...');

    // Search box placeholder behavior
    callMethod(searchBox, 'SetScript', 'OnEditFocusGained', () => {
      const text = callMethod(searchBox, 'GetText') as string;
      if (text === 'Search icons...') {
        callMethod(searchBox, 'SetText', '');
      }
    });

    callMethod(searchBox, 'SetScript', 'OnEditFocusLost', () => {
      const text = callMethod(searchBox, 'GetText') as string;
      if (text === '') {
        callMethod(searchBox, 'SetText', 'Search icons...');
        this.filteredIcons = this.allIcons;
      }
    });

    callMethod(searchBox, 'SetScript', 'OnTextChanged', () => {
      const text = (callMethod(searchBox, 'GetText') as string).toLowerCase();
      if (text === '' || text === 'search icons...') {
        this.filteredIcons = this.allIcons;
      } else {
        // Manual filtering to avoid TypeScript array function overhead
        const filtered: IconOption[] = [];
        for (const icon of this.allIcons) {
          const nameMatch = string.find(icon.name.toLowerCase(), text, undefined, true);
          const textureMatch = string.find(String(icon.texture).toLowerCase(), text, undefined, true);
          if (nameMatch !== undefined || textureMatch !== undefined) {
            filtered[filtered.length] = icon;
          }
        }
        this.filteredIcons = filtered;
      }
      this.updateDropdown();
    });

    // Dropdown button
    const dropdownButton = CreateFrame('Button', undefined, parent, 'UIPanelButtonTemplate') as Button;
    dropdownButton.SetPoint('LEFT', searchBoxBg, 'RIGHT', 5, 0);
    dropdownButton.SetSize(80, 25);
    dropdownButton.SetText('Browse');

    dropdownButton.SetScript('OnClick', () => {
      this.showIconPicker(dropdownButton);
    });

    // Info text
    const infoText = parent.CreateFontString(undefined, 'ARTWORK', 'GameFontHighlightSmall');
    infoText.SetPoint('TOPLEFT', previewFrame, 'BOTTOMLEFT', 0, -8);
    infoText.SetText(`|cff888888Tip: Type to search ${this.allIcons.length} icons, or click Browse to see all|r`);

    // Return the info text as anchor for next section
    return infoText;
  }

  private updateIconPreview(texture: string): void {
    if (!this.iconPreview) return;

    if (texture.indexOf('Interface') === 0) {
      callMethod(this.iconPreview, 'SetTexture', texture);
    } else {
      callMethod(this.iconPreview, 'SetTexture', `Interface\\Icons\\${texture}`);
    }
  }

  private updateDropdown(): void {
    // Log filtered icon count for debugging
    if (this.filteredIcons.length > 0 && this.filteredIcons.length < this.allIcons.length) {
      this.addon.log(`Found ${this.filteredIcons.length} matching icons`, 'info');
    }
  }

  private showIconPicker(_anchorFrame: Button): void {
    const db = this.addon.getDB();

    // Create icon picker frame
    const picker = CreateFrame('Frame', undefined, UIParent, 'BackdropTemplate') as any;
    callMethod(picker, 'SetSize', 450, 400);
    callMethod(picker, 'SetPoint', 'CENTER');
    callMethod(picker, 'SetBackdrop', {
      bgFile: 'Interface\\DialogFrame\\UI-DialogBox-Background',
      edgeFile: 'Interface\\DialogFrame\\UI-DialogBox-Border',
      tile: true,
      tileSize: 32,
      edgeSize: 32,
      insets: { left: 11, right: 12, top: 12, bottom: 11 },
    });
    callMethod(picker, 'SetFrameStrata', 'DIALOG');
    callMethod(picker, 'EnableMouse', true);

    // Title
    const title = callMethod(picker, 'CreateFontString', undefined, 'OVERLAY', 'GameFontNormalLarge') as FontString;
    title.SetPoint('TOP', picker, 'TOP', 0, -15);
    title.SetText('Select Icon');

    // Icon count subtitle - manual slice to avoid TypeScript overhead
    const iconsToShow: IconOption[] = [];
    const maxIcons = math.min(this.filteredIcons.length, 500);
    for (let i = 0; i < maxIcons; i++) {
      iconsToShow[i] = this.filteredIcons[i];
    }
    const subtitle = callMethod(
      picker,
      'CreateFontString',
      undefined,
      'OVERLAY',
      'GameFontHighlightSmall'
    ) as FontString;
    subtitle.SetPoint('TOP', title, 'BOTTOM', 0, -4);
    if (this.filteredIcons.length > 500) {
      subtitle.SetText(`Showing first 500 of ${this.filteredIcons.length} icons (use search to narrow)`);
    } else {
      subtitle.SetText(`${this.filteredIcons.length} icons`);
    }

    // Close button
    const closeBtn = CreateFrame('Button', undefined, picker, 'UIPanelCloseButton') as Button;
    closeBtn.SetPoint('TOPRIGHT', picker, 'TOPRIGHT', -5, -5);
    closeBtn.SetScript('OnClick', () => {
      callMethod(picker, 'Hide');
    });

    // Scroll frame
    const scrollFrame = CreateFrame('ScrollFrame', undefined, picker, 'UIPanelScrollFrameTemplate') as any;
    callMethod(scrollFrame, 'SetPoint', 'TOPLEFT', picker, 'TOPLEFT', 15, -50);
    callMethod(scrollFrame, 'SetPoint', 'BOTTOMRIGHT', picker, 'BOTTOMRIGHT', -30, 15);

    const scrollChild = CreateFrame('Frame', undefined, scrollFrame) as Frame;
    callMethod(scrollFrame, 'SetScrollChild', scrollChild);
    scrollChild.SetWidth(400);

    // Create icon buttons
    const buttonSize = 36;
    const padding = 4;
    const iconsPerRow = 9;

    for (let i = 0; i < iconsToShow.length; i++) {
      const iconData = iconsToShow[i];
      const btn = CreateFrame('Button', undefined, scrollChild) as any;
      callMethod(btn, 'SetSize', buttonSize, buttonSize);

      const row = math.floor(i / iconsPerRow);
      const col = i % iconsPerRow;
      const xOffset = col * (buttonSize + padding);
      const yOffset = -row * (buttonSize + padding);

      callMethod(btn, 'SetPoint', 'TOPLEFT', scrollChild, 'TOPLEFT', xOffset, yOffset);

      // Icon texture
      const icon = callMethod(btn, 'CreateTexture', undefined, 'ARTWORK') as Texture;
      icon.SetAllPoints();
      callMethod(icon, 'SetTexCoord', 0.07, 0.93, 0.07, 0.93);

      if (typeof iconData.texture === 'number') {
        icon.SetTexture(iconData.texture);
      } else if (iconData.texture.indexOf('Interface') === 0) {
        icon.SetTexture(iconData.texture);
      } else {
        icon.SetTexture(`Interface\\Icons\\${iconData.texture}`);
      }

      // Highlight on hover
      const highlight = callMethod(btn, 'CreateTexture', undefined, 'HIGHLIGHT') as Texture;
      highlight.SetAllPoints();
      highlight.SetColorTexture(1, 1, 1, 0.3);

      callMethod(btn, 'SetScript', 'OnEnter', () => {
        callMethod(GameTooltip, 'SetOwner', btn, 'ANCHOR_RIGHT');
        callMethod(GameTooltip, 'SetText', iconData.name);
        callMethod(GameTooltip, 'AddLine', iconData.texture, 0.8, 0.8, 0.8, true);
        callMethod(GameTooltip, 'Show');
      });

      callMethod(btn, 'SetScript', 'OnLeave', () => {
        callMethod(GameTooltip, 'Hide');
      });

      callMethod(btn, 'SetScript', 'OnClick', () => {
        db.macroIcon = String(iconData.texture);
        db.customTexturePath = '';
        this.updateIconPreview(String(iconData.texture));
        this.addon.forceUpdate();
        callMethod(picker, 'Hide');
        this.addon.log(`Icon set to: ${iconData.name}`, 'info');
      });
    }

    const totalHeight = math.ceil(iconsToShow.length / iconsPerRow) * (buttonSize + padding);
    scrollChild.SetHeight(math.max(totalHeight, 350));

    callMethod(picker, 'Show');
  }
}
