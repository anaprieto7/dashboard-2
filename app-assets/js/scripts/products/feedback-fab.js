'use strict';

$(function() {
    'use strict';

    // ===================================================================================
    // 1. DECLARACIÓN DE VARIABLES
    // ===================================================================================
    const designSwitch = $('#new-design-switch-nav');
    const body = $('body');
    const confirmModalElement = document.getElementById('newDesignConfirmModal');
    const confirmModal = new bootstrap.Modal(confirmModalElement);
    const confirmBtn = $('#confirm-new-design-btn');
    const storageKey = 'newDesignEnabled';

    // ===================================================================================
    // 2. DEFINICIÓN DE FUNCIONES
    // ===================================================================================

    /**
     * Aplica el estado de diseño guardado al cargar la página.
     */
    function applyInitialDesignState() {
        const isEnabled = localStorage.getItem(storageKey) === 'true';
        body.toggleClass('new-design-active', isEnabled);
        designSwitch.prop('checked', isEnabled);
    }

    /**
     * Activa el nuevo diseño.
     */
    function enableNewDesign() {
        body.addClass('new-design-active');
        localStorage.setItem(storageKey, 'true');
        designSwitch.prop('checked', true);
    }

    /**
     * Desactiva el nuevo diseño.
     */
    function disableNewDesign() {
        body.removeClass('new-design-active');
        localStorage.setItem(storageKey, 'false');
        designSwitch.prop('checked', false);
    }

    // ===================================================================================
    // 3. ASIGNACIÓN DE EVENTOS
    // ===================================================================================

    // Evento principal al hacer clic en el interruptor
    designSwitch.on('change', function(e) {
        const isActivating = $(this).is(':checked');

        if (isActivating) {
            // Si se está activando, previene el cambio y muestra el modal
            e.preventDefault();
            confirmModal.show();
        } else {
            // Si se está desactivando, lo hace directamente
            disableNewDesign();
        }
    });

    // Evento para el botón de confirmación DENTRO del modal
    confirmBtn.on('click', function() {
        enableNewDesign();
        confirmModal.hide();
    });

    // Evento que se dispara cuando el modal se cierra (por cualquier motivo)
    confirmModalElement.addEventListener('hidden.bs.modal', function () {
        // Si el usuario cerró el modal sin confirmar, el diseño no está activo,
        // así que nos aseguramos de que el interruptor vuelva a su estado 'off'.
        if (!body.hasClass('new-design-active')) {
            designSwitch.prop('checked', false);
        }
    });

    // ===================================================================================
    // 4. INICIALIZACIÓN
    // ===================================================================================
    applyInitialDesignState();
});
