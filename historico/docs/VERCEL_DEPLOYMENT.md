# Vercel Deployment Guide

## Overview

El sitio de **Grupo Musical Versátil La Célula** ahora está configurado para desplegarse en **Vercel** con funciones serverless nativas.

## Estructura del Proyecto

```
celula-site/
├── api/                    # Vercel Serverless Functions
│   ├── chatbot.js         # Endpoint del chatbot (Google Gemini)
│   └── send-email.js      # Endpoint de envío de emails (Resend)
├── dist/                   # Build output (generado)
├── src/                    # Código fuente
├── archived/               # Deployments anteriores
│   ├── aws-deployment/    # Archivos de AWS Amplify/Lambda
│   └── cloudflare-deployment/  # Archivos de Cloudflare Pages
├── vercel.json            # Configuración de Vercel
├── .vercelignore          # Archivos a ignorar en deploy
└── package.json           # Dependencias y scripts
```

## Comandos de Deployment

### Desarrollo Local
```bash
npm install
npm run dev          # Inicia servidor local con Vercel CLI
```

### Preview Deployment
```bash
npm run deploy:preview    # Deploy a rama preview
```

### Production Deployment
```bash
npm run deploy           # Deploy a producción
```

## Variables de Entorno

Configure estas variables en el dashboard de Vercel (Settings > Environment Variables):

### Required Variables

1. **GEMINI_API_KEY**
   - Descripción: API key para Google Gemini (chatbot)
   - Obtener en: https://makersuite.google.com/app/apikey
   - Scope: Production, Preview, Development

2. **RESEND_API_KEY**
   - Descripción: API key para Resend (emails)
   - Obtener en: https://resend.com/api-keys
   - Scope: Production, Preview, Development

3. **CONTACT_EMAIL**
   - Descripción: Email destino para formularios
   - Ejemplo: `contacto@grupomusicalcelula.com`
   - Scope: Production, Preview, Development

### Configuración en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega cada variable:
   - **Key**: Nombre de la variable
   - **Value**: El valor secreto
   - **Environment**: Selecciona Production, Preview, Development

## Endpoints de la API

### Chatbot
- **URL**: `https://tu-dominio.vercel.app/api/chatbot`
- **Método**: POST
- **Body**:
  ```json
  {
    "history": [
      {
        "role": "user",
        "parts": [{"text": "Hola"}]
      }
    ]
  }
  ```

### Send Email
- **URL**: `https://tu-dominio.vercel.app/api/send-email`
- **Método**: POST
- **Body**:
  ```json
  {
    "type": "chatbot_lead",
    "leadData": {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "5551234567"
    }
  }
  ```

## Configuración de Vercel

### vercel.json
El archivo `vercel.json` configura:
- Build command y output directory
- Runtime de Node.js (18.x)
- Headers de seguridad
- Cache para assets
- Rewrites para las APIs

### .vercelignore
Excluye del deploy:
- Archivos archivados (`archived/`)
- Documentación (`docs/`)
- Tests y scripts de verificación
- Archivos de configuración de otros providers

## Build Process

El comando `npm run build` ejecuta `tools/build.js`:

1. Valida archivos HTML
2. Copia assets a `dist/`
3. Procesa CSS y JS
4. Optimiza imágenes
5. Genera sitemap y manifest

La carpeta `dist/` es servida como sitio estático por Vercel.

## Testing Local

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Vincular proyecto (primera vez)
vercel link

# Descargar variables de entorno
vercel env pull .env.local

# Iniciar servidor de desarrollo
vercel dev

# Test endpoints
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"history":[{"role":"user","parts":[{"text":"Hola"}]}]}'
```

## Deployment Workflow

### Primera vez

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configurar variables de entorno** en el dashboard

### Deployments subsecuentes

```bash
# Commit cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin vercel-deployment

# Deploy automático o manual
vercel --prod
```

## Integración con Git

Vercel puede conectarse a tu repositorio para deploys automáticos:

1. Ve a tu proyecto en Vercel
2. Settings > Git
3. Conecta tu repositorio (GitHub, GitLab, Bitbucket)
4. Configura:
   - **Production Branch**: `vercel-deployment` (o `main`)
   - **Preview Branches**: All branches
   - **Auto Deploy**: Enabled

## Dominios Personalizados

1. Ve a Settings > Domains en Vercel
2. Agrega tu dominio: `grupomusicalcelula.com`
3. Configura DNS según instrucciones
4. Vercel provee SSL automático

## Monitoreo

### Logs
- Dashboard > Deployments > [Tu deploy] > Logs
- Ver logs en tiempo real de las funciones

### Analytics
- Dashboard > Analytics
- Métricas de rendimiento y uso

### Error Tracking
- Dashboard > [Deploy] > Functions
- Ver errores y stack traces

## Troubleshooting

### Build fails
```bash
# Verificar build localmente
npm run build

# Ver logs detallados en Vercel dashboard
```

### API no responde
- Verificar variables de entorno en Settings
- Revisar logs de la función específica
- Probar endpoint localmente con `vercel dev`

### CORS errors
- Headers configurados en `vercel.json`
- Verificar origen de la request

## Rollback

Si algo sale mal:

```bash
# Listar deploys
vercel ls

# Promover deploy anterior
vercel promote [deployment-url]
```

O desde el dashboard:
1. Deployments
2. Selecciona deploy anterior
3. Click "Promote to Production"

## Migraciones Anteriores

Los archivos de despliegues anteriores están archivados:

- **AWS Amplify/Lambda**: `archived/aws-deployment/`
- **Cloudflare Pages**: `archived/cloudflare-deployment/`

Consulta los README en esas carpetas para referencia histórica.

## Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Soporte

Para problemas específicos de este proyecto, revisar:
- `docs/AGENTS.md` - Guía para AI assistants
- Issues en el repositorio
