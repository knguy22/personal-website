// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [".*", "tailwind.config.ts", "components/ui/*", "app/api/auth/*/options.ts"],
  }
);