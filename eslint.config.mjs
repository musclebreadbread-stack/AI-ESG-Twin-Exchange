import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // R8: No explicit any
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
    },
  },
  {
    // R1: No cross-feature internal imports
    files: ['features/**/*.ts', 'features/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/!(index)'],
              message: 'Import from feature barrel (index.ts) only (R1)',
            },
          ],
        },
      ],
    },
  },
  {
    // R3: Service layer isolation from infrastructure
    files: ['features/*/service/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'next/server', message: 'Service cannot import Next.js (R3)' },
            { name: '@prisma/client', message: 'Service cannot import Prisma directly (R3)' },
            { name: 'fs', message: 'Service cannot use Node fs (R3)' },
            { name: 'node:fs', message: 'Service cannot use Node fs (R3)' },
          ],
        },
      ],
    },
  },
  {
    // R6: Decision plane isolation from AI
    files: [
      'features/emission/domain/**/*.ts',
      'features/score/domain/**/*.ts',
      'features/scenario/domain/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/core/ai/**'],
              message: 'Decision plane must not directly import AI layer (R6)',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'prisma/migrations/**',
    ],
  }
);
