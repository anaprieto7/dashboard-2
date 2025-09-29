// Archivo: feedback-fab.js (VERSIÓN FINAL)

$(function() {
    'use strict';

    const fab = $('#feedback-fab');
    const body = $('body');
    const storageKey = 'newDesignEnabled';

    // --- NUEVA CONFIGURACIÓN DE SEGURIDAD ---
    // Empezamos con la lista por defecto de Bootstrap y le añadimos lo que necesitamos.
    const myAllowList = bootstrap.Popover.Default.allowList;
    myAllowList.textarea = ['class', 'id', 'rows', 'placeholder'];
    myAllowList.button = ['class', 'id', 'type']; // Añadimos 'type' por si acaso
    myAllowList.input = ['type', 'class', 'role', 'id', 'checked'];
    myAllowList.label = ['for', 'class'];
    myAllowList.h6 = ['class'];
    myAllowList.hr = ['class'];
    // --- FIN DE LA NUEVA CONFIGURACIÓN ---

    // 1. Inicializar el Popover con la nueva lista blanca
    const popover = new bootstrap.Popover(fab, {
        html: true,
        placement: 'top',
        title: 'Beta Feedback <button type="button" class="btn-close float-end" onclick="$(this).closest(\'.popover\').popover(\'hide\');"></button>',
        content: function() {
            return $('#fab-popover-content').html();
        },
        sanitize: true, // Nos aseguramos de que el sanitizador esté activo
        allowList: myAllowList // ¡AQUÍ ESTÁ LA MAGIA! Usamos nuestra lista personalizada.
    });

    // 2. Lógica para el interruptor de diseño
    function applyDesignState() {
        const isEnabled = localStorage.getItem(storageKey) === 'true';
        body.toggleClass('new-design-active', isEnabled);
        $('#new-design-switch-popover').prop('checked', isEnabled);
    }

    fab.on('shown.bs.popover', function () {
        applyDesignState();
    });

    body.on('change', '#new-design-switch-popover', function() {
        const isChecked = $(this).is(':checked');
        body.toggleClass('new-design-active', isChecked);
        localStorage.setItem(storageKey, isChecked ? 'true' : 'false');
    });

    // 3. Lógica para enviar el feedback
    body.on('click', '#send-feedback-btn', function() {
        const feedbackText = $('#feedback-text').val();
        if (feedbackText.trim() === '') {
            alert('PPlease enter your feedback before sending.');
            return;
        }
        console.log("Feedback to send:", feedbackText);
        alert('Thank you for your feedback!');
        popover.hide();
    });

    // 4. Aplicar el estado inicial del diseño
    applyDesignState();
});