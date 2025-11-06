// CÓDIGO ACTUALIZADO: app-assets/js/scripts/products/inventory-cards.js
'use strict';

/**
 * Inicializa el filtrado por cards (Total, Low Stock, Out of Stock, etc.)
 * @param {object} datatable - La instancia de la DataTable.
 * @param {object} config - El objeto pageConfig que contiene los índices de columna.
 */
function initializeCardFiltering(datatable, config) {
    
    // Comprobación de seguridad
    if (!config || !config.filters || typeof config.filters.qty === 'undefined') {
        console.error('initializeCardFiltering abortado: config.filters.qty no está definido en pageConfig.');
        return;
    }

    const qtyColumnIndex = config.filters.qty; // Índice de la columna de Cantidad
    const filterName = 'cardFilter-' + datatable.table().node().id; // Nombre único para el filtro

    // Función para limpiar solo los filtros de las cards
    function removeCardFilter() {
        for (let i = $.fn.dataTable.ext.search.length - 1; i >= 0; i--) {
            if ($.fn.dataTable.ext.search[i].dtFilterName === filterName) {
                $.fn.dataTable.ext.search.splice(i, 1);
            }
        }
    }

    // --- Card: Total Products (data-filter="all") ---
    // Usamos .off('click') para evitar listeners duplicados si se recarga el script
    $(document).off('click', '.inventory-card[data-filter="all"]').on('click', '.inventory-card[data-filter="all"]', function() {
        console.log('CARD FILTER: Show All');
        removeCardFilter();
        
        // Limpia todos los filtros de la tabla y del dropdown de status
        datatable.search('').columns().search('');
        $('#status-filter').val(null).trigger('change');
        
        // Llama a la función global de limpieza (si existe) para limpiar todo lo demás
        if (typeof initializeClearFilters === 'function') {
            $('#clear-filters-btn').trigger('click');
        } else {
            datatable.draw();
        }
    });

    // --- Card: Low Stock (data-filter="low_stock") ---
    $(document).off('click', '.inventory-card[data-filter="low_stock"]').on('click', '.inventory-card[data-filter="low_stock"]', function() {
        console.log(`CARD FILTER: Low Stock (col ${qtyColumnIndex})`);
        removeCardFilter(); // Limpia filtro de card anterior

        const lowStockFilterFn = function(settings, data, dataIndex) {
            const quantity = parseInt(data[qtyColumnIndex]) || 0;
            return quantity >= 1 && quantity <= 20; // Definición: 1 a 20
        };
        lowStockFilterFn.dtFilterName = filterName; // Asignar nombre
        
        $.fn.dataTable.ext.search.push(lowStockFilterFn);
        datatable.draw();
    });

    // --- Card: Out of Stock (data-filter="out_of_stock" o "critical_stock") ---
    // Unificamos 'out_of_stock' y 'critical_stock' si este último es 0.
    // Tu HTML de product-list usa "out_of_stock"
    $(document).off('click', '.inventory-card[data-filter="out_of_stock"]').on('click', '.inventory-card[data-filter="out_of_stock"]', function() {
        console.log(`CARD FILTER: Out of Stock (col ${qtyColumnIndex})`);
        removeCardFilter(); // Limpia filtro de card anterior

        const outOfStockFilterFn = function(settings, data, dataIndex) {
            const quantity = parseInt(data[qtyColumnIndex]) || 0;
            return quantity === 0; // Definición: 0
        };
        outOfStockFilterFn.dtFilterName = filterName; // Asignar nombre
        
        $.fn.dataTable.ext.search.push(outOfStockFilterFn);
        datatable.draw();
    });
    
    // Tu HTML de inventory-list usa "critical_stock" (le damos la misma lógica de 0)
     $(document).off('click', '.inventory-card[data-filter="critical_stock"]').on('click', '.inventory-card[data-filter="critical_stock"]', function() {
        console.log(`CARD FILTER: Critical/Out of Stock (col ${qtyColumnIndex})`);
        removeCardFilter(); // Limpia filtro de card anterior

        const criticalStockFilterFn = function(settings, data, dataIndex) {
            const quantity = parseInt(data[qtyColumnIndex]) || 0;
            return quantity === 0; // Definición: 0
        };
        criticalStockFilterFn.dtFilterName = filterName; // Asignar nombre
        
        $.fn.dataTable.ext.search.push(criticalStockFilterFn);
        datatable.draw();
    });

    // Añadir estilos "clickable"
    $('.inventory-card[data-filter]').each(function() {
        $(this).css('cursor', 'pointer').hover(
            function() { $(this).css({ 'transform': 'translateY(-2px)', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }); },
            function() { $(this).css({ 'transform': 'translateY(0)', 'box-shadow': 'none' }); }
        );
    });
}