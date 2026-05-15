/**
 * ESLint flat config for ows.
 *
 * Migrated from `.eslintrc.json` for ESLint 9 (flat config is the only
 * supported format from ESLint 9 onward). Rules and plugin set are kept
 * in semantic parity with the legacy config.
 *
 * Type-aware linting uses `parserOptions.projectService: true` (from
 * typescript-eslint v8) for automatic tsconfig discovery instead of the
 * legacy `parserOptions.project: 'tsconfig.json'`. This avoids having to
 * enumerate every tsconfig in the project and matches the upstream
 * recommendation.
 */
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "eslint.config.mjs",
      "dist/**",
      "node_modules/**",
      "client/**",
      "docs/**",
      "coverage/**",
    ],
  },
  ...tseslint.configs.recommended,
  jsdocPlugin.configs["flat/recommended"],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "arrow-spacing": ["warn", { before: true, after: true }],
      camelcase: ["error"],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",
      curly: ["error", "multi-line", "consistent"],
      "dot-location": ["error", "property"],
      eqeqeq: ["error", "always"],
      "handle-callback-err": "off",
      "import/first": "error",
      "import/exports-last": "error",
      "import/newline-after-import": "error",
      "import/no-unresolved": [
        "error",
        { ignore: ["^@modelcontextprotocol/sdk/"] },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          publicOnly: true,
        },
      ],
      "jsdoc/require-description-complete-sentence": "error",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/tag-lines": [
        "error",
        "any",
        {
          startLines: 1,
        },
      ],
      "keyword-spacing": "error",
      "max-nested-callbacks": ["error", { max: 4 }],
      "max-statements-per-line": ["error", { max: 2 }],
      "no-console": "off",
      "no-empty-function": "error",
      "no-floating-decimal": "error",
      "no-inline-comments": "error",
      "no-lonely-if": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": [
        "error",
        { max: 2, maxEOF: 1, maxBOF: 0 },
      ],
      "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
      "no-trailing-spaces": ["error"],
      "no-var": "error",
      "object-curly-spacing": ["error", "always"],
      "prefer-const": "error",
      semi: ["error", "always"],
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": "error",
      yoda: "error",
    },
  },
);
