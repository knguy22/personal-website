// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      ".*",
      "*.mjs",
      "tailwind.config.ts",
      "components/ui/*",
      "components/hooks/*",
      "app/api/auth/*/options.ts"
    ],
  }
);