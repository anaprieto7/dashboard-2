// CÓDIGO ACTUALIZADO: app-assets/js/scripts/products/filter-min-stock.js
'use strict';

/**
 * Inicializa el filtro de stock mínimo.
 * @param {object} datatable - La instancia de la DataTable.
 * @param {object} options - Opciones, debe incluir { columnIndex: number }.
 */
function initializeMinStockFilter(datatable, options) {
    
    if (!options || typeof options.columnIndex === 'undefined') {
        console.error("Error: initializeMinStockFilter requiere options.columnIndex");
        return;
    }
    
    const columnIndex = options.columnIndex;
    const filterID = '#min-stock-filter'; // El ID del input

    // Usamos un ID único para el filtro de DataTables para evitar conflictos
    const filterName = 'minStockFilter-' + (datatable.table().node().id);

    $(filterID).on('input', function () {
        var minStock = parseInt($(this).val(), 10);

        // Eliminamos SOLO nuestro filtro de stock anterior por su nombre
        for (let i = $.fn.dataTable.ext.search.length - 1; i >= 0; i--) {
            // CORRECCIÓN AQUÍ: Usamos .dtFilterName
            if ($.fn.dataTable.ext.search[i].dtFilterName === filterName) {
                $.fn.dataTable.ext.search.splice(i, 1);
            }
        }
        
        if (!isNaN(minStock) && minStock > 0) {
            // Creamos la nueva función de filtro
            const minStockFilterFn = function (settings, data, dataIndex) {
                // Usamos el columnIndex que nos pasaron en las opciones
                var quantity = parseFloat(data[columnIndex]) || 0; 
                return quantity >= minStock;
            };
            
            // CORRECCIÓN AQUÍ: Usamos .dtFilterName
            minStockFilterFn.dtFilterName = filterName; 
            
            // Añadimos el filtro
            $.fn.dataTable.ext.search.push(minStockFilterFn);
        }

        datatable.draw();
        
        if (typeof updateActiveFiltersUI === 'function') {
            updateActiveFiltersUI();
        }
    });
}