-- Settings.lua
local PMM = PartyMacroManager

-- Initialize Settings namespace
PMM.Settings = {
    IconSelection = {},
    CustomTexture = {},
    ChatVerbosity = {},
    AdvancedControls = {},
}

function PMM.Settings.CreateOptionsPanel()
    local panel = CreateFrame("Frame")
    panel.name = "Party Macro Manager"

    -- Create a scroll frame
    local scrollFrame = CreateFrame("ScrollFrame", nil, panel, "UIPanelScrollFrameTemplate")
    scrollFrame:SetPoint("TOPLEFT", 3, -4)
    scrollFrame:SetPoint("BOTTOMRIGHT", -27, 4)

    -- Create the scroll child (content container)
    local scrollChild = CreateFrame("Frame")
    scrollFrame:SetScrollChild(scrollChild)
    scrollChild:SetWidth(650)
    scrollChild:SetHeight(1) -- Will be adjusted dynamically

    -- Title
    local title = scrollChild:CreateFontString(nil, "ARTWORK", "GameFontNormalLarge")
    title:SetPoint("TOPLEFT", 16, -16)
    title:SetText("Party Macro Manager Options")

    -- Create each settings section
    local lastAnchor = title

    -- Icon Selection Section
    lastAnchor = PMM.Settings.IconSelection.Create(scrollChild, lastAnchor)

    -- Custom Texture Section
    lastAnchor = PMM.Settings.CustomTexture.Create(scrollChild, lastAnchor)

    -- Chat Verbosity Section
    lastAnchor = PMM.Settings.ChatVerbosity.Create(scrollChild, lastAnchor)

    -- Advanced Controls Section
    lastAnchor = PMM.Settings.AdvancedControls.Create(scrollChild, lastAnchor)

    -- Calculate and set scroll child height
    local totalHeight = 600 -- Default safe height
    if lastAnchor and lastAnchor.GetBottom then
        local bottom = lastAnchor:GetBottom()
        if bottom then
            totalHeight = math.abs(bottom) + 100
        end
    end
    scrollChild:SetHeight(totalHeight)

    -- Register the panel
    local category = Settings.RegisterCanvasLayoutCategory(panel, panel.name)
    Settings.RegisterAddOnCategory(category)
end

-- Initialize settings UI after all modules load
C_Timer.After(0.1, function()
    PMM.Settings.CreateOptionsPanel()
end)
