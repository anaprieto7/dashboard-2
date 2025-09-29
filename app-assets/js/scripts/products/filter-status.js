// Archivo: app-assets/js/scripts/products/status-filter.js
'use strict';

/**
 * Módulo para el filtro de Estado.
 * @param {object} datatable - La instancia de la DataTable.
 */
function initializeStatusFilter(datatable) {
    // Llama a la función "motor" para selects de valor único.
    initializeSingleValueSelectFilter(datatable, {
        selector: '#status-filter',
        columnIndex: 14, // El índice de la columna "Status" en tu tabla.
        onUpdate: updateActiveFiltersUI
    });
}