'use strict';

function initializeMinStockFilter(datatable) {
    $('#min-stock-filter').on('input', function () {
        var minStock = parseInt($(this).val(), 10);
        
        // Esta es una función de filtro avanzada de DataTables.
        // Limpiamos cualquier filtro anterior de este tipo antes de aplicar uno nuevo.
        $.fn.dataTable.ext.search.pop(); 
        
        if (!isNaN(minStock) && minStock > 0) {
            $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
                var quantity = parseFloat(data[4]) || 0; // Columna 4 = Cantidad
                return quantity >= minStock;
            });
        }
        datatable.draw();
        updateActiveFiltersUI();
    });
}