#!/usr/bin/env node
/**
 * Script para actualizar posts del blog:
 * - Eliminar código gtag.js antiguo
 * - Agregar snippet de GTM correcto (GTM-5783XFN4)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const GTM_HEAD_SNIPPET = `    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5783XFN4');</script>
    <!-- End Google Tag Manager -->

`;

const GTM_BODY_SNIPPET = `    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5783XFN4"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

`;

async function updatePost(filePath) {
    try {
        let content = await readFile(filePath, 'utf8');
        let modified = false;

        // Eliminar código gtag.js antiguo (todas las variantes)
        const gtagPatterns = [
            // Patrón 1: Script async + función gtag
            /<!-- Google tag \(gtag\.js\) -->[\s\S]*?<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=.*?<\/script>[\s\S]*?<script>[\s\S]*?gtag\(.*?\);[\s\S]*?<\/script>\s*/g,
            // Patrón 2: Solo función gtag sin async
            /<script>[\s\S]*?function gtag\(\)\{dataLayer\.push\(arguments\);\}[\s\S]*?<\/script>\s*/g,
        ];

        gtagPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        });

        // Verificar si ya tiene GTM
        const hasGTM = content.includes('GTM-5783XFN4') || content.includes('GTM-KTG6F589');

        if (!hasGTM) {
            // Agregar GTM en <head> (después de la etiqueta <head>)
            const headMatch = content.match(/<head>/i);
            if (headMatch) {
                const headIndex = headMatch.index + headMatch[0].length;
                content = content.slice(0, headIndex) + '\n' + GTM_HEAD_SNIPPET + content.slice(headIndex);
                modified = true;
            }

            // Agregar GTM noscript en <body> (después de la etiqueta <body>)
            const bodyMatch = content.match(/<body[^>]*>/i);
            if (bodyMatch) {
                const bodyIndex = bodyMatch.index + bodyMatch[0].length;
                content = content.slice(0, bodyIndex) + '\n' + GTM_BODY_SNIPPET + content.slice(bodyIndex);
                modified = true;
            }
        } else if (content.includes('GTM-KTG6F589')) {
            // Actualizar GTM viejo al nuevo
            content = content.replace(/GTM-KTG6F589/g, 'GTM-5783XFN4');
            modified = true;
        }

        if (modified) {
            await writeFile(filePath, content, 'utf8');
            console.log(`✅ Actualizado: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`⏭️  Sin cambios: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error en ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

async function main() {
    const postsDir = path.join(__dirname, '..', 'post');
    
    console.log('🚀 Iniciando actualización de posts del blog...\n');
    
    try {
        const files = await readdir(postsDir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        
        console.log(`📂 Encontrados ${htmlFiles.length} archivos HTML en /post\n`);
        
        let updatedCount = 0;
        
        for (const file of htmlFiles) {
            const filePath = path.join(postsDir, file);
            const wasUpdated = await updatePost(filePath);
            if (wasUpdated) updatedCount++;
        }
        
        console.log(`\n✨ Proceso completado:`);
        console.log(`   - Archivos actualizados: ${updatedCount}`);
        console.log(`   - Archivos sin cambios: ${htmlFiles.length - updatedCount}`);
        console.log(`   - Total procesados: ${htmlFiles.length}`);
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

main();
