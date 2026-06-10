/**
 * Chatbot para Grupo Musical Versátil La Célula
 * Proporciona atención personalizada por medio de un flujo conversacional
 */

class CelulaChatbotManager {
    constructor() {
        console.log('🔧 Construyendo CelulaChatbotManager...');

        // GA helper for chatbot
        window.__gaChatTrack = function(eventName, params = {}) {
            try {
                if (typeof gtag === 'function') {
                    gtag('event', eventName, Object.assign({
                        flow: 'chatbot',
                        source: 'web',
                        page_location: location.href,
                        page_referrer: document.referrer
                    }, params));
                } else {
                    console.debug('[GA chat debug]', eventName, params);
                }
            } catch (err) {
                console.warn('GA emit error:', err);
            }
        };

        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('chat-close');
        this.chatWindowContainer = document.getElementById('chat-window-container');
        this.chatInputArea = document.getElementById('chat-input-area');
        this.emailSent = false;
        this.sessionStartTime = new Date().toISOString();
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadState();

        if (this.chatHistory.length === 0) {
            this.startConversation();
        }
    }

    saveState() {
        const state = {
            chatHistory: this.chatHistory,
            leadData: this.leadData,
            emailSent: this.emailSent,
            isChatActive: this.chatWindowContainer.classList.contains('active'),
            lastUpdated: new Date().getTime()
        };
        sessionStorage.setItem('celulaChatbotState', JSON.stringify(state));
    }

    loadState() {
        const savedState = sessionStorage.getItem('celulaChatbotState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.chatHistory = state.chatHistory || [];
                this.leadData = state.leadData || { step: 'name' };
                this.emailSent = state.emailSent || false;

                if (this.chatHistory.length > 0) {
                    this.repopulateChat();
                }
            } catch (error) {
                console.error('Error al cargar el estado del chatbot:', error);
                this.resetState();
            }
        } else {
            this.resetState();
        }
    }

    resetState() {
        this.chatHistory = [];
        this.leadData = { step: 'name' };
        this.emailSent = false;
        sessionStorage.removeItem('celulaChatbotState');
    }

    repopulateChat() {
        this.chatWindow.innerHTML = '';
        this.chatHistory.forEach((item) => {
            if (item.role === 'user') {
                this.appendMessage(item.parts[0].text, 'user');
            } else if (item.role === 'model') {
                this.appendMessage(item.parts[0].text, 'bot');
            }
        });

        // Re-handle special inputs if we are in the middle of a step that needs them
        if (this.chatHistory.length > 0 && this.chatHistory[this.chatHistory.length-1].role === 'model') {
            this.handleSpecialInputs(this.leadData.step);
        }
    }

    setupEventListeners() {
        const chatbotToggle = document.getElementById('chatbot-toggle');
        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', () => {
                window.__gaChatTrack('chatbot_open', { step: 'open', open_method: 'click' });
                this.chatWindowContainer.classList.add('active');
                if (this.chatInputArea) this.chatInputArea.style.display = 'flex';
                this.saveState();

                if (this.chatHistory.length === 0) {
                    this.startConversation();
                }
            });
        }

        document.getElementById('chat-close')?.addEventListener('click', () => {
            this.chatWindowContainer.classList.remove('active');
            this.saveState();
        });

        // Reset button
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader && !document.getElementById('reset-chat')) {
            const resetChat = document.createElement('button');
            resetChat.id = 'reset-chat';
            resetChat.className = 'reset-chat';
            resetChat.setAttribute('aria-label', 'Borrar conversación');
            resetChat.innerHTML = '🗑️';
            resetChat.title = 'Reiniciar conversación';
            resetChat.style.cssText = 'position: absolute; right: 40px; top: 15px; background: transparent; border: none; color: white; cursor: pointer; font-size: 16px; transition: transform 0.3s ease; z-index: 10;';
            chatHeader.appendChild(resetChat);
            resetChat.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres borrar la conversación y comenzar de nuevo?')) {
                    this.resetState();
                    this.chatWindow.innerHTML = '';
                    this.startConversation();
                    this.saveState();
                }
            });
        }

        this.sendBtn?.addEventListener('click', () => this.handleUserInput());

        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        this.userInput?.addEventListener('input', this.autoResize.bind(this));
    }

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async startConversation() {
        const greeting = "¡Hola! 👋 Soy tu asistente musical de La Célula. Para darte una cotización exacta para tu evento, necesito unos datos rápidos. ¿Cuál es tu **nombre**?";
        this.addBotMessage(greeting);
        this.leadData.step = 'name';
        this.saveState();
    }

    addBotMessage(text) {
        this.chatHistory.push({ role: 'model', parts: [{ text }] });
        this.appendMessage(text, 'bot');
        this.scrollToBottom();
    }

    async handleUserInput(manualMessage = null) {
        const message = manualMessage || this.userInput.value.trim();
        if (!message || this.isLoading) return;

        // Validar según el paso actual
        const validation = this.validateInput(message, this.leadData.step);
        if (!validation.valid) {
            // No agregamos el mensaje del usuario si es inválido, solo mostramos el error del bot
            this.addBotMessage(`⚠️ ${validation.error}`);
            this.userInput.value = '';
            return;
        }

        this.isLoading = true;
        if (this.sendBtn) this.sendBtn.disabled = true;

        this.appendMessage(message, 'user');
        this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
        this.userInput.value = '';

        this.showTypingIndicator();

        // Guardar el dato
        this.saveLeadData(message, this.leadData.step);

        // Simular tiempo de respuesta
        setTimeout(async () => {
            this.removeTypingIndicator();
            await this.progressFlow();
            this.isLoading = false;
            if (this.sendBtn) this.sendBtn.disabled = false;
            if (this.userInput) this.userInput.focus();
            this.saveState();

            window.__gaChatTrack('chatbot_message_sent', {
                step: this.leadData.step,
                conversation_length: this.chatHistory.length
            });
        }, 800);
    }

    validateInput(value, step) {
        const alphanumeric = /^[a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ]+$/;
        switch (step) {
            case 'name':
            case 'location':
                if (!alphanumeric.test(value)) return { valid: false, error: "Por favor, usa solo letras y números, sin caracteres especiales." };
                break;
            case 'email':
                if (!value.includes('@') || !value.includes('.')) return { valid: false, error: "Por favor, ingresa un correo electrónico válido (debe contener @ y .)." };
                break;
            case 'phone':
                const phoneDigits = value.replace(/\D/g, '');
                if (phoneDigits.length !== 10) return { valid: false, error: "El teléfono debe tener exactamente 10 dígitos numéricos." };
                break;
        }
        return { valid: true };
    }

    saveLeadData(value, step) {
        switch (step) {
            case 'name': this.leadData.name = value; break;
            case 'email': this.leadData.email = value; break;
            case 'phone': this.leadData.phone = value.replace(/\D/g, ''); break;
            case 'eventType': this.leadData.eventType = value; break;
            case 'location': this.leadData.location = value; break;
            case 'guestCount': this.leadData.guestCount = value; break;
            case 'date': this.leadData.date = value; break;
        }
    }

    async progressFlow() {
        switch (this.leadData.step) {
            case 'name':
                this.leadData.step = 'email';
                this.addBotMessage(`¡Mucho gusto, ${this.leadData.name}! ¿A qué **email** te enviamos la propuesta?`);
                break;
            case 'email':
                this.leadData.step = 'phone';
                this.addBotMessage(`¡Perfecto! ¿Cuál es tu **número de teléfono**? (10 dígitos)`);
                break;
            case 'phone':
                this.leadData.step = 'eventType';
                this.addBotMessage(`¿Qué **tipo de evento** estás planeando?`);
                this.handleSpecialInputs('eventType');
                break;
            case 'eventType':
                this.leadData.step = 'location';
                this.addBotMessage(`¿En qué **ciudad o salón** será el evento?`);
                break;
            case 'location':
                this.leadData.step = 'guestCount';
                this.addBotMessage(`¿Cuántos **invitados** aproximadamente esperas?`);
                this.handleSpecialInputs('guestCount');
                break;
            case 'guestCount':
                this.leadData.step = 'date';
                this.addBotMessage(`¿Para qué **fecha** es tu evento? 📅`);
                this.handleSpecialInputs('date');
                break;
            case 'date':
                this.leadData.step = 'completed';
                await this.finishFlow();
                break;
        }
    }

    handleSpecialInputs(step) {
        if (step === 'eventType') {
            this.renderButtons(['Boda', 'XV años', 'Evento Corporativo', 'Fiesta privada', 'Graduación', 'Otro']);
        } else if (step === 'guestCount') {
            this.renderButtons(['50-100', '200-500', '500-1000', '1000+']);
        } else if (step === 'date') {
            this.renderDatePicker();
        }
    }

    renderButtons(options) {
        const container = document.createElement('div');
        container.className = 'chat-buttons';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-btn';
            btn.textContent = opt;
            btn.onclick = () => this.handleUserInput(opt);
            container.appendChild(btn);
        });
        this.chatWindow.appendChild(container);
        this.scrollToBottom();
    }

    renderDatePicker() {
        const container = document.createElement('div');
        container.className = 'chat-date-container';

        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'chat-date-input';

        // No permitir fechas pasadas
        const today = new Date().toISOString().split('T')[0];
        input.min = today;

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'chat-btn date-confirm-btn';
        confirmBtn.textContent = 'Confirmar fecha';
        confirmBtn.onclick = () => {
            if (input.value) {
                this.handleUserInput(input.value);
            } else {
                alert('Por favor selecciona una fecha');
            }
        };

        container.appendChild(input);
        container.appendChild(confirmBtn);
        this.chatWindow.appendChild(container);
        this.scrollToBottom();
    }

    async finishFlow() {
        const summary = `¡Excelente! He recolectado toda la información necesaria.

**Resumen de tu evento:**
- 👤 **Nombre:** ${this.leadData.name}
- 📧 **Email:** ${this.leadData.email}
- 📞 **Teléfono:** ${this.leadData.phone}
- 🎉 **Evento:** ${this.leadData.eventType}
- 📍 **Lugar:** ${this.leadData.location}
- 👥 **Invitados:** ${this.leadData.guestCount}
- 📅 **Fecha:** ${this.leadData.date}

Haz clic en el botón de abajo para enviarnos estos datos por WhatsApp y recibir tu cotización inmediata.`;

        this.addBotMessage(summary);

        const waMessage = `Hola, me interesa una cotización. Mis datos son:
- Nombre: ${this.leadData.name}
- Email: ${this.leadData.email}
- Teléfono: ${this.leadData.phone}
- Evento: ${this.leadData.eventType}
- Lugar: ${this.leadData.location}
- Invitados: ${this.leadData.guestCount}
- Fecha: ${this.leadData.date}`;

        const waLink = `https://wa.me/525535412631?text=${encodeURIComponent(waMessage)}`;

        const waBtnContainer = document.createElement('div');
        waBtnContainer.className = 'chat-buttons';
        const waBtn = document.createElement('a');
        waBtn.href = waLink;
        waBtn.target = '_blank';

        waBtn.className = 'chat-btn whatsapp-btn';
        waBtn.innerHTML = '📱 Hablar por WhatsApp';
        waBtn.style.backgroundColor = '#25D366';
        waBtn.style.fontWeight = 'bold';
        waBtn.onclick = () => {
            // Si el sitelink intermedio está activo, guardamos el mensaje para que el botón
            // siga enviando la información correcta al abrir WhatsApp.
            try {
                if (this.leadData && typeof window !== 'undefined') {
                    window.sessionStorage.setItem('celulaWhatsAppLeadMessage', waMessage);
                }
            } catch (e) {}

            window.__gaChatTrack('generate_lead', {
                step: 'success',
                contact_method: 'whatsapp_api',
                lead_type: this.leadData.eventType
            });
        };

        waBtnContainer.appendChild(waBtn);
        this.chatWindow.appendChild(waBtnContainer);

        // Enviar resumen por email automáticamente
        setTimeout(() => this.sendConversationSummary(), 2000);
        this.scrollToBottom();
    }

    appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

        if (sender === 'bot') {
            messageElement.innerHTML = this.processMarkdown(message);
        } else {
            messageElement.textContent = message;
        }

        this.chatWindow.appendChild(messageElement);
        this.scrollToBottom();
    }

    processMarkdown(text) {
        // Simple markdown processor
        let processed = text.replace(/\n\n/g, '</p><p>');
        processed = '<p>' + processed + '</p>';
        processed = processed.replace(/\n/g, '<br>');
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\[(.*?)\]\((https?:\/\/[^\s<>]+)\)/g, '<a href="$2" target="_blank" style="color: #3D9BE9; text-decoration: underline;">$1</a>');

        // Clean empty paragraphs
        processed = processed.replace(/<p>\s*<\/p>/g, '');
        return processed;
    }

    async sendConversationSummary() {
        if (this.emailSent) return;
        try {
            const payload = {
                type: 'chatbot_summary',
                leadData: this.leadData,
                conversationData: {
                    full_conversation: this.chatHistory.map(m => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.parts[0].text}`).join('\n\n'),
                    session_start: this.sessionStartTime
                }
            };

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                this.emailSent = true;
                this.saveState();
            }
        } catch (error) {
            console.error('Error enviando resumen por email:', error);
        }
    }

    scrollToBottom() {
        if (this.chatWindow) {
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        }
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.chatWindow.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        document.getElementById('typing-indicator')?.remove();
    }
}

function initializeChatbot() {
    console.log('🎵 Inicializando Chatbot Conversacional La Célula...');
    const chatbotManager = new CelulaChatbotManager();
    window.celulaChatbotManager = chatbotManager;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}
