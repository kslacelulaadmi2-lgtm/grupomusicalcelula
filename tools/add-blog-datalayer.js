#!/usr/bin/env node
/**
 * Script para agregar dataLayer push en posts del blog
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

const BLOG_DATALAYER_SCRIPT = `
    <!-- GTM DataLayer: Blog Post View -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const postTitle = document.querySelector('.blog-post-content h1, .post-title, h1')?.textContent?.trim() || 'Post sin título';
        const postUrl = window.location.pathname;
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'view_blog_post',
            postTitle: postTitle,
            postUrl: postUrl,
            postCategory: 'Blog'
        });
        
        console.log('📊 GTM Event: view_blog_post -', postTitle);
    });
    </script>
`;

async function addDataLayerToPost(filePath) {
    try {
        let content = await readFile(filePath, 'utf8');
        
        // Verificar si ya tiene el script de dataLayer
        if (content.includes('view_blog_post')) {
            console.log(`⏭️  Ya tiene dataLayer: ${path.basename(filePath)}`);
            return false;
        }
        
        // Buscar el cierre de </body> y agregar el script antes
        const bodyCloseMatch = content.match(/<\/body>/i);
        if (bodyCloseMatch) {
            const insertIndex = bodyCloseMatch.index;
            content = content.slice(0, insertIndex) + BLOG_DATALAYER_SCRIPT + '\n' + content.slice(insertIndex);
            
            await writeFile(filePath, content, 'utf8');
            console.log(`✅ Agregado dataLayer: ${path.basename(filePath)}`);
            return true;
        } else {
            console.warn(`⚠️  No se encontró </body> en: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error en ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

async function main() {
    const postsDir = path.join(__dirname, '..', 'post');
    
    console.log('🚀 Agregando dataLayer push a posts del blog...\n');
    
    try {
        const files = await readdir(postsDir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        
        console.log(`📂 Encontrados ${htmlFiles.length} archivos HTML en /post\n`);
        
        let updatedCount = 0;
        
        for (const file of htmlFiles) {
            const filePath = path.join(postsDir, file);
            const wasUpdated = await addDataLayerToPost(filePath);
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
