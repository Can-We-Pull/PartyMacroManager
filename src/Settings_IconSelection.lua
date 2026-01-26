-- Settings_IconSelection.lua
local PMM = PartyMacroManager

-- Initialize namespace if it doesn't exist
PMM.Settings = PMM.Settings or {}
PMM.Settings.IconSelection = PMM.Settings.IconSelection or {}

-- Icon options (targeting/focus themed)
local iconOptions = {
    {name = "Crosshair", texture = "Ability_Hunter_SniperShot"},
    {name = "Eye", texture = "Spell_Shadow_EvilEye"},
    {name = "Target", texture = "Ability_Hunter_MarkedForDeath"},
    {name = "Focus", texture = "Ability_Hunter_MasterMarksman"},
    {name = "Star", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_1"},
    {name = "Circle", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_2"},
    {name = "Diamond", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_3"},
    {name = "Triangle", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_4"},
    {name = "Moon", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_5"},
    {name = "Square", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_6"},
    {name = "Red X", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_7"},
    {name = "Skull", texture = "Interface\\TargetingFrame\\UI-RaidTargetingIcon_8"},
    {name = "Aimed Shot", texture = "INV_Spear_07"},
    {name = "Arrow", texture = "Ability_Marksmanship"},
    {name = "Precision", texture = "INV_Misc_Dice_02"},
    {name = "Scope", texture = "INV_Misc_Spyglass_03"},
    {name = "Lock On", texture = "Ability_Hunter_MasterMarksman"},
    {name = "Sights", texture = "Ability_Hunter_SniperShot"},
    {name = "Tracking", texture = "Ability_Hunter_SniperTraining"},
    {name = "Mark", texture = "Ability_Hunter_MasterMarksman"},
}

function PMM.Settings.IconSelection.Create(parent, anchorFrame)
    -- Icon Selection Section
    local iconTitle = parent:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    iconTitle:SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", 0, -16)
    iconTitle:SetText("Macro Icon:")

    local subtitle = parent:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
    subtitle:SetPoint("TOPLEFT", iconTitle, "BOTTOMLEFT", 0, -4)
    subtitle:SetText("Select a preset icon or use a custom texture path below:")

    -- Icon buttons
    local buttons = {}
    local buttonSize = 40
    local padding = 8
    local iconsPerRow = 5

    for i, iconData in ipairs(iconOptions) do
        local button = CreateFrame("Button", nil, parent)
        button:SetSize(buttonSize, buttonSize)

        local row = math.floor((i - 1) / iconsPerRow)
        local col = (i - 1) % iconsPerRow

        if i == 1 then
            button:SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", 0, -12)
        else
            local xOffset = col * (buttonSize + padding)
            local yOffset = -12 - row * (buttonSize + padding + 20)
            button:SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", xOffset, yOffset)
        end

        -- Icon texture
        local icon = button:CreateTexture(nil, "ARTWORK")
        icon:SetAllPoints()
        icon:SetTexCoord(0.07, 0.93, 0.07, 0.93)

        -- Try to set the texture, handle both formats
        if iconData.texture:match("^Interface") then
            icon:SetTexture(iconData.texture)
        else
            icon:SetTexture("Interface\\Icons\\" .. iconData.texture)
        end

        -- Border
        local border = button:CreateTexture(nil, "OVERLAY")
        border:SetAllPoints()
        border:SetColorTexture(1, 1, 1, 0.3)
        border:Hide()

        -- Label
        local label = button:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
        label:SetPoint("TOP", button, "BOTTOM", 0, -2)
        label:SetText(iconData.name)

        button:SetScript("OnEnter", function(self)
            border:Show()
            GameTooltip:SetOwner(self, "ANCHOR_RIGHT")
            GameTooltip:SetText(iconData.name)
            GameTooltip:Show()
        end)

        button:SetScript("OnLeave", function()
            if PartyMacroManagerDB.macroIcon ~= iconData.texture or PartyMacroManagerDB.customTexturePath ~= "" then
                border:Hide()
            end
            GameTooltip:Hide()
        end)

        button:SetScript("OnClick", function()
            PartyMacroManagerDB.macroIcon = iconData.texture
            PartyMacroManagerDB.customTexturePath = "" -- Clear custom path

            -- Update all button borders
            for _, btn in ipairs(buttons) do
                btn.border:Hide()
            end
            border:Show()

            -- Update the macro immediately
            PMM.ForceUpdate()

            if PartyMacroManagerDB.chatVerbosity ~= "silent" then
                print("|cff00ff00[PartyMacroManager]|r Icon changed to: " .. iconData.name)
            end
        end)

        button.border = border
        button.iconTexture = iconData.texture
        table.insert(buttons, button)

        -- Show border for currently selected icon
        if PartyMacroManagerDB.macroIcon == iconData.texture and PartyMacroManagerDB.customTexturePath == "" then
            border:Show()
        end
    end

    -- Calculate position for next section
    local lastRow = math.floor((#iconOptions - 1) / iconsPerRow)
    local nextY = -12 - (lastRow + 1) * (buttonSize + padding + 20) - 20

    -- Return anchor point for next section
    local anchor = parent:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    anchor:SetPoint("TOPLEFT", subtitle, "BOTTOMLEFT", 0, nextY)
    anchor:SetText("")
    return anchor
end
