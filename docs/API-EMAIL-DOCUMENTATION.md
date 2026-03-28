# Documentación API de Email - Grupo Musical La Célula

## Endpoint Principal

**URL:** `/api/send-email`  
**Método:** `POST`  
**Content-Type:** `application/json`

## Variables de Entorno Requeridas

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=email@destino.com
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxx (solo para chatbot)
```

## Tipos de Email Soportados

### 1. Chatbot Lead Capture (`chatbot_lead`)

Captura inicial del lead cuando el usuario completa el formulario del chatbot.

**Payload:**
```json
{
  "type": "chatbot_lead",
  "leadData": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "5535412631",
    "eventType": "Boda"
  }
}
```

**Usado en:** `js/chatbot.js` → método `handleFormSubmission()`

---

### 2. Chatbot Summary (`chatbot_summary`)

Envía la conversación completa del chatbot con el cliente.

**Payload:**
```json
{
  "type": "chatbot_summary",
  "leadData": {
    "name": "María González",
    "email": "maria@example.com",
    "phone": "5512345678",
    "eventType": "XV Años"
  },
  "conversationData": {
    "full_conversation": "Cliente: Hola, necesito música para mis XV años\n\nAsistente: ¡Hola María! Cuéntame más sobre tu celebración\n\nCliente: Será en diciembre, unos 200 invitados\n\nAsistente: Perfecto, tenemos el paquete ideal para ti",
    "conversation_length": 4,
    "session_start": "2025-11-20T08:00:00.000Z"
  }
}
```

**Características:**
- Incluye la conversación completa en formato texto
- Separa mensajes del Cliente y del Asistente
- Muestra paquete recomendado basado en la conversación
- Enlaces directos a WhatsApp del cliente

**Usado en:** `js/chatbot.js` → método `sendConversationSummary()`

---

### 3. Formulario Cotizador (`form_cotizador`)

Procesa el formulario de cotización del sitio web.

**Payload:**
```json
{
  "type": "form_cotizador",
  "formData": {
    "nombre": "Carlos Ramírez",
    "email": "carlos@example.com",
    "telefono": "5598765432",
    "tipoEvento": "Evento Corporativo",
    "fechaEvento": "2025-12-15",
    "lugar": "Ciudad de México (CDMX)",
    "numeroInvitados": "101-200",
    "paquete": "Por definir",
    "mensaje": "Necesito cotización para evento de fin de año"
  }
}
```

**Campos del formulario HTML:**
- `nombre` - Nombre del cliente (text)
- `email` - Email del cliente (email)
- `telefono` - Teléfono 10 dígitos (tel)
- `evento` - Tipo de evento (select)
- `fecha` - Fecha del evento (date)
- `ubicacion` - Ciudad/ubicación (select)
- `invitados` - Rango de invitados (select): "50-100", "101-200", "201-500", "500+"
- `comentarios` - Comentarios adicionales (textarea, opcional)

**Usado en:** `js/form-handler.js` → maneja formulario en `cotizador.html`

---

## Respuestas de la API

### Éxito (200)
```json
{
  "success": true,
  "message": "Email enviado",
  "emailId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error - Tipo No Reconocido (400)
```json
{
  "success": false,
  "error": "Tipo no reconocido"
}
```

### Error - Configuración (500)
```json
{
  "success": false,
  "error": "Configuración de email no disponible"
}
```

### Error - Rate Limit (429)
```json
{
  "success": false,
  "error": "Límite de emails alcanzado. Por favor intenta más tarde."
}
```

## Rate Limiting

- **Límite:** 5 emails por hora por IP
- **Ventana:** 60 minutos
- **Método:** Cloudflare KV (si está configurado)

## Estructura de Archivos

```
celula-site/
├── cotizador.html              # Formulario de cotización
├── js/
│   ├── chatbot.js             # Lógica del chatbot
│   ├── chatbot.min.js         # Chatbot minificado
│   ├── form-handler.js        # Manejo del formulario
│   └── form-handler.min.js    # Form handler minificado
└── functions/
    └── api/
        └── send-email.js      # API endpoint unificado
```

## Flujo de Datos

### Chatbot
```
Usuario completa formulario inicial
    ↓
chatbot.js → handleFormSubmission()
    ↓
POST /api/send-email (type: chatbot_lead)
    ↓
Usuario chatea con el asistente
    ↓
chatbot.js → sendConversationSummary()
    ↓
POST /api/send-email (type: chatbot_summary)
    ↓
Email con conversación completa ✅
```

### Formulario Cotizador
```
Usuario completa formulario
    ↓
form-handler.js → submit event
    ↓
POST /api/send-email (type: form_cotizador)
    ↓
Email con cotización ✅
    ↓
Redirección a WhatsApp
```

## Testing

### Pruebas Locales
```bash
# 1. Instalar dependencias de functions
cd functions && npm install && cd ..

# 2. Ejecutar servidor de desarrollo
npm run dev

# 3. En otra terminal, ejecutar tests
./test-email-api.sh
```

### Pruebas en Producción
```bash
# Editar test-email-api.sh:
# BASE_URL="https://grupomusicalcelula.com"

./test-email-api.sh
```

### Prueba Manual con curl

```bash
# Test chatbot_summary
curl -X POST http://localhost:8788/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chatbot_summary",
    "leadData": {
      "name": "Test User",
      "email": "test@test.com",
      "phone": "5512345678",
      "eventType": "Boda"
    },
    "conversationData": {
      "full_conversation": "Cliente: Hola\n\nAsistente: Hola, ¿en qué puedo ayudarte?",
      "conversation_length": 2,
      "session_start": "2025-11-20T08:00:00.000Z"
    }
  }'
```

## Troubleshooting

### Error: "Tipo no reconocido"
**Causa:** El campo `type` no coincide con los valores esperados  
**Solución:** Verificar que `type` sea exactamente: `chatbot_lead`, `chatbot_summary`, o `form_cotizador`

### Error: "Configuración de email no disponible"
**Causa:** Falta la variable `RESEND_API_KEY`  
**Solución:** Configurar en Cloudflare Pages → Settings → Environment Variables

### Formulario muestra "no disponible"
**Causa:** Las Cloudflare Functions solo funcionan con wrangler o en producción  
**Solución:** Deploy a Cloudflare Pages con `npm run deploy`

### Email no llega
**Causa:** Email destino incorrecto o Resend API key inválida  
**Solución:** 
1. Verificar `CONTACT_EMAIL` en variables de entorno
2. Verificar que `RESEND_API_KEY` sea válida
3. Revisar logs en Cloudflare Pages Dashboard

## Changelog

### v2.0 (2025-11-20)
- ✅ Eliminada dependencia de `ResendEmailHandler`
- ✅ Envío directo a `/api/send-email` desde todos los formularios
- ✅ Conversación completa del chatbot en formato texto
- ✅ API unificada con 3 tipos de emails
- ✅ Campos select restaurados en formulario

### v1.0 (Anterior)
- Usaba `ResendEmailHandler` como capa intermedia
- Conversación del chatbot solo enviaba extractos

## Mantenimiento

### Agregar Nuevo Tipo de Email

1. Añadir caso en `functions/api/send-email.js`:
```javascript
else if (type === "nuevo_tipo") {
  emailHtml = createNuevoTipoEmail(data);
  subject = `Asunto del nuevo tipo`;
}
```

2. Crear función de template:
```javascript
function createNuevoTipoEmail(data) {
  return `<!DOCTYPE html>...`;
}
```

3. Actualizar desde el cliente:
```javascript
fetch('/api/send-email', {
  method: 'POST',
  body: JSON.stringify({
    type: 'nuevo_tipo',
    data: { /* campos necesarios */ }
  })
});
```

## Seguridad

- ✅ CORS configurado
- ✅ Rate limiting por IP
- ✅ Validación de campos en cliente
- ✅ Sanitización de datos
- ✅ HTTPS only
- ✅ API keys en variables de entorno (no en código)
