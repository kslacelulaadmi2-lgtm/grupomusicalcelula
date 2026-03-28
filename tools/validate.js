#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '..');

console.log('🔍 Validating project structure...\n');

let errors = 0;
let warnings = 0;

// Check HTML files in root
console.log('📄 Checking HTML files...');
const htmlFiles = ['index.html', 'blog.html', 'cotizador.html'];

htmlFiles.forEach(file => {
    const filePath = join(PROJECT_ROOT, file);
    if (!existsSync(filePath)) {
        console.log(`  ❌ Missing file: ${file}`);
        errors++;
        return;
    }

    const content = readFileSync(filePath, 'utf8');

    // Check for common HTML issues
    if (!content.includes('<!DOCTYPE html>')) {
        console.log(`  ⚠️  ${file}: Missing DOCTYPE`);
        warnings++;
    }

    if (!content.includes('<html')) {
        console.log(`  ❌ ${file}: Missing <html> tag`);
        errors++;
    }

    console.log(`  ✓ ${file}`);
});

// Check CSS files
console.log('\n🎨 Checking CSS files...');
const cssDir = join(PROJECT_ROOT, 'css');
if (existsSync(cssDir)) {
    const cssFiles = readdirSync(cssDir).filter(f => f.endsWith('.css'));
    cssFiles.forEach(file => {
        console.log(`  ✓ ${file}`);
    });
} else {
    console.log('  ⚠️  CSS directory not found');
    warnings++;
}

// Check JS files
console.log('\n⚙️  Checking JS files...');
const jsDir = join(PROJECT_ROOT, 'js');
if (existsSync(jsDir)) {
    const jsFiles = readdirSync(jsDir).filter(f => f.endsWith('.js'));
    jsFiles.forEach(file => {
        const content = readFileSync(join(jsDir, file), 'utf8');
        
        // Check for basic syntax errors
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            console.log(`  ⚠️  ${file}: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
            warnings++;
        }
        
        console.log(`  ✓ ${file}`);
    });
} else {
    console.log('  ❌ JS directory not found');
    errors++;
}

// Check assets directory
console.log('\n🖼️  Checking assets...');
const assetsDir = join(PROJECT_ROOT, 'assets');
if (existsSync(assetsDir)) {
    console.log('  ✓ assets/');
} else {
    console.log('  ❌ Assets directory not found');
    errors++;
}

// Check functions directory
console.log('\n🔧 Checking functions...');
const functionsDir = join(PROJECT_ROOT, 'functions');
if (existsSync(functionsDir)) {
    const apiDir = join(functionsDir, 'api');
    if (existsSync(apiDir)) {
        const functionFiles = ['send-email.js', 'chatbot.js'];
        functionFiles.forEach(file => {
            const filePath = join(apiDir, file);
            if (existsSync(filePath)) {
                console.log(`  ✓ ${file}`);
            } else {
                console.log(`  ⚠️  Missing function: ${file}`);
                warnings++;
            }
        });
    }
} else {
    console.log('  ⚠️  Functions directory not found');
    warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Validation Summary:');
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}`);

if (errors > 0) {
    console.log('\n❌ Validation failed!');
    process.exit(1);
} else if (warnings > 0) {
    console.log('\n⚠️  Validation passed with warnings');
} else {
    console.log('\n✅ All validations passed!');
}
