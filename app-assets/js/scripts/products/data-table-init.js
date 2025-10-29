// Archivo: js/datatable-init.js (Actualizado con todas las columnas)

'use strict';

function initializeProductDataTable() {
  var dt_product_table = $('#product-table');
  if (!dt_product_table.length) return null;

  // --- NUEVA LÓGICA PARA CARGAR ---
  // 1. Intentamos obtener la configuración de visibilidad guardada
  const savedVisibility = JSON.parse(localStorage.getItem('productTableColumnVisibility'));


  return dt_product_table.DataTable({
    data: productData,
    columns: [
      { data: 'id' }, 
      { data: 'customer' },
      {  data: 'name',
        render: function (data, type, full, meta) {
        // 'data' automatically contains the product name for this column.
        return '<a href="product-detail-Admin.html?id=' + full.id + '" class="text-primary">' + data + '</a>';}}, 
      { data: 'sku' }, 
      { data: 'ean' },
      { data: 'barcode' },             // NUEVA
      { data: 'quantity' },
      { data: 'reservableQuantity' },  // NUEVA
      { data: 'virtualQuantity' },     // NUEVA
      { data: 'announcedQuantity' },   // NUEVA
      { data: 'unitVolume' },          // NUEVA
      { data: 'weight' },
      { data: 'createdAt' },           // NUEVA
      { data: 'updatedAt' },
      { data: 'status' }, 
      { data: '' } // Actions
    ],
    columnDefs: [
      { targets: 0, orderable: false, render: (data, type, full) => `<div class="form-check"><input class="form-check-input row-checkbox" type="checkbox" data-id="${full.id}"/></div>` },
      { targets: [6, 7, 8, 9, 10, 11, 12],visible: false, className: 'text-end' }, // Targets ajustados para columnas numéricas
      { targets: 14, render: (data, type, full) => `<span class="badge rounded-pill ${full.status === 'Active' ? 'badge-light-success' : 'badge-light-danger'}">${full.status}</span>` }, // Target de Status ajustado
      {
        targets: -1,
        title: 'Actions',
        orderable: false,
        render: function (data, type, full, meta) {
          if (window.TABLE_MODE === 'inventory') {
            // --- Actions for Inventory table---
            
            const wmsHref = (window.WMS_BASE_URL || '') + '?sku=' + encodeURIComponent(full.sku);
            return (
              '<div class="d-inline-flex">' +
                // 1) Open in WMS // here need to add the dynamic link of the product on wmalo on the const wmsHref. 
                '<a href="'+ wmsHref +'" target="_blank" rel="noopener" ' +
                'class="btn btn-icon btn-sm btn-flat-secondary me-50" ' +
                'data-bs-toggle="tooltip" data-bs-placement="top" ' +
                'title="Open in Wemalo WMS">' +
                feather.icons['external-link'].toSvg({ class: 'font-small-4' }) +
              '</a>' +

              '</div>'
            );
          }
          // --- Actiosn for Product Table ---
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
    order: [[2, 'asc']], // Ordenar por Name (columna 2)
    dom: '<"d-flex justify-content-between align-items-center mx-2 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-2 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>B',
    buttons: [
        'copy',
        'csv',
        'excel',
        'pdf',
        'print'
    ],
    
    // ▼▼▼ BLOQUE DE CÓDIGO ACTUALIZADO ▼▼▼
    initComplete: function() {
        // 'this.api()' devuelve la instancia de la DataTable.
        // Llamamos a la función de conteo en el momento exacto en que la tabla está lista.
        const api = this.api();
        updateCardCounts(api); 
        }
    // ▲▲▲ FIN DEL BLOQUE ACTUALIZADO ▲▲▲
  });

  
}
