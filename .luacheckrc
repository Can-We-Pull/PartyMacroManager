-- Luacheck configuration for WoW addon development
-- This is similar to ESLint for JavaScript/TypeScript

std = "lua51"

-- WoW API globals
globals = {
    -- Addon-specific globals
    "PartyMacroManager",
    "PartyMacroManagerDB",
    "Settings",
    "SLASH_PARTYMACRO1",
    "SLASH_PARTYMACRO2",
    "SlashCmdList",
    
    -- WoW Frame API
    "CreateFrame",
    "UIParent",
    "GameTooltip",
    
    -- WoW UI Dropdown API
    "UIDropDownMenu_SetWidth",
    "UIDropDownMenu_Initialize",
    "UIDropDownMenu_CreateInfo",
    "UIDropDownMenu_SetSelectedValue",
    "UIDropDownMenu_AddButton",
    
    -- WoW API functions
    "GetNumGroupMembers",
    "UnitExists",
    "UnitName",
    "UnitClass",
    "UnitGUID",
    "IsInGroup",
    "IsInRaid",
    "GetMacroInfo",
    "GetMacroIndexByName",
    "CreateMacro",
    "EditMacro",
    "DeleteMacro",
    "GetNumMacros",
    "InCombatLockdown",
    "SetMacroSpell",
    "GetSpellInfo",
    "GetSpellLink",
    
    -- Chat and UI
    "print",
    "DEFAULT_CHAT_FRAME",
    
    -- Event handling
    "C_Timer",
    
    -- WoW constants
    "LE_PARTY_CATEGORY_HOME",
    "LE_PARTY_CATEGORY_INSTANCE",
    "RAID_CLASS_COLORS",
}

-- Read-only globals
read_globals = {
    -- Standard Lua
    "string",
    "table",
    "math",
    "pairs",
    "ipairs",
    "type",
    "tonumber",
    "tostring",
    "select",
    "next",
    
    -- WoW libraries
    "LibStub",
}

-- Files to exclude
exclude_files = {
    ".luacheckrc",
}

-- Maximum line length (similar to ESLint max-len)
max_line_length = 120
