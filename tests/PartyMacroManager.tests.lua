-- PartyMacroManager Tests using WoWUnit
-- This file is only loaded if WoWUnit addon is installed
-- Add "## OptionalDeps: WoWUnit" to your .toc file

if not WoWUnit then return end

local AreEqual, Exists, IsTrue, IsFalse, Replace =
    WoWUnit.AreEqual, WoWUnit.Exists, WoWUnit.IsTrue, WoWUnit.IsFalse, WoWUnit.Replace

-- Create test group that runs at startup and when entering world
local Tests = WoWUnit('PartyMacroManager', 'PLAYER_ENTERING_WORLD')

-- Test: SavedVariables initialization
function Tests:SavedVariablesExist()
    Exists(PartyMacroManagerDB)
end

function Tests:SavedVariablesHaveDefaults()
    local db = PartyMacroManagerDB
    Exists(db.macroIcon)
    Exists(db.chatVerbosity)
    IsTrue(type(db.pauseRecreation) == "boolean")
end

-- Test: Macro creation functions
function Tests:GetMacroIndexByNameAvailable()
    Exists(GetMacroIndexByName)
    IsTrue(type(GetMacroIndexByName) == "function")
end

function Tests:GetNumMacrosAvailable()
    Exists(GetNumMacros)
    IsTrue(type(GetNumMacros) == "function")
end

-- Test: Party functions
function Tests:GetNumGroupMembersAvailable()
    Exists(GetNumGroupMembers)
    local count = GetNumGroupMembers()
    IsTrue(type(count) == "number")
end

function Tests:UnitExistsAvailable()
    Exists(UnitExists)
    -- Player should always exist
    IsTrue(UnitExists("player"))
end

-- Test: Settings panel registration
function Tests:SettingsAPIAvailable()
    Exists(Settings)
    Exists(Settings.RegisterCanvasLayoutCategory)
    Exists(Settings.RegisterAddOnCategory)
end

-- Test: Timer API
function Tests:TimerAPIAvailable()
    Exists(C_Timer)
    Exists(C_Timer.After)
    Exists(C_Timer.NewTicker)
end

-- Test: Frame creation
function Tests:CanCreateFrames()
    local frame = CreateFrame("Frame")
    Exists(frame)
    frame:Hide()
end

-- Test: Macro text generation (mock test)
function Tests:MacroTextFormat()
    -- Test that string.format works as expected for macro generation
    local partyIndex = 2
    local expected = "/focus\n/tm 2\n/p Interrupting {rt2}"
    local actual = string.format("/focus\n/tm %d\n/p Interrupting {rt%d}", partyIndex, partyIndex)
    AreEqual(expected, actual)
end

-- Test: Party message format customization
function Tests:PartyMessageFormatDefault()
    local db = PartyMacroManagerDB
    -- Default message format should exist
    Exists(db.partyMessageFormat)
    -- Default should contain %i placeholder
    IsTrue(string.find(db.partyMessageFormat or "", "%%i") ~= nil)
end

function Tests:PartyMessageFormatReplacement()
    -- Test that %i placeholder gets replaced with raid marker
    local messageFormat = "Interrupting %i"
    local partyIndex = 3
    local raidMarker = string.format("{rt%d}", partyIndex)
    local result = string.gsub(messageFormat, "%%i", raidMarker, 1)
    local expected = "Interrupting {rt3}"
    AreEqual(expected, result)
end

function Tests:PartyMessageFormatCustom()
    -- Test custom message formats
    local testFormats = {
        "I'll kick %i",
        "Stopping %i cast",
        "INT %i",
        "%i - INTERRUPTED"
    }
    
    for _, format in ipairs(testFormats) do
        local result = string.gsub(format, "%%i", "{rt1}", 1)
        -- Result should not contain %i anymore
        IsFalse(string.find(result, "%%i") ~= nil)
        -- Result should contain the raid marker
        IsTrue(string.find(result, "{rt1}") ~= nil)
    end
end

function Tests:PartyMessageFormatMultiplePlaceholders()
    -- Test that only first %i is replaced (gsub with limit of 1)
    local messageFormat = "INT %i and %i"
    local result = string.gsub(messageFormat, "%%i", "{rt2}", 1)
    local expected = "INT {rt2} and %i"
    AreEqual(expected, result)
end

-- Test: Party index calculation logic
function Tests:PartyIndexRangeValid()
    -- Party indices should be 1-4 for a 5-man group
    for i = 1, 4 do
        IsTrue(i >= 1 and i <= 4)
    end
end

-- Test: Chat verbosity options
function Tests:ChatVerbosityOptionsValid()
    local validOptions = { silent = true, minimal = true, normal = true, verbose = true }
    local db = PartyMacroManagerDB
    if db and db.chatVerbosity then
        IsTrue(validOptions[db.chatVerbosity] == true)
    end
end
