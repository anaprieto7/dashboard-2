// Archivo: js/datatable-init.js (Simplificado y Unificado)

'use strict';

// Variable global para almacenar la instancia de DataTable
window.inventoryDataTable = null;
window.productDataTable = null;
window.productData = []; // Asegurar que esté disponible globalmente

// ✅ FUNCIÓN UNIVERSAL SIMPLE - ÚNICA PARA TODAS LAS PÁGINAS
window.getGlobalProductCounts = function(data) {
    if (!data || !Array.isArray(data)) {
        console.warn('❌ No valid data provided for counts');
        return { 
            totalProducts: 0, 
            lowStock: 0, 
            outOfStock: 0, 
            inactive: 0 
        };
    }

    let totalProducts = data.length;
    let lowStock = 0;
    let outOfStock = 0;
    let inactive = 0;

    data.forEach(product => {
        const quantity = parseInt(product.quantity) || 0;
        const status = product.status || 'Active';
        
        // ✅ CONTEO SIMPLE Y UNIVERSAL
        if (quantity <= 20 && quantity > 0) {
            lowStock++;
        }
        if (quantity === 0) {
            outOfStock++;
        }
        if (status === 'Inactive') {
            inactive++;
        }
    });

    console.log('🌍 Global product counts:', { 
        totalProducts, 
        lowStock, 
        outOfStock, 
        inactive 
    });
    
    return { totalProducts, lowStock, outOfStock, inactive };
};

// ✅ FUNCIÓN HELPER PARA ACTUALIZAR HTML
window.updateCounter = function(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
        console.log(`✅ Updated ${selector}: ${value}`);
    } else {
        console.warn(`❌ Element not found: ${selector}`);
    }
};

function initializeProductDataTable() {
  var dt_product_table = $('#product-table');
  if (!dt_product_table.length) return null;

  if ($.fn.DataTable.isDataTable('#product-table')) {
    dt_product_table.DataTable().destroy();
    console.log('🔄 Destroyed existing Product DataTable instance');
  }

  const savedVisibility = JSON.parse(localStorage.getItem('productTableColumnVisibility')) || {};

  // ✅ CREAR INSTANCIA Y ALMACENARLA GLOBALMENTE
  window.productDataTable = dt_product_table.DataTable({
    data: productData,
    columns: [
      { data: 'id' }, 
      { data: 'customer' },
      { 
        data: 'name',
        render: function (data, type, full, meta) {
          return '<a href="product-detail-Admin.html?id=' + full.id + '" class="text-primary">' + data + '</a>';
        }
      }, 
      { data: 'sku' }, 
      { data: 'ean' },
      { data: 'barcode' },
      { 
        data: 'quantity',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const quantity = parseInt(data) || 0;
          let badge = '';
          if (quantity === 0) {
            badge = '<span class="badge bg-danger ms-1">Out of Stock</span>';
          } else if (quantity <= 5) {
            badge = '<span class="badge bg-warning ms-1">Critical</span>';
          } else if (quantity <= 20) {
            badge = '<span class="badge bg-light-warning ms-1">Low</span>';
          }
          return `<span class="fw-bold">${quantity}</span>${badge}`;
        }
      },
      { 
        data: 'available',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const available = data || (full.quantity - full.reservableQuantity);
          return `<span class="text-success fw-bold">${available}</span>`;
        }
      },
      { 
        data: 'reserved',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const reserved = data || full.reservableQuantity;
          return `<span class="text-warning">${reserved}</span>`;
        }
      },
      { data: 'announcedQuantity' },
      { data: 'unitVolume' },
      { data: 'weight' },
      { data: 'createdAt' },
      { data: 'updatedAt' },
      { data: 'status' }, 
      { data: '' }
    ],
    columnDefs: [
      { 
        targets: 0, 
        orderable: false, 
        render: (data, type, full) => `<div class="form-check"><input class="form-check-input row-checkbox" type="checkbox" data-id="${full.id}"/></div>` 
      },
      { 
        targets: [6, 7, 8, 9, 10, 11, 12], 
        visible: function(columnIdx) {
          const columnKey = getColumnKeyByIndex(columnIdx);
          return savedVisibility[columnKey] !== undefined ? savedVisibility[columnKey] : false;
        }, 
        className: 'text-end' 
      },
      { 
        targets: 14, 
        render: (data, type, full) => `<span class="badge rounded-pill ${full.status === 'Active' ? 'badge-light-success' : 'badge-light-danger'}">${full.status}</span>` 
      },
      {
        targets: -1,
        title: 'Actions',
        orderable: false,
        render: function (data, type, full, meta) {
          if (window.TABLE_MODE === 'inventory') {
            const wmsHref = (window.WMS_BASE_URL || '') + '?sku=' + encodeURIComponent(full.sku);
            return (
              '<div class="d-inline-flex">' +
                '<a href="'+ wmsHref +'" target="_blank" rel="noopener" ' +
                'class="btn btn-icon btn-sm btn-flat-secondary me-50" ' +
                'data-bs-toggle="tooltip" data-bs-placement="top" ' +
                'title="Open in Wemalo WMS">' +
                feather.icons['external-link'].toSvg({ class: 'font-small-4' }) +
              '</a>' +
              '</div>'
            );
          }
          return (
            '<div class="d-inline-flex">' +
              '<a href="javascript:;" class="view-info-btn text-info me-1" title="See Info">' +
                feather.icons['info'].toSvg({ class: 'font-small-4' }) +
              '</a>' +
              '<a href="javascript:;" class="item-edit text-primary" title="Edit">' +
                feather.icons['edit'].toSvg({ class: 'font-small-4' }) +
              '</a>' +
            '</div>'
          );
        }
      }
    ],
    order: [[2, 'asc']],
    dom: '<"d-flex justify-content-between align-items-center mx-2 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-2 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>B',
    buttons: [
        'copy',
        'csv',
        'excel',
        'pdf',
        'print'
    ],
    drawCallback: function() {
      const savedVisibility = JSON.parse(localStorage.getItem('productTableColumnVisibility')) || {};
      
      if (Object.keys(savedVisibility).length > 0) {
        Object.keys(savedVisibility).forEach(columnKey => {
          const columnIndex = getColumnIndexByKey(columnKey);
          if (columnIndex !== -1) {
            window.productDataTable.column(columnIndex).visible(savedVisibility[columnKey]);
          }
        });
      }
      
      if (window.feather) {
        feather.replace({ width: 16, height: 16 });
      }
    },
    initComplete: function() {
        const api = this.api();
        
        // ✅ GUARDAR DATOS GLOBALMENTE
        try {
            window.productData = api.rows().data().toArray();
            console.log('💾 productData saved globally:', window.productData.length, 'products');
        } catch (error) {
            console.error('❌ Failed to save productData globally:', error);
            window.productData = [];
        }
        
        // ✅ ACTUALIZAR CONTADORES USANDO FUNCIÓN UNIVERSAL
        const counts = window.getGlobalProductCounts(window.productData);
        
        // Actualizar cualquier indicador que exista en esta página
        window.updateCounter('#total-products-count', counts.totalProducts);
        window.updateCounter('#low-stock-count', counts.lowStock);
        window.updateCounter('#out-of-stock-count', counts.outOfStock);
        window.updateCounter('#inactive-count', counts.inactive);
        
        // ✅ INICIALIZAR sistema de visibilidad de columnas
        initializeColumnVisibilitySystem(api);

        if (window.feather) {
            feather.replace({ width: 16, height: 16 });
        }

        console.log('🎯 DataTable init complete, initializing modals...');
        initializeProductModals();
    }
  });

  return window.productDataTable;
}

// ✅ FUNCIONES AUXILIARES PARA MANEJO DE VISIBILIDAD
function getColumnKeyByIndex(index) {
  const columnKeys = [
    'id', 'customer', 'name', 'sku', 'ean', 'barcode', 
    'quantity', 'reservableQuantity', 'virtualQuantity', 'announcedQuantity',
    'unitVolume', 'weight', 'createdAt', 'updatedAt', 'status', 'actions'
  ];
  return columnKeys[index] || `column_${index}`;
}

function getColumnIndexByKey(key) {
  const columnKeys = [
    'id', 'customer', 'name', 'sku', 'ean', 'barcode', 
    'quantity', 'reservableQuantity', 'virtualQuantity', 'announcedQuantity',
    'unitVolume', 'weight', 'createdAt', 'updatedAt', 'status', 'actions'
  ];
  return columnKeys.indexOf(key);
}

function initializeColumnVisibilitySystem(api) {
  const savedVisibility = JSON.parse(localStorage.getItem('productTableColumnVisibility')) || {};
  
  console.log('📊 Loading saved column visibility:', savedVisibility);
  
  Object.keys(savedVisibility).forEach(columnKey => {
    const columnIndex = getColumnIndexByKey(columnKey);
    if (columnIndex !== -1) {
      api.column(columnIndex).visible(savedVisibility[columnKey]);
    }
  });

  api.on('column-visibility', function(e, settings, column, state) {
    const columnKey = getColumnKeyByIndex(column);
    const currentVisibility = JSON.parse(localStorage.getItem('productTableColumnVisibility')) || {};
    currentVisibility[columnKey] = state;
    localStorage.setItem('productTableColumnVisibility', JSON.stringify(currentVisibility));
    console.log('💾 Column visibility saved:', currentVisibility);
  });
}

function initializeInventoryDataTable() {
  var dt_inventory_table = $('#inventory-table');
  if (!dt_inventory_table.length) return null;

  if ($.fn.DataTable.isDataTable('#inventory-table')) {
    dt_inventory_table.DataTable().destroy();
    console.log('🔄 Destroyed existing Inventory DataTable instance');
  }

  console.log('📊 Initializing Inventory DataTable with columns');

  window.inventoryDataTable = dt_inventory_table.DataTable({
    data: productData,
    columns: [
      { data: 'customer' },
      { data: 'sku' },
      { 
        data: 'name',
        render: function (data, type, full, meta) {
          return '<a href="product-detail-Admin.html?id=' + full.id + '" class="text-primary">' + data + '</a>';
        }
      },
      { data: 'warehouse' },
      { data: 'celltype' },
      { 
        data: 'quantity',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const quantity = parseInt(data) || 0;
          let badge = '';
          if (quantity === 0) {
            badge = '<span class="badge bg-danger ms-1">Out of Stock</span>';
          } else if (quantity <= 5) {
            badge = '<span class="badge bg-warning ms-1">Critical</span>';
          } else if (quantity <= 20) {
            badge = '<span class="badge bg-light-warning ms-1">Low</span>';
          }
          return `<span class="fw-bold">${quantity}</span>${badge}`;
        }
      },
      { 
        data: 'available',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const available = data || (full.quantity - full.reservableQuantity);
          return `<span class="text-success fw-bold">${available}</span>`;
        }
      },
      { 
        data: 'reserved',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const reserved = data || full.reservableQuantity;
          return `<span class="text-warning">${reserved}</span>`;
        }
      },
      { 
        data: 'volume',
        className: 'text-end',
        render: function (data, type, full, meta) {
          const volume = data || full.unitVolume;
          return volume ? `<span class="text-muted">${volume}m³</span>` : '-';
        }
      },
      { data: 'status' }, // <-- 9: NUEVA COLUMNA DE STATUS
      { data: '' }
    ],
    columnDefs: [
      { // <-- NUEVA DEFINICIÓN PARA LA COLUMNA STATUS
        targets: -2, // Target a la penúltima columna (la nueva col 9)
        title: 'Status',
        orderable: true,
        render: function (data, type, full, meta) {
            const status = data || 'Active'; // Asumir Active si los datos son nulos
            const badgeClass = status === 'Active' ? 'badge-light-success' : 'badge-light-danger';
            return `<span class="badge rounded-pill ${badgeClass}">${status}</span>`;
        }
      },
      {
        targets: -1,
        title: 'Actions',
        orderable: false,
        render: function (data, type, full, meta) {
          const wmsHref = (window.WMS_BASE_URL || '') + '?sku=' + encodeURIComponent(full.sku);
          return (
            '<div class="d-inline-flex">' +
              '<a href="'+ wmsHref +'" target="_blank" rel="noopener" ' +
              'class="btn btn-icon btn-sm btn-flat-secondary me-50" ' +
              'data-bs-toggle="tooltip" data-bs-placement="top" ' +
              'title="Open in Wemalo WMS">' +
              feather.icons['external-link'].toSvg({ class: 'font-small-4' }) +
            '</a>' +
              '<div class="dropdown">' +
                '<button class="btn btn-icon btn-sm btn-flat-primary dropdown-toggle hide-arrow" type="button" data-bs-toggle="dropdown">' +
                  feather.icons['more-vertical'].toSvg({ class: 'font-small-4' }) +
                '</button>' +
                '<div class="dropdown-menu">' +
                  '<a class="dropdown-item" href="product-detail-Admin.html?id=' + full.id + '">' +
                    feather.icons['info'].toSvg({ class: 'font-small-4 me-50' }) + 'View Details' +
                  '</a>' +
                  '<a class="dropdown-item" href="product-detail-Admin.html?id=' + full.id + '">' +
                    feather.icons['edit'].toSvg({ class: 'font-small-4 me-50' }) + 'Edit Product' +
                  '</a>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }
      }
    ],
    order: [[2, 'asc']],
    dom: '<"d-flex justify-content-between align-items-center mx-2 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-2 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    buttons: [
      {
        extend: 'collection',
        text: 'Export',
        buttons: [
          'copy',
          'csv',
          'excel', 
          {
            text: 'PDF',
            action: function (e, dt, button, config) {
              if (typeof exportInsightsToPDF === 'function') {
                exportInsightsToPDF();
              }
            }
          }
        ]
      }
    ],
    initComplete: function() {
        const api = this.api();
        console.log('✅ Inventory DataTable initialized with', api.rows().count(), 'products');
        
        // ✅ GUARDAR DATOS GLOBALMENTE
        try {
            window.productData = api.rows().data().toArray();
            console.log('💾 productData saved globally:', window.productData.length, 'products');
        } catch (error) {
            console.error('❌ Failed to save productData globally:', error);
            window.productData = [];
        }
        
        // ✅ ACTUALIZAR CONTADORES USANDO FUNCIÓN UNIVERSAL
        const counts = window.getGlobalProductCounts(window.productData);
        
        // Actualizar cualquier indicador que exista en esta página
        window.updateCounter('#total-products-count', counts.totalProducts);
        window.updateCounter('#low-stock-count', counts.lowStock);
        window.updateCounter('#out-of-stock-count', counts.outOfStock);
        window.updateCounter('#inactive-count', counts.inactive);
        
        // ✅ INICIALIZAR FILTROS
        initCardFilters();
        
        // ✅ LLAMAR A INSIGHTS
        setTimeout(() => {
            if (typeof generateInventoryInsights === 'function') {
                console.log('🔄 Calling generateInventoryInsights');
                generateInventoryInsights();
            }
        }, 300);
    },
    drawCallback: function() {
      if (window.feather) {
        feather.replace({ width: 16, height: 16 });
      }
    }
  });

  return window.inventoryDataTable;
}

// ✅ MANTENER initCardFilters si la necesitas
function initCardFilters() {
  console.log('🎯 Initializing card filters...');
  
  const cards = ['total-products-card', 'low-stock-card', 'critical-stock-card', 'out-of-stock-card'];
  cards.forEach(cardId => {
    const card = document.getElementById(cardId);
    if (card) {
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
    }
  });

  // Filtro para Total Products - RESET
  const totalProductsCard = document.getElementById('total-products-card');
  if (totalProductsCard) {
    totalProductsCard.addEventListener('click', function() {
      console.log('🔄 Filter: Show all products');
      if (window.inventoryDataTable) {
        window.inventoryDataTable.search('').columns().search('').draw();
      }
    });
  }

  // Filtro para Low Stock (≤20)
  const lowStockCard = document.getElementById('low-stock-card');
  if (lowStockCard) {
    lowStockCard.addEventListener('click', function() {
      console.log('🔄 Filter: Low stock (≤20)');
      if (window.inventoryDataTable) {
        $.fn.dataTable.ext.search.push(
          function(settings, data, dataIndex) {
            const quantity = parseInt(data[5]) || 0;
            return quantity >= 1 && quantity <= 20;
          }
        );
        window.inventoryDataTable.draw();
        $.fn.dataTable.ext.search.pop();
      }
    });
  }

  // Filtro para Out of Stock (0)
  const outOfStockCard = document.getElementById('out-of-stock-card');
  if (outOfStockCard) {
    outOfStockCard.addEventListener('click', function() {
      console.log('🔄 Filter: Out of stock (0)');
      if (window.inventoryDataTable) {
        window.inventoryDataTable.column(5).search('^0$', true, false).draw();
      }
    });
  }

  // ✅ AGREGAR ESTILOS PARA INDICAR QUE SON CLICABLES
  cards.forEach(cardId => {
    const card = document.getElementById(cardId);
    if (card) {
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s ease';
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      });
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });
    }
  });
}

function initTooltips() {
  if (window.bootstrap && window.bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}

// Hacer las funciones disponibles globalmente
window.initializeProductDataTable = initializeProductDataTable;
window.initializeInventoryDataTable = initializeInventoryDataTable;
window.initCardFilters = initCardFilters;
window.getColumnKeyByIndex = getColumnKeyByIndex;
window.getColumnIndexByKey = getColumnIndexByKey;

// ✅ INICIALIZACIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM Content Loaded - Initializing DataTables...');
  
  setTimeout(() => {
    if (document.getElementById('product-table')) {
      console.log('📋 Initializing Product DataTable...');
      initializeProductDataTable();
    }
    
    if (document.getElementById('inventory-table')) {
      console.log('📊 Initializing Inventory DataTable...');
      initializeInventoryDataTable();
    }
  }, 100);
});