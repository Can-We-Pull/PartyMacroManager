-- Settings.lua
local PMM = PartyMacroManager

-- Initialize Settings namespace
PMM.Settings = {
    IconSelection = {},
    CustomTexture = {},
    ChatVerbosity = {}
}

function PMM.Settings.CreateOptionsPanel()
    local panel = CreateFrame("Frame")
    panel.name = "Party Macro Manager"

    -- Title
    local title = panel:CreateFontString(nil, "ARTWORK", "GameFontNormalLarge")
    title:SetPoint("TOPLEFT", 16, -16)
    title:SetText("Party Macro Manager Options")

    -- Create each settings section
    local lastAnchor = title

    -- Icon Selection Section
    lastAnchor = PMM.Settings.IconSelection.Create(panel, lastAnchor)

    -- Custom Texture Section
    lastAnchor = PMM.Settings.CustomTexture.Create(panel, lastAnchor)

    -- Chat Verbosity Section
    PMM.Settings.ChatVerbosity.Create(panel, lastAnchor)

    -- Register the panel
    local category = Settings.RegisterCanvasLayoutCategory(panel, panel.name)
    Settings.RegisterAddOnCategory(category)
end

-- Initialize settings UI after all modules load
C_Timer.After(0.1, function()
    PMM.Settings.CreateOptionsPanel()
end)
