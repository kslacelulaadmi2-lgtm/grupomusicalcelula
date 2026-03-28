/*! Manejador del Formulario de Cotización - Grupo Musical La Célula */document.addEventListener('DOMContentLoaded',function(){
// GA helper
window.__gaLeadTrack = function(eventName, params = {}) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', eventName, Object.assign({
                flow: 'cotizador',
                source: 'web',
                page_location: location.href,
                page_referrer: document.referrer
            }, params));
        } else {
            console.debug('[GA debug]', eventName, params);
        }
    } catch (err) {
        console.warn('GA emit error:', err);
    }
};

const form=document.querySelector('.cotizador-form');
if(form){
// fire cotizador_open when form is present
window.__gaLeadTrack('cotizador_open', { step: 'open' });

let isSubmitting=false;form.addEventListener('submit',async function(e){e.preventDefault();

    if (isSubmitting) {
        console.log('Formulario ya está siendo procesado...');
        return;
    }

    isSubmitting = true;
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    // mark start on first submit attempt
    window.__gaLeadTrack('cotizador_start', { step: 'start' });

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // select service/type updates
        if (data.evento) {
            window.__gaLeadTrack('cotizador_select_service', {
                step: 'select',
                service_name: data.evento,
                lead_type: data.evento
            });
        }

        // Solo nombre, teléfono y tipo de evento son obligatorios
        if (!data.nombre || !data.telefono || !data.evento) {
            window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'validation', error_message: 'Campos requeridos faltantes' });
            throw new Error('Por favor completa tu nombre, teléfono y tipo de evento');
        }

        // Email solo se valida si fue proporcionado
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'validation', error_message: 'Email inválido' });
            throw new Error('Por favor ingresa un email válido');
        }

        const phoneDigits = data.telefono.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'validation', error_message: 'Teléfono inválido' });
            throw new Error('El teléfono debe tener 10 dígitos');
        }

        // Fecha solo se valida si fue proporcionada
        if (data.fecha) {
            const eventDate = new Date(data.fecha);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate < today) {
                window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'validation', error_message: 'Fecha pasada' });
                throw new Error('La fecha del evento debe ser futura');
            }
        }

        // Manejar invitados como string del select
        const numeroInvitados = data.invitados ? data.invitados.trim() : 'No especificado';

        const emailData = {
            type: 'form_cotizador',
            formData: {
                nombre: data.nombre.trim(),
                email: data.email ? data.email.trim() : '',
                telefono: phoneDigits,
                tipoEvento: data.evento.trim(),
                fechaEvento: data.fecha || '',
                lugar: data.ubicacion ? data.ubicacion.trim() : '',
                numeroInvitados: numeroInvitados,
                paquete: 'Por definir',
                mensaje: data.comentarios ? data.comentarios.trim() : ''
            }
        };

        // Pre-summary view event
        window.__gaLeadTrack('cotizador_view_summary', {
            step: 'summary',
            value: undefined,
            currency: 'MXN'
        });

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        let result;
        try {
            result = await response.json();
        } catch (_) {
            result = { success: false, error: 'El servidor no respondió correctamente' };
        }

        if (result.success) {
            console.log('✅ Cotización enviada por email exitosamente');
            
            // Push al dataLayer para GTM (evento de conversión)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'cotizador_completed',
                cotizadorData: {
                    tipoEvento: data.evento,
                    numeroInvitados: numeroInvitados,
                    fechaEvento: data.fecha,
                    ubicacion: data.ubicacion
                }
            });
            
            // generate_lead conversion (GA4 legacy)
            window.__gaLeadTrack('generate_lead', {
                step: 'success',
                lead_type: data.evento,
                contact_method: 'form',
                value: undefined,
                currency: 'MXN',
                form_fields_filled: Object.keys(data).length
            });
            showNotification('✅ Tu solicitud ha sido enviada. Te contactaremos pronto.', 'success');
        } else {
            console.warn('No se pudo enviar el email:', result.error);
            window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'server', error_message: String(result.error || 'unknown') });
            showNotification(`⚠️ ${result.error || 'No se pudo enviar el email'}. Te redirigiremos a WhatsApp.`, 'warning');
        }

        const fechaFormateada = data.fecha ? new Date(data.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Por definir';
        const mensaje = `Hola, me interesa cotizar mi evento:\n\n🎵 *Cotización de Evento Musical*\n👤 *Nombre:* ${data.nombre}\n📞 *Teléfono:* ${data.telefono}${data.email ? '\n📧 *Email:* ' + data.email : ''}\n🎉 *Tipo de evento:* ${data.evento}\n📅 *Fecha:* ${fechaFormateada}${data.ubicacion ? '\n📍 *Ubicación:* ' + data.ubicacion : ''}${data.invitados ? '\n👥 *Invitados:* ' + data.invitados + ' personas' : ''}\n💬 *Comentarios:* ${data.comentarios || 'Ninguno'}\n\n¡Espero su respuesta!`;

        await new Promise(resolve => setTimeout(resolve, 1500));

        const whatsappUrl = `https://wa.me/525535412631?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
        this.reset();

        setTimeout(() => {
            showNotification('📱 Te hemos redirigido a WhatsApp para atención inmediata.', 'info');
        }, 2000);

    } catch (error) {
        console.error('Error al procesar el formulario:', error);
        window.__gaLeadTrack('cotizador_submit_error', { step: 'error', error_type: 'exception', error_message: String(error?.message || error) });
        showNotification(`❌ ${error.message}. Por favor intenta de nuevo.`, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
        isSubmitting = false;
    }
});

// Validaciones en tiempo real
const emailInput = form.querySelector('input[name="email"]');
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.setCustomValidity('Por favor ingresa un email válido');
            this.reportValidity();
        } else {
            this.setCustomValidity('');
        }
    });
}

const phoneInput = form.querySelector('input[name="telefono"]');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
}
}

// Track field interactions for updates
try {
    const trackUpdate = () => window.__gaLeadTrack('cotizador_update_quote', {
        step: 'update',
        attendees: (form.querySelector('#invitados')||{}).value || undefined,
        date_selected: (form.querySelector('#fecha')||{}).value || undefined
    });
    ['#evento','#fecha','#invitados','#ubicacion','#comentarios'].forEach(sel=>{
        const el = form.querySelector(sel);
        if (el) el.addEventListener('change', trackUpdate);
    });
} catch(_){}

console.log('✅ Cotizador cargado correctamente');
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `form-notification form-notification-${type}`;

    const styles = {
        success: 'background: #d4edda; color: #155724; border-left: 4px solid #28a745;',
        error: 'background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545;',
        warning: 'background: #fff3cd; color: #856404; border-left: 4px solid #ffc107;',
        info: 'background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8;'
    };

    notification.style.cssText = `
        ${styles[type]}
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 5px;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    `;

    notification.textContent = message;

    const form = document.querySelector('.cotizador-form');
    if (form) {
        document.querySelectorAll('.form-notification').forEach(n => n.remove());
        form.parentNode.insertBefore(notification, form);
        setTimeout(() => notification.remove(), 5000);
    }
}
