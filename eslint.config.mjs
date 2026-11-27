import eslintPluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

const shared_parser = {
    parser: parserTs,
    parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
        ecmaVersion: 2020
    }
}

const production_rules = {
    indent: ['error', 4, { SwitchCase: 1 }],
    semi: ['error', 'never'],
    curly: ['error', 'all'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-unused-vars': 'off',
    'no-trailing-spaces': ['error'],
    'brace-style': ['error', 'allman'],
    'keyword-spacing': ['error', { before: true, after: true }],
    'max-lines': ['error', { max: 125, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 3],
    'space-infix-ops': ['error', { int32Hint: false }],
    'max-statements-per-line': ['error', { max: 2 }],
    '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'function', format: ['snake_case'] },
        { selector: 'variable', format: ['snake_case'] },
        {
            selector: 'variable',
            modifiers: ['const'],
            format: ['snake_case', 'UPPER_CASE']
        }
    ]
}

const test_rules = {
    ...production_rules,
    'max-lines-per-function': 'off',
    'brace-style': 'off'
}

export default [
    {
        files: ['src/**/*.ts'],
        languageOptions: shared_parser,
        plugins: { '@typescript-eslint': eslintPluginTs },
        rules: production_rules
    },
    {
        files: ['test/src/**/*.ts'],
        languageOptions: shared_parser,
        plugins: { '@typescript-eslint': eslintPluginTs },
        rules: test_rules
    }
]
