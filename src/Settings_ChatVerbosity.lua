-- Settings_ChatVerbosity.lua
local PMM = PartyMacroManager

-- Initialize namespace if it doesn't exist
PMM.Settings = PMM.Settings or {}
PMM.Settings.ChatVerbosity = PMM.Settings.ChatVerbosity or {}

function PMM.Settings.ChatVerbosity.Create(parent, anchorFrame)
    -- Chat Verbosity Section
    local chatTitle = parent:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    chatTitle:SetPoint("TOPLEFT", anchorFrame, "BOTTOMLEFT", -5, -24)
    chatTitle:SetText("Chat Message Frequency:")

    local chatSubtitle = parent:CreateFontString(nil, "ARTWORK", "GameFontHighlightSmall")
    chatSubtitle:SetPoint("TOPLEFT", chatTitle, "BOTTOMLEFT", 0, -4)
    chatSubtitle:SetText("Control how often the addon sends messages to chat")

    -- Verbosity dropdown
    local verbosityOptions = {
        { text = "Silent - No messages", value = "silent" },
        { text = "Minimal - Errors only", value = "minimal" },
        { text = "Normal - Important updates", value = "normal" },
        { text = "Verbose - All updates", value = "verbose" },
    }

    local dropdown = CreateFrame("Frame", "PartyMacroVerbosityDropdown", parent, "UIDropDownMenuTemplate")
    dropdown:SetPoint("TOPLEFT", chatSubtitle, "BOTTOMLEFT", -15, -8)

    UIDropDownMenu_SetWidth(dropdown, 200)

    UIDropDownMenu_Initialize(dropdown, function()
        for _, option in ipairs(verbosityOptions) do
            local info = UIDropDownMenu_CreateInfo()
            info.text = option.text
            info.value = option.value
            info.func = function()
                PartyMacroManagerDB.chatVerbosity = option.value
                UIDropDownMenu_SetSelectedValue(dropdown, option.value)
                print("|cff00ff00[PartyMacroManager]|r Chat verbosity set to: " .. option.text)
            end
            info.checked = (PartyMacroManagerDB.chatVerbosity == option.value)
            UIDropDownMenu_AddButton(info)
        end
    end)

    UIDropDownMenu_SetSelectedValue(dropdown, PartyMacroManagerDB.chatVerbosity)

    -- Return anchor point for next section (if needed in future)
    return dropdown
end
