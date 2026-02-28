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
            guestCount: '',
            email: '' // Added for the enhanced version
        };

        // Estado del flujo
        this.currentStep = 0;

        // Properties needed for the enhanced functionality
        this.chatHistory = [];
        this.sessionStartTime = new Date();
        this.emailSent = false;
        this.isLoading = false;

        // DOM elements
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('chat-close');
        this.chatWindowContainer = document.getElementById('chat-window-container');
        this.leadForm = document.getElementById('lead-form'); // Added for enhanced version
        this.chatInputArea = document.getElementById('chat-input-area'); // Added for enhanced version

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.appendMessage('🎵 ¡Hola! Soy tu asistente musical de La Célula. Empecemos con tu cotización.\n\n¿Cuál es tu nombre?', 'bot');
        this.currentStep = 'name'; // Nuevo flujo: nombre primero
    }

    // Setup event listeners (consolidated, no duplicates)
    setupEventListeners() {
        const chatbotToggle = document.getElementById('chatbot-toggle');

        // Single click listener for the floating toggle button
        if (chatbotToggle) {
            console.log('✅ Botón chatbot-toggle encontrado, agregando listener');
            chatbotToggle.addEventListener('click', () => {
                console.log('🖱️ Click en chatbot-toggle detectado');

                // GA tracking
                if (window.__gaChatTrack) {
                    window.__gaChatTrack('chatbot_open', { step: 'open', open_method: 'click' });
                }

                // Check if chat window is currently visible
                const chatVisible = this.chatWindowContainer && this.chatWindowContainer.classList.contains('active');

                // If chat is open, close it
                if (chatVisible) {
                    this.chatWindowContainer.classList.remove('active');
                    return;
                }

                // Open chat window directly
                this.chatWindowContainer.classList.add('active');
                if (this.chatInputArea) this.chatInputArea.style.display = 'flex';

                // If no chat history, restart the conversation
                if (!this.chatHistory || this.chatHistory.length === 0) {
                    this.restartConversation();
                }
            });
        } else {
            console.error('❌ No se encontró el botón chatbot-toggle');
        }

        // Send button and Enter key
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.handleUserInputEnhanced());
        }

        if (this.userInput) {
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserInputEnhanced();
                }
            });
            this.userInput.addEventListener('input', this.autoResize.bind(this));
        }

        // Close buttons
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.chatWindowContainer.classList.remove('active');
                this.saveState();
            });
        }

        // Lead form close button
        const leadFormCloseEl = document.getElementById('lead-form-close');
        if (leadFormCloseEl) {
            leadFormCloseEl.addEventListener('click', () => {
                if (this.leadForm) this.leadForm.classList.remove('active');
                this.saveState();
            });
        }

        // Reset chat button
        const resetChat = document.createElement('button');
        resetChat.id = 'reset-chat';
        resetChat.className = 'reset-chat';
        resetChat.setAttribute('aria-label', 'Borrar conversación');
        resetChat.innerHTML = '🗑️';
        resetChat.title = 'Borrar esta conversación y comenzar de nuevo';
        resetChat.style.cssText =
            'position: absolute; right: 40px; top: 15px; background: transparent; border: none; color: white; cursor: pointer; font-size: 16px;';

        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.appendChild(resetChat);
        }

        resetChat.addEventListener('click', () => {
            if (confirm('¿Estás seguro de borrar toda la conversación y comenzar de nuevo?')) {
                this.resetState();
                this.chatWindowContainer.classList.remove('active');
                this.chatWindow.innerHTML = '';
                this.chatHistory = [];
                this.currentStep = 0;
                this.leadData = { name: '', phone: '', eventType: '', eventDate: '', eventLocation: '', guestCount: '', email: '' };
                const leadFormEl = document.getElementById('chatbot-lead-form');
                if (leadFormEl) leadFormEl.reset();
                if (this.leadForm) this.leadForm.classList.add('active');
            }
        });

        // Lead form submission - Disabled in new flow
        // The form submission is replaced by the interactive chat flow

        // Save state on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Periodic state save
        setInterval(() => {
            if (this.chatHistory && this.chatHistory.length > 0) {
                this.saveState();
            }
        }, 30000);
    }

    async handleUserInputEnhanced() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Enviar mensaje del usuario al historial y mostrarlo
        this.appendMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // Validar entrada según el paso actual
        let isValid = true;
        let errorMessage = '';

        switch (this.currentStep) {
            case 'name':
                // Validar nombre: solo letras, espacios, apóstrofes y guiones
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]+$/.test(message)) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un nombre válido (solo letras, espacios y apóstrofes).';
                } else {
                    this.leadData.name = message.trim();
                    this.appendMessage(`¡Perfecto ${this.leadData.name}! Ahora necesito tu número de teléfono.\n\nPor favor, ingresa solo 10 dígitos numéricos:`, 'bot');
                    this.currentStep = 'phone';
                }
                break;

            case 'phone':
                // Validar teléfono: exactamente 10 dígitos
                if (!/^\d{10}$/.test(message)) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa exactamente 10 dígitos numéricos.';
                } else {
                    this.leadData.phone = message;
                    this.appendMessage('Gracias. Ahora necesito tu correo electrónico.\n\nIngresa tu dirección de correo electrónico:', 'bot');
                    this.currentStep = 'email';
                }
                break;

            case 'email':
                // Validar correo electrónico
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(message)) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).';
                } else {
                    this.leadData.email = message.toLowerCase();
                    // Mostrar opciones de tipo de evento
                    this.showEventTypeOptions();
                    this.currentStep = 'eventType';
                }
                break;

            case 'eventType':
                // Validar tipo de evento
                const validEventTypes = ['boda', 'xv años', 'evento corporativo', 'fiesta privada', 'graduación', 'otro'];
                const eventTypeLower = message.toLowerCase();
                
                if (!validEventTypes.includes(eventTypeLower)) {
                    // Verificar si coincide con alguna opción exacta (ignorando capitalización)
                    const exactMatch = ['Boda', 'XV años', 'Evento Corporativo', 'Fiesta privada', 'Graduación', 'Otro']
                        .find(option => option.toLowerCase() === eventTypeLower);
                    
                    if (exactMatch) {
                        this.leadData.eventType = exactMatch;
                        
                        if (eventTypeLower === 'otro') {
                            this.appendMessage('Por favor, describe el tipo de evento:', 'bot');
                            this.currentStep = 'eventTypeOther';
                        } else {
                            // Sugerir número de invitados en lugar de pedirlo
                            this.suggestGuestCount();
                        }
                    } else {
                        isValid = false;
                        errorMessage = 'Opción no válida. Por favor selecciona una de las opciones mostradas.';
                    }
                } else {
                    this.leadData.eventType = message;
                    
                    if (eventTypeLower === 'otro') {
                        this.appendMessage('Por favor, describe el tipo de evento:', 'bot');
                        this.currentStep = 'eventTypeOther';
                    } else {
                        // Sugerir número de invitados en lugar de pedirlo
                        this.suggestGuestCount();
                    }
                }
                break;

            case 'eventTypeOther':
                // Capturar descripción del tipo de evento "otro"
                this.leadData.eventType = message;
                // Sugerir número de invitados en lugar de pedirlo
                this.suggestGuestCount();
                break;

            case 'guestCount':
                // Guardar la selección de rango de invitados
                this.leadData.guestCount = message;
                // Mostrar opciones de ubicación
                this.showLocationOptions();
                this.currentStep = 'location';
                break;

            case 'location':
                // Validar ubicación
                const validLocations = ['cdmx', 'edomex', 'otro'];
                const locationLower = message.toLowerCase();
                
                if (!validLocations.includes(locationLower)) {
                    // Verificar si coincide con alguna opción exacta (ignorando capitalización)
                    const exactMatch = ['CDMX', 'Edomex', 'Otro']
                        .find(option => option.toLowerCase() === locationLower);
                    
                    if (exactMatch) {
                        this.leadData.eventLocation = exactMatch;
                        
                        // Eliminar las alcaldías y municipios, ir directamente a la fecha
                        this.appendMessage('Por favor, selecciona la fecha del evento:', 'bot');
                        this.showCalendarPrompt();
                        this.currentStep = 'date';
                    } else {
                        isValid = false;
                        errorMessage = 'Opción no válida. Por favor selecciona una de las opciones mostradas.';
                    }
                } else {
                    this.leadData.eventLocation = message;
                    
                    // Eliminar las alcaldías y municipios, ir directamente a la fecha
                    this.appendMessage('Por favor, selecciona la fecha del evento:', 'bot');
                    this.showCalendarPrompt();
                    this.currentStep = 'date';
                }
                break;

            case 'date':
                // Validar fecha
                const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                if (!dateRegex.test(message)) {
                    isValid = false;
                    errorMessage = 'Formato de fecha incorrecto. Por favor usa el formato DD/MM/AAAA.';
                } else {
                    // Validar que la fecha sea válida
                    const [day, month, year] = message.split('/');
                    const date = new Date(year, month - 1, day);
                    if (date.getFullYear() != year || date.getMonth() != month - 1 || date.getDate() != day) {
                        isValid = false;
                        errorMessage = 'Fecha no válida. Por favor verifica los valores.';
                    } else {
                        // Validar que la fecha no sea en el pasado
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) {
                            isValid = false;
                            errorMessage = 'La fecha no puede ser en el pasado. Por favor selecciona una fecha futura.';
                        } else {
                            this.leadData.eventDate = message;
                            
                            // Confirmar registro y redirigir a WhatsApp
                            this.appendMessage(`✅ ¡Registro completado ${this.leadData.name}!\n\nHe recopilado la siguiente información:\n- Nombre: ${this.leadData.name}\n- Teléfono: ${this.leadData.phone}\n- Email: ${this.leadData.email}\n- Evento: ${this.leadData.eventType}\n- Invitados: ${this.leadData.guestCount}\n- Lugar: ${this.leadData.eventLocation}\n- Fecha: ${this.leadData.eventDate}\n\nSerás redirigido para atención inmediata y personal.`, 'bot');

                            // Enviar datos a través de Resend como fragmentos
                            await this.sendPartialData('name', this.leadData.name);
                            await this.sendPartialData('phone', this.leadData.phone);
                            await this.sendPartialData('email', this.leadData.email);
                            await this.sendPartialData('eventType', this.leadData.eventType);
                            await this.sendPartialData('guestCount', this.leadData.guestCount);
                            await this.sendPartialData('location', this.leadData.eventLocation);
                            await this.sendPartialData('date', this.leadData.eventDate);

                            // Enviar lead completo
                            await this.sendCompleteLead();

                            // Redirigir a WhatsApp después de un breve delay
                            setTimeout(() => {
                                this.redirectToWhatsApp();
                            }, 3000);

                            this.currentStep = 'completed';
                        }
                    }
                }
                break;
        }

        // Mostrar mensaje de error si la entrada no es válida
        if (!isValid && errorMessage) {
            this.appendMessage(errorMessage, 'bot');
        }
    }

    showEventTypeOptions() {
        const options = ['Boda', 'XV años', 'Evento Corporativo', 'Fiesta privada', 'Graduación', 'Otro'];
        const message = 'Selecciona el tipo de evento:';
        this.appendMessage(message, 'bot', options);
    }

    showLocationOptions() {
        const options = ['CDMX', 'Edomex', 'Otro'];
        const message = '¿Dónde será el evento?';
        this.appendMessage(message, 'bot', options);
    }


    suggestGuestCount() {
        const suggestions = ['50-100 personas', '100-200 personas', '200-300 personas', '300-400 personas', 'Más de 400 personas'];
        const message = 'Sugiere el número de invitados:';
        this.appendMessage(message, 'bot', suggestions);
        this.currentStep = 'guestCount';
    }

    showCalendarPrompt() {
        this.appendMessage('Por favor, proporciona la fecha del evento en formato DD/MM/AAAA (día/mes/año):', 'bot');
    }

    // Método para enviar datos parciales a través de Resend
    async sendPartialData(field, value) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'chatbot_partial_data',
                    field: field,
                    value: value,
                    leadId: this.generateLeadId()
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log(`✅ Dato parcial enviado: ${field} = ${value}`);
            } else {
                console.error(`❌ Error enviando dato parcial ${field}:`, result.error);
            }
        } catch (error) {
            console.error(`❌ Error en sendPartialData para ${field}:`, error);
        }
    }

    // Método para enviar lead completo
    async sendCompleteLead() {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'chatbot_complete_lead',
                    leadData: this.leadData,
                    timestamp: new Date().toISOString(),
                    leadId: this.generateLeadId()
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Lead completo enviado:', result.emailId);
            } else {
                console.error('❌ Error enviando lead completo:', result.error);
            }
        } catch (error) {
            console.error('❌ Error en sendCompleteLead:', error);
        }
    }

    // Generar ID único para el lead
    generateLeadId() {
        return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Método para redirigir a WhatsApp con mensaje prellenado
    redirectToWhatsApp() {
        const whatsappMessage = `Hola, vengo del sitio web. Mi evento es una ${this.leadData.eventType} para ${this.leadData.guestCount} personas. Será el ${this.leadData.eventDate} en ${this.leadData.eventLocation}. Mi nombre es ${this.leadData.name} y mi teléfono es ${this.leadData.phone}.`;
        
        const whatsappURL = `https://wa.me/5215535412631?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappURL, '_blank');
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

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    // Persist state to localStorage
    saveState() {
        try {
            const state = {
                leadData: this.leadData,
                chatHistory: this.chatHistory,
                currentStep: this.currentStep,
                emailSent: this.emailSent,
                sessionStartTime: this.sessionStartTime
            };
            localStorage.setItem('celula_chatbot_state', JSON.stringify(state));
        } catch (e) {
            console.warn('No se pudo guardar el estado del chatbot:', e);
        }
    }

    // Reset persisted state
    resetState() {
        try {
            localStorage.removeItem('celula_chatbot_state');
        } catch (e) {
            console.warn('No se pudo eliminar el estado del chatbot:', e);
        }
    }

    async handleFormSubmission() {
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const phoneInput = document.getElementById('phone-input');
        const eventTypeInput = document.getElementById('event-type-input');

        this.leadData.name = nameInput ? nameInput.value.trim() : '';
        this.leadData.email = emailInput ? emailInput.value.trim() : '';
        this.leadData.phone = phoneInput ? phoneInput.value.trim() : '';
        this.leadData.eventType = eventTypeInput ? eventTypeInput.value.trim() : '';

        if (this.leadData.name && this.leadData.email && this.leadData.phone) {
            // GA: collected contact
            if (window.__gaChatTrack) {
                window.__gaChatTrack('chatbot_collect_contact', {
                    step: 'collect',
                    collected_fields_count: ['name', 'email', 'phone', 'eventType'].filter(k => this.leadData[k] && this.leadData[k].length).length,
                    contact_method: 'chatbot',
                    lead_type: this.leadData.eventType || undefined
                });
            }

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
                    if (window.__gaChatTrack) {
                        window.__gaChatTrack('generate_lead', {
                            step: 'success',
                            lead_type: this.leadData.eventType || undefined,
                            value: undefined,
                            currency: 'MXN',
                            contact_method: 'chatbot',
                            conversation_length: (this.getVisibleMessages() || []).length,
                            resolution: 'automated'
                        });
                    }
                } else {
                    console.warn('⚠️ No se pudo enviar el lead:', result.error);
                    if (window.__gaChatTrack) {
                        window.__gaChatTrack('chatbot_submit_error', { step: 'error', error_type: 'server', error_message: String(result.error || 'unknown') });
                    }
                }
            } catch (error) {
                console.error('❌ Error enviando lead:', error);
                if (window.__gaChatTrack) {
                    window.__gaChatTrack('chatbot_submit_error', { step: 'error', error_type: 'exception', error_message: String((error && error.message) || error) });
                }
            }

            this.leadForm.classList.remove('active');
            this.chatWindowContainer.classList.add('active');
            this.chatInputArea.style.display = 'flex';

            await this.startChat();
            this.saveState();
        }
    }

    restartConversation() {
        // Reiniciar el flujo de conversación
        this.currentStep = 'name';
        this.leadData = {
            name: '',
            phone: '',
            eventType: '',
            eventDate: '',
            eventLocation: '',
            guestCount: '',
            email: ''
        };
        
        // Limpiar la ventana de chat
        this.chatWindow.innerHTML = '';
        
        // Mostrar mensaje de bienvenida
        this.appendMessage('🎵 ¡Hola! Soy tu asistente musical de La Célula. Empecemos con tu cotización.\n\n¿Cuál es tu nombre?', 'bot');
        
        // Reiniciar historial
        this.chatHistory = [];
        this.saveState();
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

    appendMessage(message, sender, options = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(
            'message',
            sender === 'user' ? 'user-message' : 'bot-message'
        );

        if (sender === 'bot') {
            // Procesar markdown básico y emojis para mensajes del bot
            const processedMessage = this.processMarkdown(message);
            messageElement.innerHTML = processedMessage;
            
            // Si hay opciones disponibles, añadirlas como botones
            if (options && options.length > 0) {
                const optionsContainer = document.createElement('div');
                optionsContainer.classList.add('options-container');
                
                options.forEach(option => {
                    const optionButton = document.createElement('button');
                    optionButton.classList.add('option-button');
                    optionButton.textContent = option;
                    optionButton.onclick = () => this.selectOption(option);
                    optionsContainer.appendChild(optionButton);
                });
                
                messageElement.appendChild(optionsContainer);
            }
        } else {
            // Para mensajes del usuario, usar texto plano
            messageElement.textContent = message;
        }

        this.chatWindow.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    // Función para manejar la selección de opciones
    selectOption(option) {
        // Simular que el usuario escribió la opción seleccionada
        this.userInput.value = option;
        // Llamar al manejador de entrada
        this.handleUserInputEnhanced();
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