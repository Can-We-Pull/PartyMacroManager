-- Core.lua
local addonName = "PartyMacroManager"
local MACRO_NAME = "PartyInterrupt"

-- Create addon namespace
PartyMacroManager = PartyMacroManager or {}
local PMM = PartyMacroManager

-- Saved variables (persists across sessions)
-- Initialize with defaults, preserving any existing values
PartyMacroManagerDB = PartyMacroManagerDB or {}

-- Apply defaults for any missing keys
local defaults = {
    macroIcon = "Ability_Hunter_SniperShot",
    customTexturePath = "",
    chatVerbosity = "normal" -- "silent", "minimal", "normal", "verbose"
}

for key, value in pairs(defaults) do
    if PartyMacroManagerDB[key] == nil then
        PartyMacroManagerDB[key] = value
    end
end

-- Track last known party index to avoid unnecessary updates
local lastPartyIndex = nil

local frame = CreateFrame("Frame")

-- Public functions
function PMM.GetMyPartyIndex()
    -- Returns 1-5 based on party position
    local numGroupMembers = GetNumGroupMembers() or 0
    
    -- Not in a group, or in a raid
    if numGroupMembers == 0 or IsInRaid() then
        return nil
    end
    
    -- Must be in a 5-player party
    if numGroupMembers > 5 then
        return nil
    end
    
    -- Get player GUID
    local playerGUID = UnitGUID("player")
    local members = {}
    
    table.insert(members, {guid = playerGUID, unit = "player"})
    
    for i = 1, 4 do
        local unit = "party" .. i
        if UnitExists(unit) then
            table.insert(members, {guid = UnitGUID(unit), unit = unit})
        end
    end
    
    -- Sort by GUID to get consistent ordering
    table.sort(members, function(a, b) return a.guid < b.guid end)
    
    -- Find our index
    for i, member in ipairs(members) do
        if member.guid == playerGUID then
            return i
        end
    end
    
    return nil
end

function PMM.CreateOrUpdateMacro()
    local partyIndex = PMM.GetMyPartyIndex()
    
    -- Check if party index actually changed
    if partyIndex == lastPartyIndex then
        return -- No change, skip update
    end
    
    if not partyIndex then
        if PartyMacroManagerDB.chatVerbosity ~= "silent" then
            print("|cffff0000[" .. addonName .. "]|r Not in a 5-player party. Macro not created.")
        end
        lastPartyIndex = nil
        return
    end
    
    local macroText = string.format(
        "/focus\n/tm %d\n/p Interrupting {rt%d}",
        partyIndex,
        partyIndex
    )
    
    -- Determine which icon to use
    local selectedIcon
    if PartyMacroManagerDB.customTexturePath and PartyMacroManagerDB.customTexturePath ~= "" then
        selectedIcon = PartyMacroManagerDB.customTexturePath
    else
        selectedIcon = PartyMacroManagerDB.macroIcon or "Ability_Hunter_SniperShot"
    end
    
    -- Check if macro exists
    local macroIndex = GetMacroIndexByName(MACRO_NAME)
    
    if not macroIndex or macroIndex == 0 then
        -- Create new macro
        local numGlobalMacros, numCharMacros = GetNumMacros()
        if numGlobalMacros >= 36 then
            print("|cffff0000[" .. addonName .. "]|r Cannot create macro - global macro limit reached!")
            lastPartyIndex = nil
            return
        end
        
        CreateMacro(MACRO_NAME, selectedIcon, macroText, nil)
        
        if PartyMacroManagerDB.chatVerbosity == "normal" or PartyMacroManagerDB.chatVerbosity == "verbose" then
            print("|cff00ff00[" .. addonName .. "]|r Macro '" .. MACRO_NAME .. "' created for party position " .. partyIndex)
        end
    else
        -- Update existing macro
        EditMacro(macroIndex, MACRO_NAME, selectedIcon, macroText)
        
        if PartyMacroManagerDB.chatVerbosity == "verbose" then
            print("|cff00ff00[" .. addonName .. "]|r Macro '" .. MACRO_NAME .. "' updated for party position " .. partyIndex)
        elseif PartyMacroManagerDB.chatVerbosity == "normal" and lastPartyIndex ~= partyIndex then
            print("|cff00ff00[" .. addonName .. "]|r Macro updated for party position " .. partyIndex)
        end
    end
    
    lastPartyIndex = partyIndex
end

function PMM.ForceUpdate()
    lastPartyIndex = nil
    PMM.CreateOrUpdateMacro()
end

-- Event handler
frame:RegisterEvent("ADDON_LOADED")
frame:RegisterEvent("GROUP_ROSTER_UPDATE")
frame:RegisterEvent("PLAYER_ENTERING_WORLD")

frame:SetScript("OnEvent", function(self, event, ...)
    if event == "ADDON_LOADED" then
        local loadedAddon = ...
        if loadedAddon == "PartyMacroManager" then
            -- Check if we're already in a party on addon load
            C_Timer.After(1, function()
                PMM.CreateOrUpdateMacro()
            end)
            frame:UnregisterEvent("ADDON_LOADED")
        end
    elseif event == "GROUP_ROSTER_UPDATE" or event == "PLAYER_ENTERING_WORLD" then
        -- Small delay to ensure group data is ready
        C_Timer.After(0.5, PMM.CreateOrUpdateMacro)
    end
end)

-- Slash command for manual update
SLASH_PARTYMACRO1 = "/partymacro"
SLASH_PARTYMACRO2 = "/pm"
SlashCmdList["PARTYMACRO"] = function(msg)
    if msg == "config" or msg == "options" then
        Settings.OpenToCategory("Party Macro Manager")
    else
        PMM.CreateOrUpdateMacro()
    end
end

print("|cff00ff00[" .. addonName .. "]|r Loaded. Use /partymacro or /pm to manually update. Use /pm config for options.")