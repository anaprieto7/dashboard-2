'use strict';

// ===================================================================================
// PARTE 1: LA FUNCIÓN MAESTRA ("EL CEREBRO")
// Gestiona todos los filtros que no son modulares (rangos, búsqueda, etc.).
// ===================================================================================

function applyAllFilters(datatable) {
    // Limpia cualquier filtro de rango global previo para no acumularlos
    $.fn.dataTable.ext.search.pop();

    // --- Lee los valores de TODOS los filtros que esta función gestiona ---
    const minStock = parseInt($('#min-stock-filter').val(), 10);
    
    // Filtros del Offcanvas
    const skuContains = $('#sku-filter').val().toLowerCase();
    const eanBarcode = $('#ean-barcode-filter').val();
    const minQty = parseInt($('#min-qty').val(), 10);
    const maxQty = parseInt($('#max-qty').val(), 10);
    const minReservable = parseInt($('#min-reservable').val(), 10);
    const maxReservable = parseInt($('#max-reservable').val(), 10);
    const minWeight = parseInt($('#min-weight').val(), 10);
    const maxWeight = parseInt($('#max-weight').val(), 10);
    const minVolume = parseInt($('#min-volume').val(), 10);
    const maxVolume = parseInt($('#max-volume').val(), 10);
    
    const createdAtRange = $('#created-at-range').val().split(' to ');
    const createdStart = createdAtRange[0] ? new Date(createdAtRange[0]) : null;
    const createdEnd = createdAtRange.length > 1 ? new Date(createdAtRange[1]) : null;
    
    const updatedAtRange = $('#updated-at-range').val().split(' to ');
    const updatedStart = updatedAtRange[0] ? new Date(updatedAtRange[0]) : null;
    const updatedEnd = updatedAtRange.length > 1 ? new Date(updatedAtRange[1]) : null;

    // --- Filtros de Columna (Búsqueda de Texto) ---
    // Estos son gestionados directamente por esta función
    datatable.search($('#main-search').val());
    datatable.column(3).search(skuContains, false, false); // Búsqueda "contains", no exacta
    datatable.column(4).search(eanBarcode ? '^' + eanBarcode + '$' : '', true, false); // EAN exacto
    datatable.column(5).search(eanBarcode ? '^' + eanBarcode + '$' : '', true, false); // Barcode exacto

    // --- Filtros de Rango (Global) ---
    // Esta función se ejecuta para cada fila
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        // Obtenemos los datos numéricos y de fecha de la fila actual
        const qty = parseFloat(data[6]) || 0;
        const reservable = parseFloat(data[7]) || 0;
        const volume = parseFloat(data[10]) || 0;
        const weight = parseFloat(data[11]) || 0;
        const createdAt = data[12] ? new Date(data[12].split(' ')[0]) : null;
        const updatedAt = data[13] ? new Date(data[13].split(' ')[0]) : null;
        
        // Comprobaciones (si alguna falla, la fila se oculta)
        if (!isNaN(minStock) && qty < minStock) return false;
        if ((!isNaN(minQty) && qty < minQty) || (!isNaN(maxQty) && qty > maxQty)) return false;
        if ((!isNaN(minReservable) && reservable < minReservable) || (!isNaN(maxReservable) && reservable > maxReservable)) return false;
        if ((!isNaN(minWeight) && weight < minWeight) || (!isNaN(maxWeight) && weight > maxWeight)) return false;
        if ((!isNaN(minVolume) && volume < minVolume) || (!isNaN(maxVolume) && volume > maxVolume)) return false;
        if ((createdStart && createdAt < createdStart) || (createdEnd && createdAt > createdEnd)) return false;
        if ((updatedStart && updatedAt < updatedStart) || (updatedEnd && updatedAt > updatedEnd)) return false;
        
        // Si la fila pasa todas las validaciones, se muestra
        return true;
    });

    // Dibuja la tabla UNA SOLA VEZ con todos los filtros aplicados
    datatable.draw();
    
    // Actualiza la UI de las "pills"
    updateActiveFiltersUI();
}

// ===================================================================================
// NUEVA FUNCIÓN PARA GESTIONAR LAS TABS
// ===================================================================================
function initializeTabFilters(datatable) {
    const tabs = {
        '#all-products-tab': '',
        '#active-products-tab': 'Active',
        '#inactive-products-tab': 'Inactive'
    };

    // Manejar clics en las pestañas
    for (const tabId in tabs) {
        $(tabId).on('click', function(e) {
            e.preventDefault();
            
            // Cambiar la clase active visualmente
            $('.nav-tabs .nav-link').removeClass('active');
            $(this).addClass('active');

            // Actualizar el dropdown de status y disparar el filtro
            $('#status-filter').val(tabs[tabId]).trigger('change');
        });
    }

    // Sincronizar las pestañas si el dropdown se cambia manualmente
    $('#status-filter').on('change', function() {
        const status = $(this).val();
        $('.nav-tabs .nav-link').removeClass('active');
        
        if (status === 'Active') {
            $('#active-products-tab').addClass('active');
        } else if (status === 'Inactive') {
            $('#inactive-products-tab').addClass('active');
        } else {
            $('#all-products-tab').addClass('active');
        }
    });
}


// ===================================================================================
// PARTE 2: EL BLOQUE DE INICIALIZACIÓN ("EL DIRECTOR DE ORQUESTA")
// Llama a todos los módulos y asigna los eventos.
// ===================================================================================
$(function () {
    // Inicializa componentes de terceros
    $('#customer-filter').select2({ placeholder: 'Select Customers' });

    const productDatatable = initializeProductDataTable();
    
    if (productDatatable) {

        const productSavedViewsConfig = {
            datatable: productDatatable,
            filterFunction: applyAllFilters, // La función de filtro de esta página
            storageKey: 'productFilterViews_user1', // La clave de almacenamiento original
            filterInputIds: [ // La lista de filtros ORIGINAL de la página de productos
                'main-search', 'customer-filter', 'status-filter', 'min-stock-filter',
                'sku-filter', 'ean-barcode-filter', 'min-qty', 'max-qty',
                'min-reservable', 'max-reservable', 'min-weight', 'max-weight',
                'min-volume', 'max-volume', 'created-at-range', 'updated-at-range'
            ]
        };
        // --- Inicializa los MÓDULOS DE FILTRO REUTILIZABLES ---
        // Estos módulos gestionan sus propios eventos y filtros de columna.
        initializeCustomerFilter(productDatatable, {
            columnIndex: 1 
        });
        initializeStatusFilter(productDatatable);
         initializeOnboardingTour();
         initializeTabFilters(productDatatable);
        
        // --- Asigna listeners para los filtros gestionados por app.js ---
        // Estos filtros son "instantáneos" y llaman a la función maestra.
        $('#main-search').on('keyup', () => applyAllFilters(productDatatable));
        $('#min-stock-filter').on('input', () => applyAllFilters(productDatatable));
        
        // --- Inicializa el resto de los módulos de la interfaz ---
        initializeAdvancedFilters(productDatatable); // Este módulo llama a applyAllFilters desde sus botones
        initializeClearFilters(productDatatable);
        initializeBulkActions(productDatatable);
        initializeExportActions(productDatatable);
        initializePillRemoval(productDatatable);
        initializeSavedFilters(productSavedViewsConfig); 
        initializeCardFiltering(productDatatable);
        initializeMiniPagination(productDatatable);
        initializeColumnVisibility(productDatatable);
        initializeProductEditModal(productDatatable);
        
        // Llamada inicial para establecer el estado de las pills y el botón Clear
        updateActiveFiltersUI(); 
    }
});
