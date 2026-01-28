import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      // Code quality
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "caughtErrors": "none"
      }],
      "no-console": "off", // We use console.log for CLI output
      "no-constant-condition": ["error", { "checkLoops": false }],
      
      // Best practices
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-var": "error",
      "prefer-const": "error",
      
      // Style (basic)
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "comma-dangle": ["error", "never"],
      "max-len": ["warn", { 
        "code": 120, 
        "ignoreStrings": true, 
        "ignoreTemplateLiterals": true,
        "ignoreComments": true
      }],
      
      // Modern JavaScript
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "object-shorthand": ["error", "always"]
    }
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        ...globals.node,
        // WoW API globals
        CreateFrame: "readonly",
        UIParent: "readonly",
        GameTooltip: "readonly",
        Settings: "readonly",
        StaticPopup_Show: "readonly",
        StaticPopup_Visible: "readonly",
        UIDropDownMenu_SetWidth: "readonly",
        UIDropDownMenu_Initialize: "readonly",
        UIDropDownMenu_CreateInfo: "readonly",
        UIDropDownMenu_SetSelectedValue: "readonly",
        UIDropDownMenu_AddButton: "readonly",
        C_Timer: "readonly",
        print: "readonly",
        math: "readonly",
        string: "readonly",
        // WoW API types - not really globals but ESLint doesn't understand TypeScript types
        Frame: "readonly",
        Button: "readonly",
        EditBox: "readonly",
        Texture: "readonly",
        FontString: "readonly",
        WoWGlobals: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Disable rules that conflict with TypeScript
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "caughtErrors": "none"
      }],
      "@typescript-eslint/no-explicit-any": "off", // WoW API uses any extensively
      "@typescript-eslint/ban-ts-comment": "off", // Allow @ts-ignore for TSTL quirks
      
      // Style
      "semi": ["error", "always"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "comma-dangle": ["error", "never"]
    }
  },
  prettier,
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly"
      }
    }
  },
  {
    ignores: ["node_modules/**", "dist/**", "build/**"]
  }
];
