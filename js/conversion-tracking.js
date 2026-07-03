/*! Seguimiento manual de conversiones de Google Ads (AW-943484255) */
document.addEventListener('DOMContentLoaded', function () {
    function fireConversion(label) {
        if (typeof gtag !== 'function') return;
        gtag('event', 'conversion', { send_to: 'AW-943484255/' + label });
    }

    document.addEventListener('click', function (e) {
        var waLink = e.target.closest('a[href*="wa.me"]');
        if (waLink) {
            fireConversion('nYfLCIL0lMocEN_a8cED');
            return;
        }

        var telLink = e.target.closest('a[href^="tel:"]');
        if (telLink) {
            fireConversion('nefwCIX0lMocEN_a8cED');
        }
    });
});
