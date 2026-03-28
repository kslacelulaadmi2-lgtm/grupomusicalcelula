export default [
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                sessionStorage: 'readonly',
                localStorage: 'readonly',
                location: 'readonly',
                confirm: 'readonly',
                parent: 'readonly',
                IntersectionObserver: 'readonly',

                // Node.js globals (for functions)
                module: 'readonly',
                exports: 'readonly',
                require: 'readonly',
                process: 'readonly',
                global: 'readonly',

                // Project specific globals
                PersistentVideoBackground: 'readonly',
                CelulaVideoBackground: 'readonly'
            }
        },
        rules: {
            // Error rules
            'no-console': 'off', // Allow console.log for debugging
            'no-unused-vars': 'warn',
            'no-undef': 'error',

            // Style rules
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],

            // Best practices
            'eqeqeq': 'error',
            'no-trailing-spaces': 'error',
            'no-multiple-empty-lines': ['error', { 'max': 2 }],
            'comma-dangle': ['error', 'never'],

            // Modern JavaScript
            'prefer-const': 'warn',
            'no-var': 'error'
        },
        ignores: [
            'node_modules/**',
            'dist/**',
            '**/*.min.js',
            'functions/node_modules/**'
        ]
    }
];