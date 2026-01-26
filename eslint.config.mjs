import js from "@eslint/js";
import globals from "globals";

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
