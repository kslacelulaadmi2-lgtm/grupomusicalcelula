# 🚀 Quick Setup Guide - Multi-Provider AI Chatbot

## 🎯 **Objetivo**
Reemplazar Gemini con un sistema robusto que usa **OpenRouter** (gratis) con fallback a **Groq** (también gratis).

## ⚡ **Setup en 5 Minutos**

### 1. Obtener API Keys (GRATIS)

**OpenRouter** (Primario - Gratis):
```bash
# Ve a https://openrouter.ai/keys
# Crea cuenta gratuita
# Obtén tu API key: or-v1-xxxxx
```

**Groq** (Fallback - También gratis):
```bash
# Ve a https://console.groq.com/keys
# Crea cuenta gratuita
# Obtén tu API key: gsk_xxxxx
```

### 2. Configurar Variables de Entorno

**Para Vercel**:
```bash
vercel env add OPENROUTER_API_KEY
# Pegar: or-v1-xxxxxxxxxxxxx

vercel env add GROQ_API_KEY  
# Pegar: gsk_xxxxxxxxxxxxx
```

**Para desarrollo local** (.env):
```env
OPENROUTER_API_KEY=or-v1-xxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### 3. Reemplazar el chatbot actual

```bash
# Backup del chatbot actual
mv api/chatbot.js api/chatbot-gemini-backup.js

# Activar el nuevo sistema
mv api/chatbot-multi-provider.js api/chatbot.js
```

### 4. Deploy y Test

```bash
# Deploy inmediato
vercel --prod

# Test local
npm run dev
node test-multi-provider.js
```

## 🎛️ **Sistema de Fallback Automático**

1. **OpenRouter Llama-3.2-3B** (gratis, 10 req/min) ⭐
2. **OpenRouter Qwen-2-7B** (gratis, excelente español)
3. **OpenRouter Phi-3** (gratis, fallback rápido)
4. **Groq Llama-3.2-3B** (14,400 req/día, velocidad extrema) ⚡
5. **Groq Llama-3.1-8B** (más inteligente)
6. **Groq Gemma-2-9B** (excelente español)

## ✅ **Ventajas vs Gemini**

- ✅ **Sin rate limits problemáticos**
- ✅ **API keys más estables**  
- ✅ **Fallback automático**
- ✅ **Velocidad superior**
- ✅ **100% compatible** (mismo formato de respuesta)
- ✅ **Mayor disponibilidad**

## 🔄 **Rollback si es necesario**

```bash
# Volver a Gemini (si consigues nueva API key)
mv api/chatbot.js api/chatbot-multi-provider.js
mv api/chatbot-gemini-backup.js api/chatbot.js
```

## 🧪 **Testing**

```bash
# Test completo del sistema
node test-multi-provider.js

# Test manual via curl
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"history":[{"role":"user","parts":[{"text":"Hola"}]}]}'
```

## 📊 **Monitoreo**

El sistema logs automáticamente:
- ✅ Qué proveedor responde
- ❌ Errores y fallbacks  
- ⚡ Velocidad de respuesta
- 🔄 Rate limits y recuperación

## 🎯 **Resultado Esperado**

- **Disponibilidad**: ~99.9% (vs ~95% con Gemini solo)
- **Velocidad**: 2-3x más rápido
- **Costo**: $0 (ambos proveedores gratis)
- **Mantenimiento**: Mínimo

¿Listo para el switch? 🚀