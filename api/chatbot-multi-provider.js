import OpenAI from 'openai';

// Configuración de proveedores
const providers = {
  openrouter: {
    client: new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY
    }),
    models: [
      'meta-llama/llama-3.2-3b-instruct:free',
      'qwen/qwen-2-7b-instruct:free',
      'microsoft/phi-3-mini-4k-instruct:free'
    ]
  },
  groq: {
    client: new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY
    }),
    models: [
      'llama-3.1-8b-instant',    // Rápido y eficiente
      'llama-3.3-70b-versatile', // Más inteligente
      'gemma2-9b-it'             // Bueno en español
    ]
  }
};

// Configuración por defecto
const defaultConfig = {
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.9
};

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Función para convertir formato Gemini a OpenAI
function convertGeminiToOpenAI(history) {
  return history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : msg.role,
    content: msg.parts?.[0]?.text || msg.content || ''
  }));
}

// Función para convertir respuesta OpenAI a formato Gemini
function convertOpenAIToGemini(response) {
  return {
    candidates: [{
      content: {
        parts: [{ text: response.choices[0].message.content }],
        role: 'model'
      }
    }]
  };
}

// Función para intentar con un proveedor
async function tryProvider(providerName, modelIndex, messages) {
  const provider = providers[providerName];
  const model = provider.models[modelIndex];

  console.log(`🔄 Intentando ${providerName} con modelo ${model}`);

  try {
    const completion = await provider.client.chat.completions.create({
      model,
      messages,
      ...defaultConfig,
      // Timeout específico por proveedor
      timeout: providerName === 'openrouter' ? 15000 : 10000
    });

    console.log(`✅ Éxito con ${providerName}:${model}`);
    return convertOpenAIToGemini(completion);

  } catch (error) {
    console.error(`❌ Error con ${providerName}:${model}:`, {
      status: error.status,
      message: error.message,
      code: error.code
    });

    // Re-throw para el siguiente intento
    throw error;
  }
}

// Función principal con fallback en cascada
async function getChatResponse(messages) {
  const strategies = [
    // Estrategia 1: OpenRouter modelos gratuitos
    { provider: 'openrouter', modelIndex: 0 },
    { provider: 'openrouter', modelIndex: 1 },
    { provider: 'openrouter', modelIndex: 2 },
    
    // Estrategia 2: Fallback a Groq
    { provider: 'groq', modelIndex: 0 },
    { provider: 'groq', modelIndex: 1 },
    { provider: 'groq', modelIndex: 2 }
  ];

  let lastError = null;

  for (const { provider, modelIndex } of strategies) {
    // Verificar si el proveedor tiene API key
    const providerConfig = providers[provider];
    if (!providerConfig.client.apiKey) {
      console.log(`⚠️ ${provider} no tiene API key, saltando...`);
      continue;
    }

    try {
      return await tryProvider(provider, modelIndex, messages);
    } catch (error) {
      lastError = error;
      
      // Si es rate limit (429), continuar inmediatamente
      if (error.status === 429) {
        console.log(`⏭️ Rate limit en ${provider}, probando siguiente...`);
        continue;
      }
      
      // Si es error de autenticación (401/403), saltar proveedor
      if (error.status === 401 || error.status === 403) {
        console.log(`🔑 Error de auth en ${provider}, saltando proveedor...`);
        // Saltar todos los modelos de este proveedor
        const currentProvider = provider;
        while (strategies.length > 0 && strategies[0].provider === currentProvider) {
          strategies.shift();
        }
        continue;
      }
      
      // Para otros errores, continuar con siguiente modelo
      console.log(`🔄 Error en ${provider}, probando siguiente modelo...`);
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('💥 Todos los proveedores fallaron');
  throw lastError || new Error('Todos los proveedores de IA no están disponibles');
}

export default async function handler(req, res) {
  // Configurar headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Verificar que al menos un proveedor tenga API key
    const hasValidProvider = Object.entries(providers).some(([name, config]) => {
      const hasKey = !!config.client.apiKey;
      console.log(`🔑 ${name}: ${hasKey ? 'API key encontrada' : 'Sin API key'}`);
      return hasKey;
    });

    if (!hasValidProvider) {
      return res.status(500).json({ 
        error: 'No AI providers configured',
        message: 'Por favor configura OPENROUTER_API_KEY o GROQ_API_KEY' 
      });
    }

    // Convertir formato y obtener respuesta
    const messages = convertGeminiToOpenAI(history);
    const response = await getChatResponse(messages);

    return res.status(200).json(response);

  } catch (error) {
    console.error('💥 Error final del chatbot:', error);
    
    // Respuestas específicas según el tipo de error
    if (error.status === 429) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Todos los servicios de IA están temporalmente saturados. Intenta en unos minutos.',
        retryAfter: 60
      });
    }
    
    if (error.status === 401 || error.status === 403) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Error de configuración en las API keys. Contacta al administrador.'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor. Intenta de nuevo.'
    });
  }
}