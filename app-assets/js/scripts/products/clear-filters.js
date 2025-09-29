// Archivo: js/clear-filters.js (Versión Final y Simplificada)

'use strict';

function initializeClearFilters(datatable) {
    $('#clear-filters-btn').on('click', function() {
         console.log('Intentando inicializar el botón Clear All...');
        // --- Limpia los filtros NO modulares ---
        $('#main-search').val('');
        $('#min-stock-filter').val('');
        $('.advanced-filter-input').val(''); // Limpia todos los inputs del offcanvas

        // --- Limpia los filtros modulares (disparando su evento para que se actualicen) ---
        // Para Select2, .val(null) es la forma correcta de deseleccionar.
        $('#status-filter').val(null).trigger('change');
        $('#customer-filter').val(null).trigger('change');
        
        // --- Limpia los flatpickr ---
        if (document.querySelector("#created-at-range")._flatpickr) {
            document.querySelector("#created-at-range")._flatpickr.clear();
        }
        if (document.querySelector("#updated-at-range")._flatpickr) {
            document.querySelector("#updated-at-range")._flatpickr.clear();
        }

        // --- Llama a la función maestra SOLO para los filtros que no tienen módulo propio ---
        // (Como los de rango, búsqueda principal, etc.)
        applyAllFilters(datatable);
    });
}