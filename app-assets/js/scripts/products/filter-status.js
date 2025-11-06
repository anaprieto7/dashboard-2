// CÓDIGO ACTUALIZADO: app-assets/js/scripts/products/filter-status.js
'use strict';

/**
 * Módulo para el filtro de Estado.
 * @param {object} datatable - La instancia de la DataTable.
 * @param {object} options - Configuración, ej. { columnIndex: 9 } o { columnIndex: 14 }
 */
function initializeStatusFilter(datatable, options) {
    
    // Comprobación de seguridad
    if (!options || typeof options.columnIndex === 'undefined') {
        console.error("Error: initializeStatusFilter no recibió options.columnIndex.");
        return;
    }

    const selector = '#status-filter';
    const columnIndex = options.columnIndex; // <-- ¡Usa el índice de las opciones!
    const onUpdateCallback = updateActiveFiltersUI; // Función para actualizar "pills"

    // Asignar el listener
    $(selector).on('change', function () {
        const searchTerm = $(this).val();
        
        // Aplica el filtro a la columna correcta
        datatable.column(columnIndex)
            .search(searchTerm ? '^' + searchTerm + '$' : '', true, false) // Búsqueda exacta
            .draw();
        
        // Llama a la función de callback para actualizar las "pills"
        if (typeof onUpdateCallback === 'function') {
            onUpdateCallback();
        }
    });
}