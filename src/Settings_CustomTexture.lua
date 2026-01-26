-- Settings_CustomTexture.lua
local PMM = PartyMacroManager

-- Initialize namespace if it doesn't exist
PMM.Settings = PMM.Settings or {}
PMM.Settings.CustomTexture = PMM.Settings.CustomTexture or {}

function PMM.Settings.CustomTexture.Create(parent, anchorFrame)
    -- Custom Texture Path Section
    local customTitle = parent:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    customTitle:SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", 0, -8)
    customTitle:SetText("Custom Texture Path:")
    
    local customSubtitle = parent:CreateFontString(nil, "ARTWORK", "GameFontHighlightSmall")
    customSubtitle:SetPoint("TOPLEFT", customTitle, "BOTTOMLEFT", 0, -4)
    customSubtitle:SetText("Enter a full texture path (e.g., Interface\\Icons\\INV_Misc_QuestionMark or Ability_Hunter_SniperShot)")
    
    local customInput = CreateFrame("EditBox", nil, parent, "InputBoxTemplate")
    customInput:SetPoint("TOPLEFT", customSubtitle, "BOTTOMLEFT", 5, -8)
    customInput:SetSize(400, 20)
    customInput:SetAutoFocus(false)
    customInput:SetText(PartyMacroManagerDB.customTexturePath or "")
    
    local applyButton = CreateFrame("Button", nil, parent, "UIPanelButtonTemplate")
    applyButton:SetPoint("LEFT", customInput, "RIGHT", 8, 0)
    applyButton:SetSize(80, 22)
    applyButton:SetText("Apply")
    applyButton:SetScript("OnClick", function()
        local newPath = customInput:GetText()
        PartyMacroManagerDB.customTexturePath = newPath
        
        -- Update the macro immediately
        PMM.ForceUpdate()
        
        if PartyMacroManagerDB.chatVerbosity ~= "silent" then
            if newPath and newPath ~= "" then
                print("|cff00ff00[PartyMacroManager]|r Custom texture path applied: " .. newPath)
            else
                print("|cff00ff00[PartyMacroManager]|r Custom texture path cleared")
            end
        end
    end)
    
    -- Return anchor point for next section
    return customInput
end