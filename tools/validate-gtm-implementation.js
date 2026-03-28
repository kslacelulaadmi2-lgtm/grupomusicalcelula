#!/usr/bin/env node
/**
 * Script de validación de implementación GTM
 * Verifica que todos los archivos HTML tengan el snippet correcto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const GTM_ID = 'GTM-5783XFN4';
const OLD_GTM_ID = 'GTM-KTG6F589';

async function validateFile(filePath, filename) {
    try {
        const content = await readFile(filePath, 'utf8');
        const issues = [];
        
        // Verificar que tenga el GTM correcto
        if (!content.includes(GTM_ID)) {
            issues.push(`❌ No tiene ${GTM_ID}`);
        }
        
        // Verificar que NO tenga el GTM viejo
        if (content.includes(OLD_GTM_ID)) {
            issues.push(`⚠️  Todavía tiene ${OLD_GTM_ID}`);
        }
        
        // Verificar snippet en head
        if (!content.includes('googletagmanager.com/gtm.js')) {
            issues.push('❌ Falta snippet GTM en <head>');
        }
        
        // Verificar noscript en body
        if (!content.includes('googletagmanager.com/ns.html')) {
            issues.push('❌ Falta noscript GTM en <body>');
        }
        
        // Verificar código gtag antiguo
        if (content.includes('gtag.js?id=G-') || content.includes('gtag.js?id=AW-')) {
            issues.push('⚠️  Tiene código gtag.js antiguo');
        }
        
        if (issues.length > 0) {
            console.log(`\n📄 ${filename}`);
            issues.forEach(issue => console.log(`   ${issue}`));
            return false;
        } else {
            console.log(`✅ ${filename}`);
            return true;
        }
        
    } catch (error) {
        console.error(`❌ Error leyendo ${filename}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🔍 Validando implementación GTM...\n');
    console.log(`✨ GTM Container esperado: ${GTM_ID}\n`);
    
    const rootDir = path.join(__dirname, '..');
    
    // Archivos principales
    const mainFiles = [
        'index.html',
        'blog.html',
        'cotizador.html',
        'testimonios.html'
    ];
    
    console.log('📂 Validando archivos principales:\n');
    
    let allValid = true;
    
    for (const file of mainFiles) {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
            const isValid = await validateFile(filePath, file);
            if (!isValid) allValid = false;
        } else {
            console.log(`⚠️  ${file} - No encontrado`);
            allValid = false;
        }
    }
    
    // Posts del blog
    console.log('\n\n📂 Validando posts del blog:\n');
    
    const postsDir = path.join(rootDir, 'post');
    const postFiles = await readdir(postsDir);
    const htmlPosts = postFiles.filter(f => f.endsWith('.html'));
    
    let validPosts = 0;
    
    for (const file of htmlPosts) {
        const filePath = path.join(postsDir, file);
        const isValid = await validateFile(filePath, `post/${file}`);
        if (isValid) validPosts++;
        if (!isValid) allValid = false;
    }
    
    // Resumen
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Archivos principales: ${mainFiles.length}/${mainFiles.length}`);
    console.log(`✅ Posts del blog: ${validPosts}/${htmlPosts.length}`);
    console.log(`\n📦 Total archivos validados: ${mainFiles.length + htmlPosts.length}`);
    
    if (allValid) {
        console.log('\n🎉 ¡Implementación GTM correcta en todos los archivos!\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  Hay archivos con problemas. Revisa los detalles arriba.\n');
        process.exit(1);
    }
}

main();
