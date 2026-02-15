/**
 * Chatbot para Grupo Musical Versátil La Célula
 * Flujo automatizado de preguntas con envío a WhatsApp y API de leads
 */

class CelulaChatbotManager {
    constructor() {
        console.log('🔧 Iniciando chatbot estructurado...');

        // Datos del lead
        this.leadData = {
            name: '',
            phone: '',
            eventType: '',
            eventDate: '',
            eventLocation: '',
            guestCount: ''
        };

        // Estado del flujo
        this.currentStep = 0;
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('chat-close');
        this.chatWindowContainer = document.getElementById('chat-window-container');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.appendMessage('¡Hola! Soy tu asistente para cotizar tu evento musical. ¿Cómo te llamas?', 'bot');
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        this.closeBtn.addEventListener('click', () => {
            this.chatWindowContainer.classList.remove('active');
        });
    }

    handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.appendMessage(message, 'user');
        this.userInput.value = '';

        // Procesar respuesta según el paso actual
        switch (this.currentStep) {
            case 0: // Nombre
                this.leadData.name = message;
                this.appendMessage('Perfecto, ¿cuál es tu número de teléfono? (10 dígitos)', 'bot');
                break;
            case 1: // Teléfono
                if (!/^\d{10}$/.test(message)) {
                    this.appendMessage('Por favor, ingresa un número válido de 10 dígitos.', 'bot');
                    return;
                }
                this.leadData.phone = message;
                this.showEventTypeOptions();
                break;
            case 2: // Tipo de evento
                if (!['boda', 'corporativo', 'xv años', 'graduación', 'otro'].includes(message.toLowerCase())) {
                    this.appendMessage('Opción no válida. Elige una de las opciones.', 'bot');
                    return;
                }
                this.leadData.eventType = message;
                this.appendMessage('¿Cuál es la fecha de tu evento? (DD/MM/AAAA)', 'bot');
                break;
            case 3: // Fecha
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(message)) {
                    this.appendMessage('Formato incorrecto. Usa DD/MM/AAAA.', 'bot');
                    return;
                }
                this.leadData.eventDate = message;
                this.showLocationOptions();
                break;
            case 4: // Ubicación
                if (!['cdmx', 'edomex', 'otro'].includes(message.toLowerCase())) {
                    this.appendMessage('Opción no válida. Elige una de las opciones.', 'bot');
                    return;
                }
                this.leadData.eventLocation = message;
                this.appendMessage('¿Cuántos invitados aproximados? (50-500)', 'bot');
                break;
            case 5: // Invitados
                const guests = parseInt(message);
                if (isNaN(guests) || guests < 50 || guests > 500) {
                    this.appendMessage('Número no válido. Ingresa un valor entre 50 y 500.', 'bot');
                    return;
                }
                this.leadData.guestCount = guests;
                this.sendToWhatsApp();
                break;
        }
        this.currentStep++;
    }

    showEventTypeOptions() {
        const options = ['Boda', 'Corporativo', 'XV años', 'Graduación', 'Otro'];
        let message = '¿Qué tipo de evento es?\n\n';
        options.forEach(opt => {
            message += `- ${opt}\n`;
        });
        this.appendMessage(message, 'bot');
    }

    showLocationOptions() {
        const options = ['CDMX', 'EdoMex', 'Otro'];
        let message = '¿Dónde será el evento?\n\n';
        options.forEach(opt => {
            message += `- ${opt}\n`;
        });
        this.appendMessage(message, 'bot');
    }

    sendToWhatsApp() {
        const whatsappMessage = `
*Nuevo lead de La Célula*\n\n
*Nombre:* ${this.leadData.name}\n
*Teléfono:* ${this.leadData.phone}\n
*Evento:* ${this.leadData.eventType}\n
*Fecha:* ${this.leadData.eventDate}\n
*Ubicación:* ${this.leadData.eventLocation}\n
*Invitados:* ${this.leadData.guestCount}\n
---\n*Enviado desde grupomusicalcelula.com*`;

        const whatsappURL = `https://wa.me/5215535412631?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappURL, '_blank');

        // Enviar a API de leads (backup)
        this.sendToLeadsAPI();

        this.appendMessage('¡Listo! Te hemos enviado un mensaje por WhatsApp. Próximamente nos pondremos en contacto contigo.', 'bot');
    }

    async sendToLeadsAPI() {
        try {
            const response = await fetch('https://api.grupomusicalcelula.com/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.leadData)
            });
            if (!response.ok) throw new Error('API error');
            console.log('Lead enviado a API');
        } catch (error) {
            console.error('Error al enviar a API:', error);
        }
    }

    appendMessage(text, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = text.replace(/\n/g, '<br>');
        this.chatWindow.appendChild(messageDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }
}

    // Determina si un mensaje es visible para el usuario
    isVisibleMessage(message) {
        return true; // Todos los mensajes son visibles en el nuevo flujo
    }

    // Filtra los mensajes que son visibles para el usuario
    getVisibleMessages() {
        return this.chatHistory;
    }

    repopulateChat() {
    // Limpiar la ventana de chat
        this.chatWindow.innerHTML = '';

        // Mostrar todo el historial
        this.chatHistory.forEach((item) => {
            if (item.role === 'user') {
                this.appendMessage(item.parts[0].text, 'user');
            } else if (item.role === 'model') {
                this.appendMessage(item.parts[0].text, 'bot');
            }
        });
    }

    setupEventListeners() {
        console.log('🎯 Configurando event listeners...');

        // Evento para el botón flotante del chatbot (abrir chatbot)
        const chatbotToggle = document.getElementById('chatbot-toggle');
        if (chatbotToggle) {
            console.log('✅ Botón chatbot-toggle encontrado, agregando listener');
            chatbotToggle.addEventListener('click', () => {
                console.log('🖱️ Click en chatbot-toggle detectado');
                console.log('Estado actual:', {
                    chatHistoryLength: this.chatHistory?.length || 0,
                    leadDataKeys: Object.keys(this.leadData || {}).length
                });

                // event: chatbot_open
                window.__gaChatTrack('chatbot_open', { step: 'open', open_method: 'click' });

                if (this.chatHistory && this.chatHistory.length > 3) {
                    console.log('📝 Abriendo ventana de chat (historial > 3)');
                    this.leadForm.classList.remove('active');
                    this.chatWindowContainer.classList.add('active');
                    this.chatInputArea.style.display = 'flex';
                } else if (this.leadData && Object.keys(this.leadData).length > 0) {
                    console.log('📋 Abriendo formulario con datos pre-llenados');
                    this.fillLeadForm();
                    this.leadForm.classList.add('active');
                } else {
                    console.log('📋 Abriendo formulario vacío');
                    this.leadForm.classList.add('active');
                }
            });
        } else {
            console.error('❌ No se encontró el botón chatbot-toggle');
        }

        // Evento para cerrar el formulario de lead
        document
            .getElementById('lead-form-close')
            ?.addEventListener('click', () => {
                this.leadForm.classList.remove('active');
                this.saveState();
            });

        // Evento para cerrar la ventana de chat
        document.getElementById('chat-close')?.addEventListener('click', () => {
            this.chatWindowContainer.classList.remove('active');
            this.saveState();
        });

        // Evento para restablecer completamente el chat (borrar historial)
        const resetChat = document.createElement('button');
        resetChat.id = 'reset-chat';
        resetChat.className = 'reset-chat';
        resetChat.setAttribute('aria-label', 'Borrar conversación');
        resetChat.innerHTML = '🗑️';
        resetChat.title = 'Borrar esta conversación y comenzar de nuevo';
        resetChat.style.cssText =
      'position: absolute; right: 40px; top: 15px; background: transparent; border: none; color: white; cursor: pointer; font-size: 16px;';

        // Añadir el botón al encabezado del chat
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.appendChild(resetChat);
        }

        // Evento para el botón de restablecer chat
        resetChat.addEventListener('click', () => {
            if (
                confirm(
                    '¿Estás seguro de borrar toda la conversación y comenzar de nuevo?'
                )
            ) {
                this.resetState();
                this.chatWindowContainer.classList.remove('active');
                this.chatWindow.innerHTML = '';
                document.getElementById('chatbot-lead-form').reset();
                this.leadForm.classList.add('active');
            }
        });

        this.closeBtn?.addEventListener('click', () => {
            parent.postMessage('close-chatbot', '*');
            this.saveState();
        });

        this.sendBtn?.addEventListener('click', () => this.handleUserInput());

        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        this.userInput?.addEventListener('input', this.autoResize.bind(this));

        document
            .getElementById('chatbot-lead-form')
            ?.addEventListener('submit', (e) => {
                e.preventDefault();
                window.__gaChatTrack('chatbot_request_contact', { step: 'request_contact', requested_fields: 'name,email,phone,eventType' });
                this.handleFormSubmission();
            });

        // Agregar detección de eventos de cierre de página para guardar estado
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Guardar periódicamente el estado mientras se usa el chat
        setInterval(() => {
            if (this.chatHistory.length > 0) {
                this.saveState();
            }
        }, 30000); // Guardar cada 30 segundos
    }

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async handleFormSubmission() {
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const phoneInput = document.getElementById('phone-input');
        const eventTypeInput = document.getElementById('event-type-input');
        const eventLocationInput = document.getElementById('event-location-input');
        const guestCountInput = document.getElementById('guest-count-input');

        this.leadData.name = nameInput.value.trim();
        this.leadData.email = emailInput.value.trim();
        this.leadData.phone = phoneInput.value.trim();
        this.leadData.eventType = eventTypeInput.value.trim();
        this.leadData.eventLocation = eventLocationInput.value.trim();
        this.leadData.guestCount = guestCountInput.value.trim();

        if (this.leadData.name && this.leadData.email && this.leadData.phone) {
            // GA: collected contact
            window.__gaChatTrack('chatbot_collect_contact', {
                step: 'collect',
                collected_fields_count: ['name','email','phone','eventType','eventLocation','guestCount'].filter(k=>this.leadData[k] && this.leadData[k].length).length,
                contact_method: 'chatbot',
                lead_type: this.leadData.eventType || undefined
            });

            // Enviar lead directamente a la API
            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'chatbot_lead',
                        leadData: this.leadData
                    })
                });

                const result = await response.json();
                if (result.success) {
                    console.log('✅ Lead capturado enviado:', result.emailId);
                    // Conversion
                    window.__gaChatTrack('generate_lead', {
                        step: 'success',
                        lead_type: this.leadData.eventType || undefined,
                        value: undefined,
                        currency: 'MXN',
                        contact_method: 'chatbot',
                        conversation_length: (this.getVisibleMessages() || []).length,
                        resolution: 'automated'
                    });
                } else {
                    console.warn('⚠️ No se pudo enviar el lead:', result.error);
                    window.__gaChatTrack('chatbot_submit_error', { step: 'error', error_type: 'server', error_message: String(result.error || 'unknown') });
                }
            } catch (error) {
                console.error('❌ Error enviando lead:', error);
                window.__gaChatTrack('chatbot_submit_error', { step: 'error', error_type: 'exception', error_message: String(error?.message || error) });
            }

            this.leadForm.classList.remove('active');
            this.chatWindowContainer.classList.add('active');
            this.chatInputArea.style.display = 'flex';

            await this.startChat();
            this.saveState();
        }
    }

    async startChat() {
        window.__gaChatTrack('chatbot_start', { step: 'start', first_intent: this.leadData?.eventType || undefined });

        // Verificar si ya existe un saludo del bot
        const hasGreeting = this.chatHistory.some(
            (item) =>
                item.role === 'model' &&
                item.parts[0].text.includes('¡Hola')
        );

        if (!hasGreeting) {
            const greeting = `¡Hola ${this.leadData.name}! 👋 Gracias por elegir a La Célula para tu ${this.leadData.eventType}.

Me alegra saber que será en **${this.leadData.eventLocation}** para **${this.leadData.guestCount}** invitados. ¡Será un evento espectacular! 🎵

¿Te gustaría recibir una cotización personalizada por WhatsApp ahora mismo?`;

            this.chatHistory.push({
                role: 'model',
                parts: [{ text: greeting }]
            });

            this.appendMessage(greeting, 'bot');
            this.saveState();
        }
    }

    async getBotResponse(message) {
        this.chatHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Contar cuántos mensajes ha enviado el modelo para determinar el paso del flujo
        const botMessagesCount = this.chatHistory.filter(m => m.role === 'model').length;
        let response = '';

        if (botMessagesCount === 1) {
            response = `¡Excelente! Somos un grupo musical versátil con más de 10 años de experiencia. Tocamos todos los géneros (cumbia, rock, pop, salsa y más) y nos adaptamos a tus necesidades para que la pista nunca esté vacía. 🎸🎉

¿Quieres que te enviemos nuestros paquetes actuales o prefieres hablar directamente con un asesor?`;
        } else {
            const waMessage = `Hola, vengo del sitio web. Mi evento es una ${this.leadData.eventType} en ${this.leadData.eventLocation} para ${this.leadData.guestCount} personas. Me gustaría una cotización.`;
            const waLink = `https://wa.me/525535412631?text=${encodeURIComponent(waMessage)}`;

            response = `¡Entendido! Para darte la mejor atención y el presupuesto exacto, un asesor te atenderá de inmediato por WhatsApp.

Haz clic aquí para iniciar la conversación: [**Hablar por WhatsApp**](${waLink}) 📱

¡Estamos listos para hacer de tu evento algo inolvidable!`;
        }

        this.chatHistory.push({
            role: 'model',
            parts: [{ text: response }]
        });

        return response;
    }

    appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(
            'message',
            sender === 'user' ? 'user-message' : 'bot-message'
        );

        if (sender === 'bot') {
            // Procesar markdown básico y emojis para mensajes del bot
            const processedMessage = this.processMarkdown(message);
            messageElement.innerHTML = processedMessage;
        } else {
            // Para mensajes del usuario, usar texto plano
            messageElement.textContent = message;
        }

        this.chatWindow.appendChild(messageElement);
        this.scrollToBottom();
    }

    processMarkdown(text) {
        // Convertir saltos de línea dobles a párrafos y simples a <br>
        let processed = text.replace(/\n\n/g, '</p><p>');
        processed = '<p>' + processed + '</p>';
        processed = processed.replace(/\n/g, '<br>');

        // Limpiar párrafos vacíos
        processed = processed.replace(/<p><\/p>/g, '');
        processed = processed.replace(/<p><br><\/p>/g, '');

        // Negritas: **texto**
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Cursivas: *texto*
        processed = processed.replace(/\*([^*<>]+?)\*/g, '<em>$1</em>');

        // Procesar enlaces Markdown [texto](url)
        // Lo hacemos antes que las URLs sueltas y números de teléfono para evitar colisiones
        processed = processed.replace(
            /\[(.*?)\]\((https?:\/\/[^\s<>]+)\)/g,
            '<a href="$2" target="_blank" style="color: #3D9BE9; text-decoration: underline; font-weight: bold;">$1</a>'
        );

        // Convertir URLs sueltas a enlaces clickeables (que no estén ya dentro de un atributo href)
        processed = processed.replace(
            /(?<!href=")(https?:\/\/[^\s<>"]+)/g,
            '<a href="$1" target="_blank" style="color: #3D9BE9; text-decoration: underline;">$1</a>'
        );

        // Convertir número de WhatsApp de La Célula a enlace, SOLO si no es parte de una URL de wa.me
        // Usamos un lookbehind para asegurar que no haya un dígito antes (como el 2 de 52)
        processed = processed.replace(
            /(?<![\d\/])(55\s*3541\s*2631|5535412631)(?!\d)/g,
            '<a href="https://wa.me/525535412631?text=Hola,%20vengo%20del%20sitio%20web" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">📱 $1</a>'
        );

        // Limpiar HTML mal formado
        processed = processed.replace(/<p>\s*<\/p>/g, '');
        processed = processed.replace(/(<\/p>)\s*(<p>)/g, '$1$2');

        return processed;
    }

    // Enviar resumen de conversación por email usando Resend
    async sendConversationSummary() {
        try {
            // Obtener solo los mensajes visibles (sin contexto del sistema)
            const visibleMessages = this.getVisibleMessages();

            // Crear copia textual completa de la conversación
            let conversationText = '';
            visibleMessages.forEach((msg) => {
                const role = msg.role === 'user' ? 'Cliente' : 'Asistente';
                const text = msg.parts[0].text;
                conversationText += `${role}: ${text}\n\n`;
            });

            // ENVIAR SIEMPRE, sin importar la longitud de la conversación
            if (visibleMessages.length === 0) {
                console.log('No hay mensajes para enviar');
                return false;
            }

            // Preparar payload directo a la API
            const payload = {
                type: 'chatbot_summary',
                leadData: this.leadData,
                conversationData: {
                    full_conversation: conversationText,
                    conversation_length: visibleMessages.length,
                    session_start: this.sessionStartTime
                }
            };

            console.log('📤 Enviando resumen:', payload);

            // Enviar directamente a la API de send-email
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Resumen de conversación enviado');
                this.showEmailSentNotification();
                this.emailSent = true;
                this.saveState();
                return true;
            } else {
                console.error('❌ Error enviando email:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return false;
        }
    }

    // Mostrar notificación de email enviado
    showEmailSentNotification() {
        const notification = document.createElement('div');
        notification.className = 'email-notification';
        notification.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; font-size: 12px;">
                ✅ Información enviada a nuestro equipo musical
            </div>
        `;

        this.chatWindow.appendChild(notification);

        // Quitar la notificación después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        this.scrollToBottom();
    }

    // Verificar si se debe enviar el resumen automáticamente
    shouldSendSummary() {
        const userMessages = this.chatHistory
            .filter((msg) => msg.role === 'user')
            .map((msg) => msg.parts[0].text)
            .filter(
                (text) =>
                    text.length > 10 && !text.includes('Eres el Asistente Musical')
            );

        // Enviar después de 3 mensajes del usuario o si menciona palabras clave
        const keywordTriggers = [
            'cotizar',
            'cotización',
            'precio',
            'costo',
            'contratar',
            'fecha',
            'presupuesto',
            'disponibilidad'
        ];
        const hasKeywords = userMessages.some((msg) =>
            keywordTriggers.some((keyword) => msg.toLowerCase().includes(keyword))
        );

        return (
            userMessages.length >= 3 || (userMessages.length >= 2 && hasKeywords)
        );
    }

    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot-message', 'typing-indicator');
        typingElement.innerHTML = '<span>Componiendo respuesta...</span>';
        typingElement.id = 'typing-indicator';
        this.chatWindow.appendChild(typingElement);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.sendBtn.disabled = true;

        this.appendMessage(message, 'user');
        this.userInput.value = '';

        this.showTypingIndicator();
        try {
            const botResponse = await this.getBotResponse(message);
            this.removeTypingIndicator();
            this.appendMessage(botResponse, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            this.appendMessage(
                'Lo siento, no pude procesar tu mensaje. Para atención inmediata, contáctanos por WhatsApp al 55 3541 2631.',
                'bot'
            );
        }

        this.isLoading = false;
        this.sendBtn.disabled = false;
        this.userInput.focus();
        this.saveState();

        // track message sent to get conversation length dynamics
        window.__gaChatTrack('chatbot_message_sent', { step: 'message', conversation_length: (this.getVisibleMessages() || []).length });

        // Enviar resumen por email después de cada mensaje (SIN condiciones)
        console.log('📧 Intentando enviar resumen del chatbot...');
        console.log('📊 Estado:', {
            emailSent: this.emailSent,
            ResendHandlerDisponible: !!window.ResendEmailHandler,
            mensajesUsuario: this.chatHistory.filter(msg =>
                msg.role === 'user' &&
        msg.parts[0].text.length > 10 &&
        !msg.parts[0].text.includes('Eres el Asistente Musical')
            ).length
        });

        // Enviar siempre, sin importar las condiciones
        setTimeout(() => {
            console.log('⏰ Iniciando envío de resumen (sin condiciones)...');
            this.sendConversationSummary();
        }, 2000);
    }
}

// Función de inicialización que se ejecuta cuando el DOM está listo
function initializeChatbot() {
    console.log('🎵 Inicializando Chatbot La Célula...');

    try {
        const chatbotManager = new CelulaChatbotManager();

        // Inicializar estado visual de los componentes del chatbot
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const leadForm = document.getElementById('lead-form');
        const chatWindowContainer = document.getElementById(
            'chat-window-container'
        );

        // Añadir estilo para el botón de restablecer chat
        const style = document.createElement('style');
        style.textContent = `
            .reset-chat {
                position: absolute;
                right: 40px;
                top: 15px;
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
                transition: transform 0.3s ease;
                z-index: 10;
            }

            .reset-chat:hover {
                transform: scale(1.2);
            }

            @media (max-width: 600px) {
                .reset-chat {
                    right: 35px;
                    top: 14px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);

        if (chatbotToggle && leadForm && chatWindowContainer) {
            console.log(
                '✅ Chatbot La Célula inicializado correctamente con persistencia entre páginas'
            );
        } else {
            console.error('❌ No se pudieron encontrar elementos del chatbot:', {
                chatbotToggle: !!chatbotToggle,
                leadForm: !!leadForm,
                chatWindowContainer: !!chatWindowContainer
            });
        }

        // Mostrar mensaje de persistencia en el chatbot (sólo en desarrollo)
        if (
            location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
        ) {
            console.log(
                'Persistencia del chatbot activada. Los datos se conservarán entre páginas y sesiones'
            );
        }

        // Hacer el manager accesible globalmente para debugging
        window.celulaChatbotManager = chatbotManager;
    } catch (error) {
        console.error('❌ Error al inicializar el chatbot:', error);
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    // El DOM ya está listo, ejecutar inmediatamente
    initializeChatbot();
}

// Form submission logic will be handled by Cloudflare Worker
