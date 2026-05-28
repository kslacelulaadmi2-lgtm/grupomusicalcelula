# 📧 API de Envío de Emails - Grupo Musical La Célula

Documentación completa del endpoint unificado de envío de emails para el chatbot y el cotizador.

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Endpoint](#endpoint)
3. [Autenticación](#autenticación)
4. [Tipos de Solicitud](#tipos-de-solicitud)
5. [Esquemas de Validación](#esquemas-de-validación)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Respuestas](#respuestas)
8. [Rate Limiting](#rate-limiting)
9. [Seguridad](#seguridad)
10. [Troubleshooting](#troubleshooting)

---

## Visión General

El endpoint `/api/send-email` es un **Cloudflare Worker** que maneja de forma unificada el envío de emails tanto del **chatbot** como del **cotizador**. Implementa mejores prácticas de seguridad, validación y rate limiting.

### Características Principales

✅ **Endpoint unificado** - Un solo punto de entrada para todos los emails  
✅ **Validación robusta** - Schemas diferenciados según el tipo de formulario  
✅ **Rate limiting** - Protección contra spam (5 solicitudes por hora por IP)  
✅ **Sanitización** - Prevención de XSS en todos los inputs  
✅ **CORS seguro** - Solo permite orígenes autorizados  
✅ **Logging** - Registro de todas las operaciones para auditoría  
✅ **Plantillas HTML** - Emails profesionales y responsive  

---

## Endpoint

```
POST /api/send-email
```

### URL Completa

- **Producción**: `https://grupomusicalcelula.com/api/send-email`
- **Desarrollo (Cloudflare Pages)**: `https://grupomusicalcelula.pages.dev/api/send-email`
- **Desarrollo local**: `http://localhost:8788/api/send-email`

---

## Autenticación

El endpoint **NO requiere autenticación del cliente**. La seguridad se maneja mediante:

1. **Rate limiting por IP** (Cloudflare KV)
2. **CORS restrictivo** (solo dominios autorizados)
3. **Validación estricta** de todos los datos
4. **API keys en el servidor** (variables de entorno)

### Variables de Entorno Requeridas

Configurar en el Dashboard de Cloudflare Pages:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=contacto@grupolacelula.com
```

### KV Namespace Requerido

Crear en Cloudflare Workers > KV:

```
Nombre: EMAIL_RATE_LIMIT
Binding: EMAIL_RATE_LIMIT
```

---

## Tipos de Solicitud

El endpoint detecta automáticamente el tipo de solicitud basándose en el campo `type` o en la presencia de campos específicos.

### 1. Chatbot (`type: "chatbot"`)

Para resúmenes de conversaciones del chatbot.

### 2. Cotizador (`type: "cotizador"`)

Para solicitudes de cotización del formulario.

---

## Esquemas de Validación

### Schema: Chatbot

```typescript
{
  type: "chatbot",                    // Obligatorio: identificador del tipo
  name: string,                        // Obligatorio: 2-100 caracteres
  email: string,                       // Obligatorio: email válido
  phone?: string,                      // Opcional: 10 dígitos
  message: string                      // Obligatorio: 10-1000 caracteres
}
```

**Validaciones:**
- `name`: Entre 2 y 100 caracteres
- `email`: Formato válido (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- `phone`: 10 dígitos numéricos (opcional)
- `message`: Entre 10 y 1000 caracteres

### Schema: Cotizador

```typescript
{
  type: "cotizador",                   // Obligatorio: identificador del tipo
  name: string,                        // Obligatorio: 2-100 caracteres
  email: string,                       // Obligatorio: email válido
  phone: string,                       // Obligatorio: 10 dígitos
  eventType: string,                   // Obligatorio: tipo de evento
  eventDate: string,                   // Obligatorio: fecha ISO (futura)
  guestCount: number,                  // Obligatorio: 1-1000
  location: string,                    // Obligatorio: min 3 caracteres
  additionalDetails?: string           // Opcional: detalles adicionales
}
```

**Validaciones:**
- `name`: Entre 2 y 100 caracteres
- `email`: Formato válido
- `phone`: 10 dígitos numéricos (obligatorio)
- `eventType`: Mínimo 2 caracteres
- `eventDate`: Fecha válida y futura
- `guestCount`: Entre 1 y 1000
- `location`: Mínimo 3 caracteres
- `additionalDetails`: Cualquier longitud (opcional)

---

## Ejemplos de Uso

### Ejemplo 1: Enviar desde Chatbot

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'chatbot',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '5512345678',
    message: 'Hola, me interesa contratar el grupo para mi boda en diciembre. ¿Tienen disponibilidad?'
  })
});

const result = await response.json();
console.log(result);
// { success: true, message: "Email enviado exitosamente", remaining: 4 }
```

### Ejemplo 2: Enviar desde Cotizador

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'cotizador',
    name: 'María González',
    email: 'maria@example.com',
    phone: '5598765432',
    eventType: 'Boda',
    eventDate: '2025-12-15',
    guestCount: 150,
    location: 'Ciudad de México, Salón Los Jardines',
    additionalDetails: 'Necesitamos música variada para todas las edades'
  })
});

const result = await response.json();
console.log(result);
// { success: true, message: "Email enviado exitosamente", remaining: 3 }
```

### Ejemplo 3: Manejo de Errores

```javascript
try {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'cotizador',
      name: 'A', // Error: muy corto
      email: 'invalid-email', // Error: formato inválido
      phone: '123', // Error: debe tener 10 dígitos
      // Faltan campos requeridos
    })
  });

  const result = await response.json();
  
  if (!result.success) {
    console.error('Errores de validación:', result.errors);
    // ["Nombre debe tener entre 2 y 100 caracteres", "Email inválido", ...]
  }
} catch (error) {
  console.error('Error de red:', error);
}
```

---

## Respuestas

### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Email enviado exitosamente",
  "remaining": 4
}
```

**Campos:**
- `success`: `true` si el email se envió correctamente
- `message`: Mensaje descriptivo del resultado
- `remaining`: Solicitudes restantes en la ventana de rate limiting

### Respuesta de Error de Validación (400)

```json
{
  "success": false,
  "error": "Errores de validación",
  "errors": [
    "Nombre debe tener entre 2 y 100 caracteres",
    "Email inválido",
    "Teléfono debe tener 10 dígitos"
  ]
}
```

### Respuesta de Rate Limit Excedido (429)

```json
{
  "success": false,
  "error": "Límite de solicitudes excedido. Intenta de nuevo en 45 minutos."
}
```

### Respuesta de Error del Servidor (500)

```json
{
  "success": false,
  "error": "Error al enviar el email. Por favor intenta más tarde."
}
```

---

## Rate Limiting

### Configuración

- **Límite**: 5 solicitudes por hora
- **Ventana**: 1 hora (rolling window)
- **Por**: Dirección IP del cliente
- **Storage**: Cloudflare KV

### Funcionamiento

1. Cada solicitud incrementa un contador por IP
2. El contador se resetea después de 1 hora
3. Al exceder el límite, se rechaza la solicitud con error 429
4. El tiempo restante se incluye en el mensaje de error

### Ejemplo de Implementación

```javascript
// El worker maneja automáticamente el rate limiting
// No requiere implementación en el cliente

// La respuesta incluye el campo 'remaining'
const response = await fetch('/api/send-email', { /* ... */ });
const result = await response.json();

console.log(`Solicitudes restantes: ${result.remaining}`);
// "Solicitudes restantes: 3"
```

---

## Seguridad

### 1. CORS Restrictivo

Solo se permiten solicitudes desde:
- `https://grupomusicalcelula.com`
- `https://www.grupolacelula.com`
- `https://grupomusicalcelula.pages.dev` (desarrollo en Cloudflare)
- `http://localhost:8788` (desarrollo local)

### 2. Sanitización de Inputs

Todos los strings se sanitizan para prevenir XSS:

```javascript
// Ejemplo de sanitización
"<script>alert('xss')</script>" 
→ "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

### 3. Validación Server-Side

- Todas las validaciones se ejecutan en el servidor
- No se confía en validaciones del cliente
- Regex estrictos para email y teléfono

### 4. Variables de Entorno Seguras

- API keys nunca expuestas en el código cliente
- Almacenadas en variables de entorno de Cloudflare
- Accesibles solo en el servidor

### 5. Headers de Seguridad

```
Access-Control-Allow-Origin: https://grupomusicalcelula.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

---

## Troubleshooting

### Problema: "Límite de solicitudes excedido"

**Causa**: Has enviado más de 5 solicitudes en la última hora.

**Solución**: Espera el tiempo indicado en el mensaje de error.

```javascript
// Respuesta del servidor
{
  "success": false,
  "error": "Límite de solicitudes excedido. Intenta de nuevo en 45 minutos."
}
```

---

### Problema: "Errores de validación"

**Causa**: Los datos enviados no cumplen con el schema.

**Solución**: Revisa el array `errors` y corrige los campos indicados.

```javascript
if (!result.success && result.errors) {
  result.errors.forEach(error => {
    console.error(`❌ ${error}`);
  });
}
```

---

### Problema: "CORS error"

**Causa**: Estás haciendo solicitudes desde un dominio no autorizado.

**Solución**: 
1. Verifica que estás en el dominio correcto
2. En desarrollo, usa `http://localhost:8788`
3. Añade tu dominio a `CONFIG.CORS.ALLOWED_ORIGINS` si es necesario

---

### Problema: "Configuración del servidor incompleta"

**Causa**: Faltan variables de entorno en Cloudflare.

**Solución**: Configura las variables de entorno requeridas:

1. Ve a Cloudflare Dashboard → Pages → tu proyecto
2. Settings → Environment variables
3. Añade:
   - `RESEND_API_KEY`
   - `CONTACT_EMAIL`

---

### Problema: Email no llega

**Posibles causas:**
1. Email en spam/correo no deseado
2. Error en la API de Resend
3. Variables de entorno incorrectas

**Solución:**
1. Revisa la carpeta de spam
2. Verifica los logs en Cloudflare
3. Confirma las variables de entorno
4. Revisa la consola del navegador para errores

---

## Testing

### Test Manual con cURL

```bash
# Test endpoint chatbot
curl -X POST https://grupomusicalcelula.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chatbot",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "5512345678",
    "message": "Este es un mensaje de prueba del chatbot"
  }'

# Test endpoint cotizador
curl -X POST https://grupomusicalcelula.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cotizador",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "5512345678",
    "eventType": "Boda",
    "eventDate": "2025-12-31",
    "guestCount": 100,
    "location": "Ciudad de México"
  }'
```

### Test con JavaScript en Consola

```javascript
// Abrir DevTools en grupolacelula.com y ejecutar:

fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'chatbot',
    name: 'Test',
    email: 'test@test.com',
    phone: '5512345678',
    message: 'Mensaje de prueba desde la consola'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Monitoreo y Logs

### En Cloudflare Dashboard

1. Ve a **Workers & Pages** → tu proyecto
2. Click en **Logs** o **Analytics**
3. Revisa:
   - Solicitudes por minuto
   - Errores
   - Latencia promedio

### Logs en Consola

El worker loggea automáticamente:

```javascript
// Envío exitoso
console.log('Email enviado exitosamente:', {
  id: 'abc123',
  type: 'chatbot',
  from: 'user@example.com',
  ip: '192.168.1.1',
  timestamp: '2025-11-18T04:50:00.000Z'
});

// Errores
console.error('Error al enviar email:', errorDetails);
```

---

## Mejores Prácticas

### Para Desarrolladores Frontend

1. **Manejo de errores robusto**
   ```javascript
   try {
     const response = await
