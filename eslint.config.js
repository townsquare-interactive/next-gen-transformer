import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default defineConfig([
    tseslint.configs.recommended,
    {
        files: ['src/**/*.{js,ts}'],
        languageOptions: { globals: globals.node },
        plugins: { import: importPlugin },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.ts'],
                },
            },
        },
        rules: {
            // Only enable the import/extensions rule
            'import/extensions': [
                'error',
                'always', // Always require extensions
                { js: 'always', ts: 'always' },
            ],
        },
    },
])
