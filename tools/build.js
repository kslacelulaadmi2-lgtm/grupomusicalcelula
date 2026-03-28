#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');

console.log('🏗️  Building celula-site for Amplify...\n');

// Clean dist directory
if (existsSync(DIST_DIR)) {
    console.log('🧹 Cleaning dist directory...');
    rmSync(DIST_DIR, { recursive: true, force: true });
}

// Create dist directory
mkdirSync(DIST_DIR, { recursive: true });

console.log('📦 Copying files to dist...\n');

// Copy HTML files from root
console.log('📄 Copying HTML files...');
const htmlFiles = ['index.html', 'blog.html', 'cotizador.html', 'testimonios.html'];
htmlFiles.forEach(file => {
    const src = join(PROJECT_ROOT, file);
    const dest = join(DIST_DIR, file);
    if (existsSync(src)) {
        cpSync(src, dest);
        console.log(`  ✓ ${file}`);
    }
});

// Copy post directory
console.log('\n📝 Copying blog posts...');
const postSrc = join(PROJECT_ROOT, 'post');
const postDest = join(DIST_DIR, 'post');
if (existsSync(postSrc)) {
    cpSync(postSrc, postDest, { recursive: true });
    console.log('  ✓ post/');
}

// Copy assets directory
console.log('\n🖼️  Copying assets...');
const assetsSrc = join(PROJECT_ROOT, 'assets');
const assetsDest = join(DIST_DIR, 'assets');
if (existsSync(assetsSrc)) {
    cpSync(assetsSrc, assetsDest, { recursive: true });
    console.log('  ✓ assets/');
}

// Copy CSS directory
console.log('\n🎨 Copying CSS...');
const cssSrc = join(PROJECT_ROOT, 'css');
const cssDest = join(DIST_DIR, 'css');
if (existsSync(cssSrc)) {
    cpSync(cssSrc, cssDest, { recursive: true });
    console.log('  ✓ css/');
}

// Copy JS directory
console.log('\n⚙️  Copying JavaScript...');
const jsSrc = join(PROJECT_ROOT, 'js');
const jsDest = join(DIST_DIR, 'js');
if (existsSync(jsSrc)) {
    cpSync(jsSrc, jsDest, { recursive: true });
    console.log('  ✓ js/');
}

// Copy static files
console.log('\n📋 Copying static files...');
const staticFiles = [
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    'sw.js',
    '_headers'
];

staticFiles.forEach(file => {
    const src = join(PROJECT_ROOT, file);
    const dest = join(DIST_DIR, file);
    if (existsSync(src)) {
        cpSync(src, dest);
        console.log(`  ✓ ${file}`);
    }
});

// Copy functions directory for Amplify
console.log('\n🔧 Copying serverless functions...');
const functionsSrc = join(PROJECT_ROOT, 'functions');
const functionsDest = join(DIST_DIR, 'functions');
if (existsSync(functionsSrc)) {
    cpSync(functionsSrc, functionsDest, { recursive: true });
    console.log('  ✓ functions/');
}

console.log('\n✅ Build complete! Output in dist/\n');
console.log('📊 Build summary:');
console.log(`   - HTML pages: ${htmlFiles.length}`);
console.log('   - Blog posts: ✓');
console.log('   - Assets: ✓');
console.log('   - CSS & JS: ✓');
console.log('   - Functions: ✓');
console.log('   - Static files: ✓\n');
