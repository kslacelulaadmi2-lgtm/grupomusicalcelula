# Solución al Problema del Chatbot con Wrangler Pages Dev

## Problema Identificado

Cuando se servía el sitio con `wrangler pages dev`, el chatbot no se abría al hacer clic en el ícono. El problema era causado por un error de compilación en las funciones de Cloudflare debido a la dependencia `prettier` que venía incluida con el paquete `resend`.

### Error Original
```
✘ [ERROR] The constant "breakParent" must be initialized
    functions/node_modules/prettier/doc.d.ts:116:8:
```

## Solución Aplicada

### 1. Eliminar la dependencia problemática
Se eliminó el paquete `prettier` de `node_modules` ya que no es necesario para las funciones en producción:

```bash
cd functions
rm -rf node_modules/prettier
```

### 2. Crear archivo `.wranglerignore`
Se creó el archivo `functions/.wranglerignore` para evitar que Wrangler procese archivos innecesarios:

```
node_modules/prettier
node_modules/@types
*.d.ts
*.test.js
*.spec.js
```

### 3. Actualizar `wrangler.toml`
Se ajustó la fecha de compatibilidad para evitar advertencias:

```toml
compatibility_date = "2024-11-09"
```

## Verificación

El chatbot ahora funciona correctamente:

1. **Inicialización**: Los logs muestran que el chatbot se inicializa correctamente
   ```
   ✅ Botón chatbot-toggle encontrado, agregando listener
   ✅ Chatbot La Célula inicializado correctamente con persistencia entre páginas
   ```

2. **Interacción**: Al hacer clic en el ícono del chatbot, se abre el formulario de captura de datos

3. **Funcionalidad completa**: El chatbot mantiene todas sus características:
   - Persistencia entre páginas usando `sessionStorage`
   - Formulario de captura de leads
   - Integración con la API de Gemini
   - Envío de resúmenes por email

## Comandos para Desarrollo

### Iniciar servidor de desarrollo con Wrangler
```bash
wrangler pages dev . --port 8788
```

### Iniciar servidor HTTP simple (para pruebas sin funciones)
```bash
python3 -m http.server 8080
```

## Notas Importantes

- El chatbot funciona correctamente tanto con servidor HTTP simple como con Wrangler Pages Dev
- La eliminación de `prettier` no afecta la funcionalidad del sitio
- Si se reinstalan las dependencias con `npm install`, puede ser necesario eliminar `prettier` nuevamente
- El archivo `.wranglerignore` ayuda a prevenir problemas similares en el futuro

## Archivos Modificados

1. `/functions/.wranglerignore` - Creado
2. `/wrangler.toml` - Actualizado (compatibility_date)
3. `/functions/node_modules/prettier` - Eliminado

## Fecha de Solución
19 de noviembre de 2025
