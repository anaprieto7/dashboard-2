'use strict';

// Esta variable guardará la función que actualiza la UI
let updateActiveFiltersUI;

function initializeActiveFiltersManager(config) {
  const pillsContainer = $('#pills-container');
  const activeFiltersSection = $('#active-filters-section');

  // Definimos la función que se encargará de todo
  updateActiveFiltersUI = function() {
    pillsContainer.empty();
    let hasActiveFilters = false;

    const createPill = (label, value, clearCallback) => {
      hasActiveFilters = true;
      const pill = $(`
        <span class="badge rounded-pill badge-light-primary">
          ${label}: <strong>${value}</strong>
          <button type="button" class="btn-close ms-50" aria-label="Close"></button>
        </span>`);
      
      pill.find('.btn-close').on('click', function() {
        console.log(`Limpiando píldora: ${label}`);
        clearCallback();
        // ¡CLAVE! Llama a la función de filtrado principal para refrescar la tabla.
        config.filterFunction(config.datatable); 
      });

      pillsContainer.append(pill);
    };

    // --- Revisa cada filtro de la configuración ---
    config.filterInputs.forEach(filter => {
      const el = $(filter.id);
      let value = el.val();

      if (filter.type === 'select2') {
        value = value || [];
        value.forEach(itemValue => {
          createPill(filter.label, itemValue, () => {
            const currentSelection = el.val();
            const newSelection = currentSelection.filter(c => c !== itemValue);
            el.val(newSelection).trigger('change');
          });
        });
      } else if (value) {
        createPill(filter.label, value, () => el.val(''));
      }
    });

    activeFiltersSection.toggleClass('d-none', !hasActiveFilters);
  };
  
  return updateActiveFiltersUI;
}