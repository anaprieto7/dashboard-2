'use strict';

/**
 * Módulo autónomo para el filtro de Cliente.
 * @param {object} datatable La instancia de la DataTable.
 * @param {object} options Opciones de configuración.
 */
function initializeCustomerFilter(datatable, options) {
    // Comprobación de seguridad: si no se pasan las opciones, no hace nada y avisa.
    if (!options || typeof options.columnIndex === 'undefined') {
        console.error("Error: Se llamó a initializeCustomerFilter sin las opciones necesarias (columnIndex).");
        return;
    }

    const selectElement = $('#customer-filter');

    selectElement.on('change', function () {
        const selectedCustomers = $(this).val();
        let searchTerm = '';

        if (selectedCustomers && selectedCustomers.length > 0) {
            const escapedCustomers = selectedCustomers.map(customer => 
                customer.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
            );
            searchTerm = '^(' + escapedCustomers.join('|') + ')$';
        }
        
        // Usa el columnIndex que recibe de las opciones.
        datatable.column(options.columnIndex).search(searchTerm, true, false).draw();
        
        // Actualiza las pills
        updateActiveFiltersUI();
    });
}
