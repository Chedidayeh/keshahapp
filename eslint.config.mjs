/* jshint esversion: 11 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js and TypeScript configs
  ...compat.extends("next/core-web-vitals", "next/typescript", "eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"),

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  {
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];

export default eslintConfig;
