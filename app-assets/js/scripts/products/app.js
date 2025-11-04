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

function applyAllFilters(datatable) {
    // Limpia cualquier filtro de rango global previo para no acumularlos
    $.fn.dataTable.ext.search.pop();

    console.log('=== VERIFICACIÓN DE FUNCIONES ===');
    console.log('initializeAdvancedFilters:', typeof initializeAdvancedFilters);
    console.log('initializeProductEditModal:', typeof initializeProductEditModal);
    console.log('initializeOnboardingTour:', typeof initializeOnboardingTour);
    console.log('initializeCardFiltering:', typeof initializeCardFiltering);
    console.log('initializeInventoryInsights:', typeof initializeInventoryInsights);
    console.log('================================');

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
// FUNCIÓN PARA GESTIONAR LAS TABS
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
// FUNCIÓN PARA FILTROS AVANZADOS
// ===================================================================================
function initializeAdvancedFilters(datatable) {
    console.log('initializeAdvancedFilters called - temporary implementation');
    
    // Asignar eventos a los botones de filtros avanzados
    $('#apply-offcanvas-filters-btn').on('click', function() {
        applyAllFilters(datatable);
    });
    
    $('#reset-offcanvas-filters-btn').on('click', function() {
        // Resetear todos los filtros avanzados
        $('.advanced-filter-input').val('');
        $('.date-range-picker').val('');
        applyAllFilters(datatable);
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
$(function () {
    console.log('🚀 Starting app initialization...');
    
    // Inicializa componentes de terceros
    $('#customer-filter').select2({ placeholder: 'Select Customers' });

    const productDatatable = initializeProductDataTable();
   
    if (productDatatable) {
        console.log('✅ DataTable initialized successfully');
        window.productDatatable = productDatatable;
        console.log('📊 DataTable exported to window.productDatatable');


        const productSavedViewsConfig = {
            datatable: productDatatable,
            filterFunction: applyAllFilters,
            storageKey: 'productFilterViews_user1',
            filterInputIds: [
                'main-search', 'customer-filter', 'status-filter', 'min-stock-filter',
                'sku-filter', 'ean-barcode-filter', 'min-qty', 'max-qty',
                'min-reservable', 'max-reservable', 'min-weight', 'max-weight',
                'min-volume', 'max-volume', 'created-at-range', 'updated-at-range'
            ]
        };

        // --- INICIALIZAR MÓDULOS DE FILTRO REUTILIZABLES ---
        initializeCustomerFilter(productDatatable, { columnIndex: 1 });
        initializeStatusFilter(productDatatable);
        initializeOnboardingTour();
        initializeTabFilters(productDatatable);
        
        // --- ASIGNAR EVENT LISTENERS ---
        $('#main-search').on('keyup', () => applyAllFilters(productDatatable));
        $('#min-stock-filter').on('input', () => applyAllFilters(productDatatable));
        
        // --- INICIALIZAR MÓDULOS DE INTERFAZ ---
        initializeAdvancedFilters(productDatatable);
        initializeClearFilters(productDatatable);
        initializeBulkActions(productDatatable);
        initializeExportActions(productDatatable);
        initializePillRemoval(productDatatable);
        initializeSavedFilters(productSavedViewsConfig); 
        initializeCardFiltering(productDatatable);
        initializeMiniPagination(productDatatable);
        initializeColumnVisibility(productDatatable);
        initializeProductEditModal(productDatatable);

        // --- MANEJO MEJORADO DE INSIGHTS (SOLO PARA INVENTORY) ---
        if (window.TABLE_MODE === 'inventory') {
            console.log('📊 Inventory mode detected - Setting up insights...');
            initializeInventoryInsightsHandler(productDatatable);
        }
        
        // Llamada inicial para UI
        updateActiveFiltersUI();
    }

    // Feather icons y tooltips
    if (productDatatable) {
        productDatatable.on('draw', function () {
            if (window.feather) {
                feather.replace({ width: 14, height: 14 });
            }
            $('[data-bs-toggle="tooltip"]').tooltip();
        });
    }
    
    if (window.feather) {
        feather.replace({ width: 14, height: 14 });
    }
    $('[data-bs-toggle="tooltip"]').tooltip();
});

