'use strict';

// ===================================================================================
// ✅ DEFINIR FUNCIONES DE MODALES PRIMERO (ANTES DE LAS DATATABLES)
// ===================================================================================

// ✅ INICIALIZAR SISTEMA DE MODALES PARA PRODUCTOS
function initializeProductModals() {
  console.log('🚀 Initializing product modals system...');
  
  // Esperar a que la DataTable esté completamente inicializada
  setTimeout(() => {
    if (window.productDataTable && typeof initializeProductEditModal === 'function') {
      console.log('📝 Initializing product edit modal with DataTable...');
      initializeProductEditModal(window.productDataTable);
    } else {
      console.warn('⚠️ Product DataTable or edit modal function not available');
    }
    
    // Verificar si product-modal.js está cargado y tiene su función de inicialización
    if (typeof initializeProductModal === 'function') {
      console.log('👁️ Initializing product view modal...');
      initializeProductModal(window.productDataTable);
    } else {
      // Fallback: inicializar modal de vista manualmente
      console.log('🔧 Setting up fallback modal system...');
      initializeProductModalFallback();
    }
  }, 500);
}

// ✅ FALLBACK PARA MODAL DE VISTA
function initializeProductModalFallback() {
  console.log('🛠️ Setting up fallback product modal...');
  
  const detailsModal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
  let currentProductData = null;

  // Event listener para botones de información
  $(document).on('click', '#product-table .view-info-btn', function (e) {
    e.preventDefault();
    const row = $(this).closest('tr');
    const productId = row.find('input.row-checkbox').data('id'); // Obtener ID del checkbox
    
    console.log('👁️ View info clicked for product:', productId);
    
    if (window.productDataTable && productId) {
      // Buscar el producto en los datos de la DataTable
      const allData = window.productDataTable.rows().data();
      let productData = null;
      
      for (let i = 0; i < allData.length; i++) {
        if (allData[i].id == productId) {
          productData = allData[i];
          break;
        }
      }
      
      if (productData) {
        currentProductData = productData;
        populateProductModal(productData);
        detailsModal.show();
      }
    }
  });

  // Función para llenar el modal de vista
  function populateProductModal(data) {
    $('#modalProductName').text(data.name || 'N/A');
    $('#modalProductSKU').text(data.sku || 'N/A');
    $('#modalProductEAN').text(data.ean || 'N/A');
    $('#modalProductGroup').text(data.product_group || 'Default');
    $('#modalQtyTotal').text(data.quantity || 0);
    $('#modalQtyAvailable').text(data.reservableQuantity || 0);
    $('#modalQtyReserved').text(data.announcedQuantity || 0);
    $('#modalQtyVirtual').text(data.virtualQuantity || 0);
    
    // Actualizar feather icons dentro del modal
    if (window.feather) {
      feather.replace({ width: 14, height: 14 });
    }
  }

  // Event listener para el botón de editar dentro del modal de vista
  $(document).on('click', '#editProductBtn', function() {
    if (currentProductData) {
      console.log('✏️ Edit button clicked in view modal for product:', currentProductData.id);
      
      // Cerrar el modal de vista primero
      detailsModal.hide();
      
      // Esperar a que se cierre completamente
      setTimeout(() => {
        if (window.productDataTable && typeof ProductEditManager !== 'undefined') {
          // Buscar la fila en la DataTable
          const allData = window.productDataTable.rows().data();
          let rowElement = null;
          
          for (let i = 0; i < allData.length; i++) {
            if (allData[i].id == currentProductData.id) {
              rowElement = window.productDataTable.row(i).node();
              break;
            }
          }
          
          if (rowElement) {
            console.log('📝 Opening edit modal for row:', rowElement);
            ProductEditManager.openModal(rowElement);
          }
        }
      }, 300);
    }
  });
}

// ===================================================================================
// ✅ VARIABLES GLOBALES (DESPUÉS DE LAS FUNCIONES)
// ===================================================================================

// Variable global para almacenar la instancia de DataTable
window.inventoryDataTable = null;
window.productDataTable = null;
window.productData = [];

// ===================================================================================
// ✅ AGREGAR FUNCIONES AL OBJETO WINDOW (PARA DISPONIBILIDAD GLOBAL)
// ===================================================================================

window.initializeProductModals = initializeProductModals;
window.initializeProductModalFallback = initializeProductModalFallback;
// ===================================================================================
// PARTE 1: LA FUNCIÓN MAESTRA ("EL CEREBRO")
// Gestiona todos los filtros que no son modulares (rangos, búsqueda, etc.).
// ===================================================================================

function applyAllFilters(datatable, config) {
    // Limpia cualquier filtro de rango global previo para no acumularlos
    // MODIFICADO: Usamos un nombre único para el filtro para no interferir con otros
    const filterName = 'applyAllFilters-' + (datatable.table().node().id);
    for (let i = $.fn.dataTable.ext.search.length - 1; i >= 0; i--) {
        if ($.fn.dataTable.ext.search[i].name === filterName) {
            $.fn.dataTable.ext.search.splice(i, 1);
        }
    }

    // --- Lee los valores de TODOS los filtros que esta función gestiona ---
    const minStock = parseInt($('#min-stock-filter').val(), 10);
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

    // --- MODIFICADO: Usar 'config' para los filtros de columna ---
    const cfg = config.filters; // Objeto de configuración de filtros

    // Búsqueda de Texto
    datatable.search($('#main-search').val());
    if (cfg.sku) datatable.column(cfg.sku).search(skuContains, false, false);
    if (cfg.ean) datatable.column(cfg.ean).search(eanBarcode ? '^' + eanBarcode + '$' : '', true, false);
    if (cfg.barcode) datatable.column(cfg.barcode).search(eanBarcode ? '^' + eanBarcode + '$' : '', true, false);

    // --- MODIFICADO: Filtros de Rango (Global) usando 'config' ---
    const advancedFilterFn = function (settings, data, dataIndex) {
        // Obtenemos los datos numéricos y de fecha de la fila actual usando 'config'
        // Usamos || -1 para que la comprobación no falle si la columna no existe (ej. 'weight' en inventory)
        const qty = parseFloat(data[cfg.qty || -1]) || 0;
        const reservable = parseFloat(data[cfg.reservable || -1]) || 0;
        const volume = parseFloat(data[cfg.volume || -1]) || 0;
        const weight = parseFloat(data[cfg.weight || -1]) || 0;
        const createdAt = data[cfg.created || -1] ? new Date(data[cfg.created].split(' ')[0]) : null;
        const updatedAt = data[cfg.updated || -1] ? new Date(data[cfg.updated].split(' ')[0]) : null;
        
        // Comprobaciones (si alguna falla, la fila se oculta)
        
        // ESTA LÓGICA ESTÁ EN filter-min-stock.js ahora, la comentamos aquí para evitar conflictos
        // if (!isNaN(minStock) && qty < minStock) return false; 
        
        if ((!isNaN(minQty) && qty < minQty) || (!isNaN(maxQty) && qty > maxQty)) return false;
        if ((!isNaN(minReservable) && reservable < minReservable) || (!isNaN(maxReservable) && reservable > maxReservable)) return false;
        if ((!isNaN(minWeight) && weight < minWeight) || (!isNaN(maxWeight) && weight > maxWeight)) return false;
        if ((!isNaN(minVolume) && volume < minVolume) || (!isNaN(maxVolume) && volume > maxVolume)) return false;
        if ((createdStart && createdAt < createdStart) || (createdEnd && createdAt > createdEnd)) return false;
        if ((updatedStart && updatedAt < updatedStart) || (updatedEnd && updatedAt > updatedEnd)) return false;
        
        // Si la fila pasa todas las validaciones, se muestra
        return true;
    };
    
    advancedFilterFn.name = filterName; // Le damos un nombre al filtro
    $.fn.dataTable.ext.search.push(advancedFilterFn);

    // Dibuja la tabla UNA SOLA VEZ con todos los filtros aplicados
    datatable.draw();
    
    // Actualiza la UI de las "pills"
    if (typeof updateActiveFiltersUI === 'function') {
        updateActiveFiltersUI();
    }
}

// ===================================================================================
// FUNCIÓN PARA GESTIONAR LAS TABS
// ===================================================================================
function initializeTabFilters(datatable, config) {
    if (!config.filters.status) {
        console.warn('Tab filters disabled: No status column configured.');
        return; // No hacer nada si no hay columna de status
    }

    const tabs = {
        '#all-products-tab': '',
        '#active-products-tab': 'Active',
        '#inactive-products-tab': 'Inactive'
    };

    for (const tabId in tabs) {
        $(tabId).on('click', function(e) {
            e.preventDefault();
            $('.nav-tabs .nav-link').removeClass('active');
            $(this).addClass('active');
            $('#status-filter').val(tabs[tabId]).trigger('change');
        });
    }

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
// FUNCIÓN PARA FILTROS AVANZADOS
// ===================================================================================
function initializeAdvancedFilters(datatable, config) {
    console.log('initializeAdvancedFilters called - temporary implementation');
    
    // Asignar eventos a los botones de filtros avanzados
    $('#apply-offcanvas-filters-btn').on('click', function() {
        applyAllFilters(datatable, config);
    });
    
    $('#reset-offcanvas-filters-btn').on('click', function() {
        // Resetear todos los filtros avanzados
        $('.advanced-filter-input').val('');
        $('.date-range-picker').val('');
        applyAllFilters(datatable, config);
    });
    
    // Inicializar date range pickers si existen
    if ($.fn.daterangepicker) {
        $('.date-range-picker').daterangepicker({
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Clear'
            }
        });
        
        $('.date-range-picker').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' to ' + picker.endDate.format('MM/DD/YYYY'));
        });
        
        $('.date-range-picker').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });
    }
}

// ===================================================================================
// FUNCIÓN PARA MANEJAR INSIGHTS EN INVENTORY (ACTUALIZADA)
// ===================================================================================
function initializeInventoryInsightsHandler(datatable) {
    console.log('🔧 Setting up inventory insights handler...');
    console.log('🔍 generateInventoryInsights available:', typeof generateInventoryInsights);
    console.log('🔍 initializeInventoryInsights available:', typeof initializeInventoryInsights);
    
    // Función para generar insights cuando sea necesario
    const generateInsightsIfNeeded = () => {
        console.log('🔄 Attempting to generate insights...');
        
        if (typeof generateInventoryInsights === 'function') {
            console.log('📈 Generating inventory insights...');
            try {
                generateInventoryInsights();
            } catch (error) {
                console.error('❌ Error generating insights:', error);
                const container = document.getElementById('insights-container');
                if (container) {
                    container.innerHTML = `
                        <div class="alert alert-danger">
                            <h6>Error Generating Insights</h6>
                            <p class="mb-0">There was an error generating the insights. Please try again.</p>
                            <small>Error: ${error.message}</small>
                        </div>
                    `;
                }
            }
        } else {
            console.warn('❌ generateInventoryInsights function not found');
            const container = document.getElementById('insights-container');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-warning">
                        <h6>Insights Not Available</h6>
                        <p class="mb-0">The insights feature is currently unavailable. Please refresh the page.</p>
                    </div>
                `;
            }
        }
    };

    // Manejar cambio de tabs con Bootstrap
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const targetTab = $(e.target).attr('href');
        console.log('🔄 Tab changed to:', targetTab);
        
        if (targetTab === '#inventory-insights') {
            // Pequeño delay para asegurar que el tab esté completamente visible
            setTimeout(() => {
                generateInsightsIfNeeded();
            }, 100);
        }
    });
    
    // Si el tab de insights está activo al cargar, generar insights inmediatamente
    if ($('#tab-insights').hasClass('active')) {
        console.log('📊 Initial insights generation (tab already active)...');
        setTimeout(generateInsightsIfNeeded, 500);
    }
    
    // También generar insights si la función de inicialización existe
    if (typeof initializeInventoryInsights === 'function') {
        console.log('🔧 Calling initializeInventoryInsights...');
        try {
            initializeInventoryInsights();
        } catch (error) {
            console.error('❌ Error in initializeInventoryInsights:', error);
        }
    }
}

// ===================================================================================
// PARTE 2: BLOQUE DE INICIALIZACIÓN PRINCIPAL
// ===================================================================================
// CÓDIGO ACTUALIZADO: app-assets/js/scripts/products/app.js
// (Solo el bloque de inicialización principal)

$(function () {
    console.log('🚀 Starting SMART app initialization...');
    
    let mainDataTable;
    let pageConfig = {};
    let isProductPage = false;
    let isInventoryPage = false;

    $('#customer-filter').select2({ placeholder: 'Select Customers' });

    setTimeout(() => {
        
        // --- 1. DETECTAR PÁGINA Y CONFIGURAR ---
        if ($('#product-table').length && window.productDataTable) {
            console.log('🚀 app.js: Configurando para Product List');
            isProductPage = true;
            mainDataTable = window.productDataTable;
            pageConfig = {
                datatable: mainDataTable,
                filters: {
                    customer: { columnIndex: 1 },
                    status: { columnIndex: 14 },
                    minStock: { columnIndex: 6 },
                    sku: 3, ean: 4, barcode: 5, qty: 6, reservable: 7,
                    volume: 10, weight: 11, created: 12, updated: 13
                },
                savedFilters: {
                    datatable: mainDataTable,
                    filterFunction: (dt) => applyAllFilters(dt, pageConfig), 
                    storageKey: 'productFilterViews_user1',
                    filterInputIds: [
                        'main-search', 'customer-filter', 'status-filter', 'min-stock-filter',
                        'sku-filter', 'ean-barcode-filter', 'min-qty', 'max-qty',
                        'min-reservable', 'max-reservable', 'min-weight', 'max-weight',
                        'min-volume', 'max-volume', 'created-at-range', 'updated-at-range'
                    ]
                },
                // CORRECCIÓN: Definir los grupos de columnas aquí
                columnGroups: {
                    'General Info': [1, 2, 3, 4, 5], // Customer, Name, SKU, EAN, Barcode
                    'Inventory Details': [6, 7, 8, 9], // Qty, Reservable, Virtual, Announced
                    'Measurements': [10, 11], // Volume, Weight
                    'Timestamps': [12, 13] // Created, Updated
                }
            };

        } else if ($('#inventory-table').length && window.inventoryDataTable) {
            console.log('🚀 app.js: Configurando para Inventory List');
            isInventoryPage = true;
            mainDataTable = window.inventoryDataTable;
            pageConfig = {
                datatable: mainDataTable,
                filters: {
                    customer: { columnIndex: 0 },
                    status: { columnIndex: 9}, 
                    minStock: { columnIndex: 5 }, 
                    sku: 1, ean: null, barcode: null, qty: 5, reservable: 6, 
                    volume: 8, weight: null, created: null, updated: null 
                },
                savedFilters: {
                    datatable: mainDataTable,
                    filterFunction: (dt) => applyAllFilters(dt, pageConfig), 
                    storageKey: 'inventoryFilterViews_user1', 
                    filterInputIds: [
                        'main-search', 'customer-filter', 'status-filter', 'min-stock-filter',
                        'sku-filter', 'ean-barcode-filter', 'min-qty', 'max-qty',
                        'min-reservable', 'max-reservable', 'min-weight', 'max-weight',
                        'min-volume', 'max-volume', 'created-at-range', 'updated-at-range'
                    ]
                },
                // CORRECCIÓN: Definir los grupos de columnas para INVENTORY
                columnGroups: {
                    'General Info': [0, 1, 2, 3, 4], // Customer, SKU, Name, Warehouse, Cell Type
                    'Inventory Details': [5, 6, 7], // Qty, Available, Reserved
                    'Measurements': [8], // Volume
                }
            };
        }

        // --- 2. VERIFICAR SI SE ENCONTRÓ LA TABLA ---
        if (!mainDataTable) {
            console.error('❌ APP.JS: No se pudo encontrar mainDataTable. Abortando inicialización de filtros.');
            return;
        }
        
        console.log('✅ DataTable found. Proceeding with filter initialization...');

        // --- 3. INICIALIZAR MÓDULOS COMPARTIDOS ---
        
        if (typeof initializeMainSearch === 'function') {
            initializeMainSearch(mainDataTable);
        } else {
            $('#main-search').on('keyup', () => applyAllFilters(mainDataTable, pageConfig));
        }
        
        if (typeof initializeCustomerFilter === 'function') {
            initializeCustomerFilter(mainDataTable, pageConfig.filters.customer);
        }

        if (typeof initializeMinStockFilter === 'function') {
            initializeMinStockFilter(mainDataTable, pageConfig.filters.minStock);
        } else {
            $('#min-stock-filter').on('input', () => applyAllFilters(mainDataTable, pageConfig));
        }

        if (typeof initializeStatusFilter === 'function' && pageConfig.filters.status) {
            initializeStatusFilter(mainDataTable, pageConfig.filters.status);
        }

        if (typeof initializeAdvancedFilters === 'function') {
            initializeAdvancedFilters(mainDataTable, pageConfig);
        }

        if (typeof initializeClearFilters === 'function') {
            initializeClearFilters(mainDataTable, pageConfig); 
        }

        if (typeof initializeExportActions === 'function') {
            initializeExportActions(mainDataTable);
        }
        if (typeof initializePillRemoval === 'function') {
            initializePillRemoval(mainDataTable);
        }
        if (typeof initializeSavedFilters === 'function' && pageConfig.savedFilters) {
            initializeSavedFilters(pageConfig.savedFilters); 
        }
        if (typeof initializeMiniPagination === 'function') {
            initializeMiniPagination(mainDataTable);
        }
        
        // CORRECCIÓN: Pasar los grupos de columnas a la función
        if (typeof initializeColumnVisibility === 'function') {
            initializeColumnVisibility(mainDataTable, pageConfig.columnGroups);
        }

        // --- 4. INICIALIZAR MÓDULOS ESPECÍFICOS DE PRODUCT-LIST ---
        if (isProductPage) {
            // ... (código de módulos específicos)
        }

        // --- 5. INICIALIZAR MÓDULOS ESPECÍFICOS DE INVENTORY-LIST ---
        if (isInventoryPage) {
            // ... (código de módulos específicos)
        }
        
        if (typeof updateActiveFiltersUI === 'function') {
            updateActiveFiltersUI();
        }

        mainDataTable.on('draw', function () {
            if (window.feather) {
                feather.replace({ width: 14, height: 14 });
            }
            $('[data-bs-toggle="tooltip"]').tooltip();
        });
        
        if (window.feather) {
            feather.replace({ width: 14, height: 14 });
        }
        $('[data-bs-toggle="tooltip"]').tooltip();

    }, 300); 
});
