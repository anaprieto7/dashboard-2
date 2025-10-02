'use strict';

// MODIFICADO: Ahora recibe el módulo de savedFilters como argumento
function initializeClearFilters(config, savedFiltersModule) {
  const clearBtn = $('#clear-all-filters-btn');

  if (clearBtn.length) {
    clearBtn.on('click', function() {
      console.log('Limpiando todos los filtros y reseteando la vista...');
      
      config.filterInputs.forEach(filter => {
        const el = $(filter.id);
        if (filter.type === 'select2') {
          el.val(null);
        } else {
          el.val('');
        }
      });
      $('.select2').trigger('change');

      // ¡CLAVE! Llamamos directamente a la función de reseteo del otro módulo.
      if (savedFiltersModule) {
        savedFiltersModule.reset();
      }

      config.filterFunction(config.datatable);
    });
  }
}