'use strict';

// La función de filtrado principal
function applyInventoryFilters(datatable) {
    $.fn.dataTable.ext.search.pop();
    const minStock = parseInt($('#min-stock-filter').val(), 10),
          minSku = parseInt($('#min-sku-filter').val(), 10),
          maxSku = parseInt($('#max-sku-filter').val(), 10),
          minAvailable = parseInt($('#min-available-filter').val(), 10),
          maxAvailable = parseInt($('#max-available-filter').val(), 10),
          minVolume = parseFloat($('#min-volume-filter').val()),
          maxVolume = parseFloat($('#max-volume-filter').val());
    
    datatable.search($('#main-search').val());
    const selectedCustomers = $('#customer-filter').val() || [];
    datatable.column(0).search(selectedCustomers.length > 0 ? '^(' + selectedCustomers.join('|') + ')$' : '', true, false);
    const status = $('#status-filter').val();
    datatable.column(7).search(status ? '^' + status + '$' : '', true, false);

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const totalSku = parseFloat(data[1]) || 0;
        const availableUnits = parseFloat(data[3]) || 0;
        const volume = parseFloat(data[6]) || 0;
        if (!isNaN(minStock) && availableUnits < minStock) return false;
        if ((!isNaN(minSku) && totalSku < minSku) || (!isNaN(maxSku) && totalSku > maxSku)) return false;
        if ((!isNaN(minAvailable) && availableUnits < minAvailable) || (!isNaN(maxAvailable) && availableUnits > maxAvailable)) return false;
        if ((!isNaN(minVolume) && volume < minVolume) || (!isNaN(maxVolume) && volume > maxVolume)) return false;
        return true;
    });

    datatable.draw();
    
    // Llama a la función de las píldoras después de cada filtro
    if (typeof updateActiveFiltersUI === 'function') {
        updateActiveFiltersUI();
    }
}

// El bloque de inicialización principal
$(function () {
    $('#customer-filter').select2({ placeholder: 'Select Customers' });

    inventoryDataTable.init(function(inventoryDatatable) {
        if (!inventoryDatatable) return;

        console.log("✅ Tabla de Inventario lista. Orquestando módulos...");

        // --- Definición de las configuraciones para los módulos ---
        const filterConfig = {
            filterFunction: applyInventoryFilters,
            datatable: inventoryDatatable,
            filterInputs: [
                { id: '#main-search', label: 'Search' },
                { id: '#customer-filter', label: 'Customer', type: 'select2' },
                { id: '#status-filter', label: 'Status' },
                { id: '#min-stock-filter', label: 'Min Stock' },
                { id: '#min-sku-filter', label: 'Min SKUs' },
                { id: '#max-sku-filter', label: 'Max SKUs' },
                { id: '#min-available-filter', label: 'Min Available' },
                { id: '#max-available-filter', label: 'Max Available' },
                { id: '#min-volume-filter', label: 'Min Volume' },
                { id: '#max-volume-filter', label: 'Max Volume' }
            ]
        };
        const savedViewsConfig = {
            datatable: inventoryDatatable,
            filterFunction: applyInventoryFilters,
            storageKey: 'inventoryFilterViews_user1',
            filterInputIds: filterConfig.filterInputs.map(f => f.id.substring(1)) // Extrae los IDs sin '#'
        };

        // --- Inicialización Orquestada y en Orden ---
        let savedFiltersModule;
        
        // 1. Módulo de Vistas Guardadas (se inicializa primero)
        if (typeof initializeSavedFilters === 'function') {
            savedFiltersModule = initializeSavedFilters(savedViewsConfig);
        }

        // 2. Módulo de Píldoras (define la función 'updateActiveFiltersUI')
        if (typeof initializeActiveFiltersManager === 'function') {
            window.updateActiveFiltersUI = initializeActiveFiltersManager(filterConfig);
        }

        // 3. Módulo de Limpiar Filtros (recibe el módulo de vistas guardadas)
        if (typeof initializeClearFilters === 'function') {
            initializeClearFilters(filterConfig, savedFiltersModule);
        }

        // 4. Módulo de Filtros Avanzados
        if (typeof initializeInventoryAdvancedFilters === 'function') {
            initializeInventoryAdvancedFilters(inventoryDatatable, applyInventoryFilters);
        }
        
        // --- Asignación de Eventos ---
        const debouncedFilter = _.debounce(() => applyInventoryFilters(inventoryDatatable), 350);
        $('#main-search, #min-stock-filter').on('keyup input', debouncedFilter);
        $('#customer-filter, #status-filter').on('change', () => applyInventoryFilters(inventoryDatatable));
        
        // --- Llamada final para la UI ---
        // Actualiza las píldoras una vez al cargar la página
        if (typeof updateActiveFiltersUI === 'function') {
            updateActiveFiltersUI();
        }
    });
});