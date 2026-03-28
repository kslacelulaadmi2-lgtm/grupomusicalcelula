#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { minify as terserMinify } from 'terser';
import postcss from 'postcss';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const CSS_DIR = join(PROJECT_ROOT, 'css');
const JS_DIR = join(PROJECT_ROOT, 'js');

console.log('🗜️  Minifying CSS and JS files...\n');

// Minify CSS files
async function minifyCSS(inputPath, outputPath) {
    try {
        const css = readFileSync(inputPath, 'utf8');
        const result = await postcss([
            cssnano({
                preset: ['default', {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                    colormin: true,
                    minifyFontValues: true,
                    minifySelectors: true
                }]
            })
        ]).process(css, { from: inputPath, to: outputPath });
        
        writeFileSync(outputPath, result.css);
        
        const originalSize = (Buffer.byteLength(css, 'utf8') / 1024).toFixed(2);
        const minifiedSize = (Buffer.byteLength(result.css, 'utf8') / 1024).toFixed(2);
        const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        
        console.log(`  ✓ ${basename(inputPath)} → ${basename(outputPath)}`);
        console.log(`    ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)\n`);
        
        return true;
    } catch (error) {
        console.error(`  ✗ Error minifying ${basename(inputPath)}:`, error.message);
        return false;
    }
}

// Minify JS files
async function minifyJS(inputPath, outputPath) {
    try {
        const code = readFileSync(inputPath, 'utf8');
        const result = await terserMinify(code, {
            compress: {
                dead_code: true,
                drop_console: false,
                drop_debugger: true,
                keep_classnames: true,
                keep_fnames: false,
                passes: 2
            },
            mangle: {
                keep_classnames: true,
                keep_fnames: false
            },
            format: {
                comments: false,
                preamble: `/* ${basename(inputPath)} - Minified */`
            }
        });
        
        if (result.code) {
            writeFileSync(outputPath, result.code);
            
            const originalSize = (Buffer.byteLength(code, 'utf8') / 1024).toFixed(2);
            const minifiedSize = (Buffer.byteLength(result.code, 'utf8') / 1024).toFixed(2);
            const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
            
            console.log(`  ✓ ${basename(inputPath)} → ${basename(outputPath)}`);
            console.log(`    ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)\n`);
            
            return true;
        }
        return false;
    } catch (error) {
        console.error(`  ✗ Error minifying ${basename(inputPath)}:`, error.message);
        return false;
    }
}

// Process directory
async function processDirectory(dir, extension, minifyFunction) {
    const files = readdirSync(dir);
    const results = { success: 0, failed: 0, skipped: 0 };
    
    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        
        if (stat.isFile() && extname(file) === extension && !file.includes('.min.')) {
            const minFileName = file.replace(extension, `.min${extension}`);
            const minFilePath = join(dir, minFileName);
            
            const success = await minifyFunction(filePath, minFilePath);
            if (success) {
                results.success++;
            } else {
                results.failed++;
            }
        } else if (file.includes('.min.')) {
            results.skipped++;
        }
    }
    
    return results;
}

// Main execution
async function main() {
    console.log('🎨 Minifying CSS files...\n');
    const cssResults = await processDirectory(CSS_DIR, '.css', minifyCSS);
    
    console.log('🎨 Minifying CSS files in JS directory...\n');
    const jsCssResults = await processDirectory(JS_DIR, '.css', minifyCSS);
    
    console.log('⚙️  Minifying JavaScript files...\n');
    const jsResults = await processDirectory(JS_DIR, '.js', minifyJS);
    
    console.log('✅ Minification complete!\n');
    console.log('📊 Summary:');
    console.log(`   CSS (css/): ${cssResults.success} minified, ${cssResults.failed} failed, ${cssResults.skipped} skipped`);
    console.log(`   CSS (js/):  ${jsCssResults.success} minified, ${jsCssResults.failed} failed, ${jsCssResults.skipped} skipped`);
    console.log(`   JS:         ${jsResults.success} minified, ${jsResults.failed} failed, ${jsResults.skipped} skipped\n`);
    
    if (cssResults.failed > 0 || jsCssResults.failed > 0 || jsResults.failed > 0) {
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Minification failed:', error);
    process.exit(1);
});
