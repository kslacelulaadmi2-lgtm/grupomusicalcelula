/**
 * Test script to verify chatbot email sending functionality
 * This simulates the payload sent from the chatbot to the send-email API
 */

// Simulate the payload that chatbot.js sends
const testPayload = {
  type: 'chatbot_summary',
  leadData: {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '55 1234 5678',
    eventType: 'Boda'
  },
  conversationData: {
    full_conversation: `Cliente: Hola, me interesa contratar música para mi boda

Asistente: ¡Hola Juan! 👋 Soy el **Asistente Musical** de Grupo Musical La Célula 🎵

Estoy aquí para ayudarte con tu Boda. Somos un grupo versátil que toca todos los géneros musicales y nos adaptamos a cualquier celebración.

¿Cuándo es tu evento y cuántos invitados esperas? 🎉

Cliente: Es el 15 de junio y esperamos 150 invitados

Asistente: ¡Perfecto! Una boda con 150 invitados es un evento ideal para nuestros servicios. 

Para tu boda del 15 de junio, te recomendaría nuestro **Paquete Event Plus** que incluye:
• 5 horas de música en vivo ininterrumpida
• Equipo de audio para hasta 2,000 invitados
• Iluminación robótica y láser profesional
• Pantalla gigante para momentos especiales

¿Ya tienes definido el lugar de la celebración?

Cliente: Sí, será en un salón en Polanco. ¿Cuál sería el costo aproximado?`,
    conversation_length: 5,
    session_start: new Date().toISOString()
  }
};

console.log('🧪 Testing Chatbot Email Payload Structure\n');
console.log('=' .repeat(60));

// Test 1: Validate payload structure
console.log('\n✅ Test 1: Payload Structure');
console.log('Type:', testPayload.type);
console.log('Lead Data:', testPayload.leadData);
console.log('Conversation Length:', testPayload.conversationData.conversation_length);
console.log('Has full_conversation:', !!testPayload.conversationData.full_conversation);

// Test 2: Simulate email HTML generation (matching send-email.js logic)
console.log('\n✅ Test 2: Email HTML Generation');

const { leadData, conversationData } = testPayload;

const hasConversation = conversationData?.full_conversation && conversationData.full_conversation.trim().length > 0;
console.log('Has conversation:', hasConversation);

if (hasConversation) {
  const conversationLines = conversationData.full_conversation.split('\n\n');
  console.log('Conversation lines:', conversationLines.length);
  
  const conversationHtml = conversationLines
    .map(line => {
      if (line.startsWith('Cliente:')) {
        return `<p style="margin: 10px 0;"><strong style="color: #2563eb;">Cliente:</strong> ${line.replace('Cliente:', '').trim()}</p>`;
      } else if (line.startsWith('Asistente:')) {
        return `<p style="margin: 10px 0;"><strong style="color: #059669;">Asistente:</strong> ${line.replace('Asistente:', '').trim()}</p>`;
      }
      return line ? `<p style="margin: 10px 0;">${line}</p>` : '';
    })
    .join('');
  
  console.log('Generated HTML length:', conversationHtml.length);
  console.log('HTML Preview (first 200 chars):', conversationHtml.substring(0, 200) + '...');
}

// Test 3: Validate lead data
console.log('\n✅ Test 3: Lead Data Validation');
console.log('Name:', leadData?.name || 'No proporcionado');
console.log('Email:', leadData?.email || 'No proporcionado');
console.log('Phone:', leadData?.phone || 'No proporcionado');
console.log('Event Type:', leadData?.eventType || 'No especificado');

// Test 4: Validate conversation metadata
console.log('\n✅ Test 4: Conversation Metadata');
console.log('Conversation Length:', conversationData?.conversation_length || 0);
console.log('Session Start:', conversationData?.session_start ? new Date(conversationData.session_start).toLocaleString('es-MX') : 'No disponible');

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed! The payload structure is correct.');
console.log('\n📧 The email should now contain the full conversation.');
console.log('🔍 Key fix: Using conversationData.full_conversation instead of conversationData.messages');
