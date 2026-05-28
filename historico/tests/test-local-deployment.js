#!/usr/bin/env node
// Test local deployment simulation for AWS Amplify
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing Local Deployment Simulation\n');

// Test 1: Check dist build
console.log('1️⃣  Checking dist/ build...');
const distDir = './dist';
const requiredFiles = [
    'index.html',
    'blog.html',
    'cotizador.html',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    '_headers'
];

let passed = 0;
let failed = 0;

requiredFiles.forEach(file => {
    const path = join(distDir, file);
    if (existsSync(path)) {
        console.log(`   ✓ ${file}`);
        passed++;
    } else {
        console.log(`   ❌ ${file} - MISSING`);
        failed++;
    }
});

// Test 2: Check functions
console.log('\n2️⃣  Checking serverless functions...');
const functions = ['send-email.js', 'chatbot.js'];
functions.forEach(func => {
    const path = join(distDir, 'functions/api', func);
    if (existsSync(path)) {
        console.log(`   ✓ ${func}`);
        passed++;
    } else {
        console.log(`   ❌ ${func} - MISSING`);
        failed++;
    }
});

// Test 3: Check environment variables (simulated)
console.log('\n3️⃣  Checking environment variables (test)...');
const envFile = '.env.test';
if (existsSync(envFile)) {
    const envContent = readFileSync(envFile, 'utf8');
    const requiredVars = ['RESEND_API_KEY', 'CONTACT_EMAIL', 'GEMINI_API_KEY'];
    
    requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
            console.log(`   ✓ ${varName} configured`);
            passed++;
        } else {
            console.log(`   ❌ ${varName} - MISSING`);
            failed++;
        }
    });
} else {
    console.log('   ⚠️  .env.test not found (OK for production)');
}

// Test 4: Check JS syntax in functions
console.log('\n4️⃣  Validating function syntax...');
functions.forEach(func => {
    const path = join(distDir, 'functions/api', func);
    if (existsSync(path)) {
        try {
            const content = readFileSync(path, 'utf8');
            // Basic checks
            if (content.includes('export') || content.includes('module.exports')) {
                console.log(`   ✓ ${func} has proper exports`);
                passed++;
            } else {
                console.log(`   ⚠️  ${func} may be missing exports`);
            }
        } catch (error) {
            console.log(`   ❌ ${func} - Error reading: ${error.message}`);
            failed++;
        }
    }
});

// Test 5: Check critical paths
console.log('\n5️⃣  Checking critical paths...');
const criticalPaths = [
    'assets/data/blog-posts.json',
    'assets/data/youtube-videos.json',
    'css/styles.min.css',
    'js/chatbot.min.js'
];

criticalPaths.forEach(path => {
    const fullPath = join(distDir, path);
    if (existsSync(fullPath)) {
        console.log(`   ✓ ${path}`);
        passed++;
    } else {
        console.log(`   ❌ ${path} - MISSING`);
        failed++;
    }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n✅ All local deployment tests passed!');
    console.log('🚀 Ready for AWS Amplify deployment\n');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix before deploying.\n');
    process.exit(1);
}
