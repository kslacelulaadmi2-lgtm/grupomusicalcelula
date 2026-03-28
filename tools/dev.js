#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is parent of tools directory
const PROJECT_ROOT = resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/assets', express.static(join(PROJECT_ROOT, 'assets')));
app.use('/css', express.static(join(PROJECT_ROOT, 'css')));
app.use('/js', express.static(join(PROJECT_ROOT, 'js')));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/index.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/blog.html'));
});

app.get('/blog.html', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/blog.html'));
});

app.get('/cotizador', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/cotizador.html'));
});

app.get('/cotizador.html', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'public/html/cotizador.html'));
});

app.get('/post/:id', (req, res) => {
  const postPath = join(PROJECT_ROOT, 'public/post', `post-${req.params.id}.html`);
  if (existsSync(postPath)) {
    res.sendFile(postPath);
  } else {
    res.status(404).send('Post not found');
  }
});

// API proxy for development
app.post('/api/send-email', async (req, res) => {
  console.log('📧 Email request received:', req.body);
  res.json({ success: true, message: 'Development mode - email not sent' });
});

app.post('/api/chatbot', async (req, res) => {
  console.log('🤖 Chatbot request received');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    return res.status(500).json({ 
      error: 'API Key no configurada. Configura GEMINI_API_KEY en variables de entorno.' 
    });
  }

  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid history format' });
    }

    // Prepare payload for Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    
    const contents = history.map(item => ({
      role: item.role,
      parts: Array.isArray(item.parts) ? item.parts : [{ text: item.parts[0]?.text || '' }]
    }));

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 800,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                       'Lo siento, no pude generar una respuesta.';

    res.json({
      candidates: [{
        content: {
          parts: [{ text: botResponse }]
        }
      }]
    });

  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ 
      error: `Error al procesar solicitud: ${error.message}` 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Development server running!`);
  console.log(`\n📍 Local: http://localhost:${PORT}`);
  console.log(`\n💡 Press Ctrl+C to stop\n`);
});
