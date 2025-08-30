import js from "@eslint/js"
import globals from "globals"
import { defineConfig } from "eslint/config"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import pluginVue from "eslint-plugin-vue"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: [js.configs.recommended, ...pluginVue.configs["flat/recommended"]],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  eslintConfigPrettier,
])
