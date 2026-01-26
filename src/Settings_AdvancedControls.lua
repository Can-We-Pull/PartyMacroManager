-- Settings_AdvancedControls.lua
local PMM = PartyMacroManager

-- Initialize namespace if it doesn't exist
PMM.Settings = PMM.Settings or {}
PMM.Settings.AdvancedControls = PMM.Settings.AdvancedControls or {}

-- Define confirmation dialogs
StaticPopupDialogs["PMM_CONFIRM_DELETE_MACRO"] = {
    text = "Are you sure you want to delete the Party Macro Manager macro?\n\n"
        .. "Do you also want to pause automatic recreation?",
    button1 = "Delete & Pause",
    button2 = "Delete Only",
    button3 = "Cancel",
    OnAccept = function()
        PMM.DeleteMacro()
        PartyMacroManagerDB.pauseRecreation = true
        print("|cff00ff00[PartyMacroManager]|r Macro deleted and recreation paused.")
        -- Refresh UI
        if PMM.Settings.AdvancedControls.RefreshUI then
            PMM.Settings.AdvancedControls.RefreshUI()
        end
    end,
    OnCancel = function()
        PMM.DeleteMacro()
        print("|cff00ff00[PartyMacroManager]|r Macro deleted. Recreation is still active.")
    end,
    timeout = 0,
    whileDead = true,
    hideOnEscape = true,
    preferredIndex = 3,
}

StaticPopupDialogs["PMM_CONFIRM_CLEAR_SETTINGS"] = {
    text = "Are you sure you want to reset all settings to defaults?\n\n"
        .. "This will clear your icon selection, custom texture, and chat preferences.\n\n"
        .. "Do you also want to pause automatic recreation?",
    button1 = "Clear & Pause",
    button2 = "Clear Only",
    button3 = "Cancel",
    OnAccept = function()
        PMM.ClearSettings()
        PartyMacroManagerDB.pauseRecreation = true
        print("|cff00ff00[PartyMacroManager]|r Settings cleared and recreation paused.")
        -- Refresh UI
        if PMM.Settings.AdvancedControls.RefreshUI then
            PMM.Settings.AdvancedControls.RefreshUI()
        end
    end,
    OnCancel = function()
        PMM.ClearSettings()
        print("|cff00ff00[PartyMacroManager]|r Settings cleared. Recreation is still active.")
        -- Refresh UI
        if PMM.Settings.AdvancedControls.RefreshUI then
            PMM.Settings.AdvancedControls.RefreshUI()
        end
    end,
    timeout = 0,
    whileDead = true,
    hideOnEscape = true,
    preferredIndex = 3,
}

function PMM.Settings.AdvancedControls.Create(parent, anchorFrame)
    -- Advanced Controls Section
    local advancedTitle = parent:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    advancedTitle:SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", -5, -24)
    advancedTitle:SetText("Advanced Controls:")

    local advancedSubtitle = parent:CreateFontString(nil, "ARTWORK", "GameFontHighlightSmall")
    advancedSubtitle:SetPoint("TOPLEFT", advancedTitle, "BOTTOMLEFT", 0, -4)
    advancedSubtitle:SetText("Manage macro recreation and settings")

    -- Pause Recreation Checkbox
    local pauseCheckbox = CreateFrame("CheckButton", "PMMPauseRecreationCheckbox", parent, "UICheckButtonTemplate")
    pauseCheckbox:SetPoint("TOPLEFT", advancedSubtitle, "BOTTOMLEFT", 0, -12)
    pauseCheckbox:SetSize(24, 24)

    local pauseLabel = pauseCheckbox:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
    pauseLabel:SetPoint("LEFT", pauseCheckbox, "RIGHT", 5, 0)
    pauseLabel:SetText("Pause automatic macro recreation")

    pauseCheckbox:SetChecked(PartyMacroManagerDB.pauseRecreation)

    pauseCheckbox:SetScript("OnClick", function(self)
        PartyMacroManagerDB.pauseRecreation = self:GetChecked()
        local status = PartyMacroManagerDB.pauseRecreation and "paused" or "resumed"
        if PartyMacroManagerDB.chatVerbosity ~= "silent" then
            print("|cff00ff00[PartyMacroManager]|r Automatic recreation " .. status .. ".")
        end
    end)

    pauseCheckbox:SetScript("OnEnter", function(self)
        GameTooltip:SetOwner(self, "ANCHOR_RIGHT")
        GameTooltip:SetText("Pause Macro Recreation", 1, 1, 1)
        GameTooltip:AddLine(
            "When enabled, the addon will not automatically create or update the macro.",
            nil,
            nil,
            nil,
            true
        )
        GameTooltip:Show()
    end)

    pauseCheckbox:SetScript("OnLeave", function()
        GameTooltip:Hide()
    end)

    -- Delete Macro Button
    local deleteButton = CreateFrame("Button", "PMMDeleteMacroButton", parent, "UIPanelButtonTemplate")
    deleteButton:SetPoint("TOPLEFT", pauseCheckbox, "BOTTOMLEFT", 0, -16)
    deleteButton:SetSize(200, 25)
    deleteButton:SetText("Delete Macro")

    deleteButton:SetScript("OnClick", function()
        StaticPopup_Show("PMM_CONFIRM_DELETE_MACRO")
    end)

    deleteButton:SetScript("OnEnter", function(self)
        GameTooltip:SetOwner(self, "ANCHOR_RIGHT")
        GameTooltip:SetText("Delete Party Macro Manager Macro", 1, 1, 1)
        GameTooltip:AddLine(
            "Removes the PartyInterrupt macro from your macros. "
                .. "You can choose to pause recreation to prevent it from being recreated.",
            nil,
            nil,
            nil,
            true
        )
        GameTooltip:Show()
    end)

    deleteButton:SetScript("OnLeave", function()
        GameTooltip:Hide()
    end)

    -- Clear Settings Button
    local clearButton = CreateFrame("Button", "PMMClearSettingsButton", parent, "UIPanelButtonTemplate")
    clearButton:SetPoint("LEFT", deleteButton, "RIGHT", 10, 0)
    clearButton:SetSize(200, 25)
    clearButton:SetText("Clear All Settings")

    clearButton:SetScript("OnClick", function()
        StaticPopup_Show("PMM_CONFIRM_CLEAR_SETTINGS")
    end)

    clearButton:SetScript("OnEnter", function(self)
        GameTooltip:SetOwner(self, "ANCHOR_RIGHT")
        GameTooltip:SetText("Clear All Settings", 1, 1, 1)
        GameTooltip:AddLine(
            "Resets all addon settings to their default values, "
                .. "including icon selection, custom texture, and chat verbosity.",
            nil,
            nil,
            nil,
            true
        )
        GameTooltip:Show()
    end)

    clearButton:SetScript("OnLeave", function()
        GameTooltip:Hide()
    end)

    -- Warning text
    local warningText = parent:CreateFontString(nil, "ARTWORK", "GameFontNormalSmall")
    warningText:SetPoint("TOPLEFT", deleteButton, "BOTTOMLEFT", 0, -8)
    warningText:SetTextColor(1, 0.5, 0)
    warningText:SetText("⚠ Warning: These actions will prompt for confirmation")

    -- Store refresh function for dialog callbacks
    PMM.Settings.AdvancedControls.RefreshUI = function()
        pauseCheckbox:SetChecked(PartyMacroManagerDB.pauseRecreation)
    end

    -- Return anchor point for next section (if needed in future)
    return warningText
end
