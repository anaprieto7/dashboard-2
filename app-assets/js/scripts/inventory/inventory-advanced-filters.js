'use strict';

function initializeInventoryAdvancedFilters(datatable, filterFunction) {
  const applyBtn = $('#apply-advanced-inventory-filters-btn');
  const resetBtn = $('#reset-advanced-inventory-filters-btn');

  if (applyBtn.length) {
    applyBtn.on('click', function () {
      console.log('Aplicando filtros avanzados de inventario...');
      filterFunction(datatable);
    });
  }

  if (resetBtn.length) {
    resetBtn.on('click', function () {
      console.log('Reseteando filtros avanzados de inventario...');
      // Limpia los campos de este panel
      $('#min-sku-filter, #max-sku-filter, #min-available-filter, #max-available-filter, #min-volume-filter, #max-volume-filter').val('');
      // Vuelve a aplicar todos los filtros (ahora sin los avanzados)
      filterFunction(datatable);
    });
  }
}