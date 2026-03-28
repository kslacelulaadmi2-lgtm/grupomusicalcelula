# 🔧 Configuración del Sistema de Emails

Guía completa para configurar el sistema unificado de envío de emails del sitio.

---

## 📋 Requisitos Previos

Antes de comenzar, necesitas:

1. ✅ Una cuenta de [Resend](https://resend.com)
2. ✅ Acceso al Dashboard de Cloudflare Pages
3. ✅ Permisos para crear KV namespaces

---

## 🚀 Paso 1: Obtener API Key de Resend

### 1.1 Crear Cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta gratuita o inicia sesión
3. Confirma tu email

### 1.2 Generar API Key

1. En el Dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Dale un nombre descriptivo: `celula-site-production`
4. Selecciona permisos: **Send emails**
5. Click en **Create**
6. **⚠️ IMPORTANTE**: Copia la API key inmediatamente (solo se muestra una vez)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.3 Verificar Dominio (Recomendado)

Para evitar que los emails caigan en spam:

1. En Resend, ve a **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio: `grupolacelula.com`
4. Sigue las instrucciones para añadir registros DNS
5. Espera verificación (puede tardar hasta 48 horas)

**Nota**: Mientras tanto, puedes usar el dominio de prueba de Resend.

---

## 🔐 Paso 2: Configurar Variables de Entorno en Cloudflare

### 2.1 Acceder a Cloudflare Dashboard

1. Ve a https://dash.cloudflare.com
2. Inicia sesión con tu cuenta
3. Selecciona **Workers & Pages**
4. Click en tu proyecto: **celula-site** (o el nombre de tu proyecto)

### 2.2 Configurar Variables de Entorno

1. Ve a **Settings** → **Environment variables**
2. Selecciona la pestaña **Production**

#### Variable 1: RESEND_API_KEY

1. Click en **Add variable**
2. Configura:
   - **Variable name**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxx` (tu API key de Resend)
   - **Type**: Selecciona **Encrypt** ✅
3. Click en **Save**

#### Variable 2: CONTACT_EMAIL

1. Click en **Add variable** nuevamente
2. Configura:
   - **Variable name**: `CONTACT_EMAIL`
   - **Value**: `contacto@grupolacelula.com` (email donde recibirás las solicitudes)
   - **Type**: Puede ser **Plain text**
3. Click en **Save**

### 2.3 Configurar Variables para Preview (Opcional)

Si quieres probar en ramas de preview:

1. Selecciona la pestaña **Preview**
2. Repite el proceso para:
   - `RESEND_API_KEY`
   - `CONTACT_EMAIL`

---

## 📦 Paso 3: Crear KV Namespace para Rate Limiting

El KV namespace almacena los contadores de rate limiting.

### 3.1 Crear el Namespace

#### Opción A: Dashboard de Cloudflare

1. En Cloudflare Dashboard, ve a **Workers & Pages** → **KV**
2. Click en **Create a namespace**
3. Configura:
   - **Namespace Name**: `EMAIL_RATE_LIMIT`
4. Click en **Add**

#### Opción B: Wrangler CLI

```bash
# Desde el directorio del proyecto
wrangler kv:namespace create "EMAIL_RATE_LIMIT"

# Nota: Guarda el ID que te proporciona
```

### 3.2 Vincular el Namespace al Proyecto

#### Opción A: Dashboard (Recomendado)

1. Ve a tu proyecto en **Workers & Pages**
2. **Settings** → **Functions**
3. Scroll hasta **KV Namespace Bindings**
4. Click en **Add binding**
5. Configura:
   - **Variable name**: `EMAIL_RATE_LIMIT`
   - **KV namespace**: Selecciona `EMAIL_RATE_LIMIT` del dropdown
6. Click en **Save**

#### Opción B: wrangler.toml

Añade al archivo `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "EMAIL_RATE_LIMIT"
id = "tu_namespace_id_aqui"
```

---

## 🧪 Paso 4: Verificar la Configuración

### 4.1 Verificar Variables de Entorno

En el Dashboard de Cloudflare:

1. Ve a **Settings** → **Environment variables**
2. Verifica que aparezcan:
   - ✅ `RESEND_API_KEY` (Encrypted)
   - ✅ `CONTACT_EMAIL`

### 4.2 Verificar KV Namespace

1. Ve a **Settings** → **Functions**
2. En **KV Namespace Bindings** debe aparecer:
   - ✅ `EMAIL_RATE_LIMIT` → vinculado a tu namespace

---

## 🚢 Paso 5: Desplegar los Cambios

### 5.1 Hacer Deploy

Si usas Git + Cloudflare Pages (automático):

```bash
git add .
git commit -m "feat: implementar sistema unificado de emails"
git push origin main
```

Cloudflare Pages desplegará automáticamente.

### 5.2 Deployment Manual (si es necesario)

```bash
# Desde el directorio del proyecto
wrangler pages deploy .
```

---

## ✅ Paso 6: Probar el Sistema

### 6.1 Test del Chatbot

1. Ve a tu sitio: `https://grupomusicalcelula.com`
2. Abre el chatbot
3. Completa el formulario inicial
4. Mantén una conversación de al menos 3 mensajes
5. Verifica que:
   - ✅ El resumen se envía automáticamente
   - ✅ Recibes el email en `CONTACT_EMAIL`
   - ✅ El email tiene formato HTML profesional

### 6.2 Test del Cotizador

1. Ve a: `https://grupomusicalcelula.com/cotizador.html`
2. Completa el formulario con datos válidos:
   - Nombre completo
   - Email válido
   - Teléfono de 10 dígitos
   - Tipo de evento
   - Fecha futura
   - Número de invitados (1-1000)
   - Ubicación
3. Envía el formulario
4. Verifica que:
   - ✅ Aparece mensaje de confirmación
   - ✅ Se abre WhatsApp con el mensaje
   - ✅ Recibes el email en `CONTACT_EMAIL`

### 6.3 Test de Rate Limiting

1. Envía 6 formularios rápidamente
2. Verifica que el 6to muestra error:
   ```
   "Límite de solicitudes excedido. Intenta de nuevo en X minutos."
   ```

---

## 🔍 Paso 7: Monitoreo

### 7.1 Ver Logs en Tiempo Real

1. Ve a Cloudflare Dashboard → **Workers & Pages**
2. Selecciona tu proyecto
3. Ve a **Logs** (pestaña)
4. Activa **Real-time logs**

### 7.2 Revisar Analytics

1. En el Dashboard, ve a **Analytics**
2. Revisa:
   - Solicitudes por día
   - Tasa de errores
   - Latencia promedio

### 7.3 Monitorear Emails en Resend

1. Ve a tu Dashboard de Resend
2. Sección **Emails**
3. Verifica:
   - Emails enviados
   - Tasa de entrega
   - Bounces o errores

---

## 🔧 Configuración Avanzada

### Ajustar Rate Limiting

Edita `functions/api/send-email.js`:

```javascript
const CONFIG = {
  RATE_LIMIT: {
    MAX_REQUESTS: 5,     // ← Cambiar aquí (solicitudes)
    WINDOW_HOURS: 1,     // ← Cambiar aquí (horas)
  },
  // ...
};
```

### Personalizar Plantillas de Email

Las plantillas HTML están en `generateEmailContent()` en `functions/api/send-email.js`.

### Añadir Más Orígenes CORS

```javascript
CORS: {
  ALLOWED_ORIGINS: [
    'https://grupomusicalcelula.com',
    'https://www.grupolacelula.com',
    'https://tu-otro-dominio.com', // ← Añadir aquí
    'http://localhost:8788',
  ],
},
```

---

## 🆘 Troubleshooting

### ❌ Error: "Configuración del servidor incompleta"

**Causa**: Faltan variables de entorno.

**Solución**:
1. Verifica en Dashboard que existan `RESEND_API_KEY` y `CONTACT_EMAIL`
2. Re-deploy el proyecto
3. Espera 1-2 minutos para que se propague

---

### ❌ Error: "Failed to send email"

**Causas posibles**:
1. API key de Resend inválida
2. Email destino inválido
3. Límite de envíos de Resend excedido

**Solución**:
1. Verifica la API key en Resend Dashboard
2. Verifica el email en `CONTACT_EMAIL`
3. Revisa los logs de Resend
4. Verifica tu plan de Resend (límites de envío)

---

### ❌ Error: "KV namespace EMAIL_RATE_LIMIT no configurado"

**Causa**: El KV namespace no está vinculado.

**Solución**:
1. Ve a Settings → Functions → KV Namespace Bindings
2. Añade el binding `EMAIL_RATE_LIMIT`
3. Re-deploy el proyecto

**Nota**: El sistema funcionará sin KV, pero sin rate limiting.

---

### ❌ Emails caen en spam

**Soluciones**:
1. **Verifica el dominio en Resend** (más importante)
2. Añade registros SPF, DKIM, DMARC
3. Evita palabras spam en el asunto
4. Incluye siempre un link de unsuscribe (si aplica)

---

### ❌ Error de CORS

**Causa**: Solicitud desde dominio no autorizado.

**Solución**:
1. Verifica el dominio desde donde haces la solicitud
2. Añádelo a `ALLOWED_ORIGINS` en el worker
3. Re-deploy

---

## 📊 Límites y Cuotas

### Resend (Plan Gratuito)

- ✅ 100 emails/día
- ✅ 3,000 emails/mes
- ⚠️ Solo 1 dominio verificado

**Para más**: Upgrade a plan de pago.

### Cloudflare Workers

- ✅ 100,000 solicitudes/día (plan gratuito)
- ✅ KV: 100,000 lecturas/día
- ✅ KV: 1,000 escrituras/día

**Para más**: Upgrade a Workers Paid.

---

## 🔒 Seguridad - Checklist

Antes de ir a producción, verifica:

- [ ] API key de Resend está encriptada en Cloudflare
- [ ] `CONTACT_EMAIL` es válido
- [ ] KV namespace está vinculado
- [ ] CORS solo permite dominios autorizados
- [ ] Rate limiting está activo
- [ ] Dominio verificado en Resend (recomendado)
- [ ] Logs están siendo monitoreados

---

## 📚 Referencias

- [Documentación de Resend](https://resend.com/docs)
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [API de Emails - Documentación Interna](./EMAIL-API.md)

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa los logs en Cloudflare Dashboard
2. Consulta la [documentación de la API](./EMAIL-API.md)
3. Revisa la sección de Troubleshooting
4. Contacta al equipo de desarrollo

---

**Última actualización**: 18 de Noviembre de 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para producción
