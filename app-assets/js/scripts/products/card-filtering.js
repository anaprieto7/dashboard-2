// Archivo: app-assets/js/scripts/products/card-filtering.js
'use strict';

/**
 * Módulo para el filtrado por cards (Total Products, Low Stock, Out of Stock)
 */
function initializeCardFiltering(datatable) {
    console.log('initializeCardFiltering initialized');
    
    $('.inventory-card').on('click', function() {
        const filterType = $(this).data('filter');
        console.log('Card filter clicked:', filterType);
        
        // Resetear todos los filtros primero
        $('.advanced-filter-input').val('');
        $('#min-stock-filter').val('');
        $('#status-filter').val('');
        
        // Aplicar filtros según el card clickeado
        switch(filterType) {
            case 'low_stock':
                $('#min-stock-filter').val('1').trigger('input');
                break;
            case 'out_of_stock':
                $('#min-stock-filter').val('0');
                break;
            case 'all':
            default:
                // Mostrar todos los productos
                break;
        }
        
        applyAllFilters(datatable);
    });
}