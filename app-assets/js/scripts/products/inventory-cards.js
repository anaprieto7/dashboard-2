'use strict';

/**
 * Módulo para las tarjetas de inventario.
 * Contiene funciones separadas para el conteo inicial y para la gestión de filtros.
 */

// --- VARIABLES Y CONFIGURACIÓN ---
let currentCardFilter = 'all';
const lowStockThreshold = 20;

/**
 * FUNCIÓN 1: CONTEO INICIAL
 * Calcula y actualiza los contadores de las tarjetas una sola vez.
 * Esta función será llamada desde data-table-init.js.
 * @param {object} datatable - La instancia de la DataTable.
 */
function updateCardCounts(datatable) {
    console.log('🚀 Executing updateCardCounts...');
    let totalCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const allData = datatable.rows().data();

    if (allData.length === 0) {
        console.warn('[DEBUG] updateCardCounts was called, but the table has 0 rows of data.');
        return;
    }
    
    console.log(`[DEBUG] Found ${allData.length} products to count.`);
    console.log('[DEBUG] First product sample:', allData[0]);

    allData.each(function (product) {
        const reservableQuantity = parseInt(product.reservableQuantity) || 0;
        
        totalCount++;
        
        if (reservableQuantity === 0) {
            outOfStockCount++;
        } else if (reservableQuantity > 0 && reservableQuantity <= lowStockThreshold) {
            lowStockCount++;
        }
    });

    $('#total-products-count').text(totalCount);
    $('#low-stock-count').text(lowStockCount);
    $('#out-of-stock-count').text(outOfStockCount);
    
    console.log(`📊 FINAL COUNTS - Total: ${totalCount}, Low Stock: ${lowStockCount}, Out of Stock: ${outOfStockCount}`);
}

/**
 * FUNCIÓN 2: GESTIÓN DE FILTROS
 * Inicializa los listeners de clic en las tarjetas para filtrar la tabla.
 * Esta función será llamada desde app.js.
 * @param {object} datatable - La instancia de la DataTable.
 */
function initializeCardFiltering(datatable) {
    
    function applyCardFilter(filterType) {
        currentCardFilter = filterType;
        $.fn.dataTable.ext.search.pop();

        if (filterType !== 'all') {
            $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
                const rowData = datatable.row(dataIndex).data();
                const reservableQuantity = parseInt(rowData.reservableQuantity) || 0;
                
                switch (filterType) {
                    case 'low_stock':
                        return reservableQuantity > 0 && reservableQuantity <= lowStockThreshold;
                    case 'out_of_stock':
                        return reservableQuantity === 0;
                    default: return true;
                }
            });
        }
        datatable.draw();
    }

    function setActiveCard(activeFilter) {
        $('.inventory-card').removeClass('card-active border-primary shadow');
        if (activeFilter) {
            $(`.inventory-card[data-filter="${activeFilter}"]`).addClass('card-active border-primary shadow');
        }
    }

    $('.inventory-card').on('click', function() {
        const filterType = $(this).data('filter');
        
        if (currentCardFilter === filterType) {
            applyCardFilter('all');
            setActiveCard(null); 
        } else {
            applyCardFilter(filterType);
            setActiveCard(filterType);
        }
    });
}
