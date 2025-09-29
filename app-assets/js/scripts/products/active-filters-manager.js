'use strict';

function updateActiveFiltersUI() {
    // Definimos TODOS los filtros posibles, primarios y avanzados
    const filters = {
        search: { el: $('#main-search'), label: 'Search' },
        customer: { el: $('#customer-filter'), label: 'Customer' },
        status: { el: $('#status-filter'), label: 'Status' },
        minStock: { el: $('#min-stock-filter'), label: 'Min. Stock' },
        qty: { els: [$('#min-qty'), $('#max-qty')], label: 'Quantity' },
        reservable: { els: [$('#min-reservable'), $('#max-reservable')], label: 'Reservable Qty' },
        weight: { els: [$('#min-weight'), $('#max-weight')], label: 'Weight' },
        volume: { els: [$('#min-volume'), $('#max-volume')], label: 'Volume' },
        createdAt: { el: $('#created-at-range'), label: 'Created' },
        updatedAt: { el: $('#updated-at-range'), label: 'Updated' },
        sku: { el: $('#sku-filter'), label: 'SKU' },
        eanBarcode: { el: $('#ean-barcode-filter'), label: 'EAN/Barcode' }
    };

    const container = $('#pills-container');
    container.html('');
    let hasActiveFilters = false;

    for (const key in filters) {
        let value = '';

        // Lógica para rangos (min/max)
        if (filters[key].els) {
            const minVal = filters[key].els[0].val();
            const maxVal = filters[key].els[1].val();
            if (minVal && maxVal) value = `${minVal} - ${maxVal}`;
            else if (minVal) value = `> ${minVal}`;
            else if (maxVal) value = `< ${maxVal}`;
        }
        // Lógica para select múltiple (customer)
        else if (key === 'customer') {
            const items = filters[key].el.val();
            if (items && items.length > 0) {
                hasActiveFilters = true;
                items.forEach(item => {
                    const itemText = filters[key].el.find(`option[value="${item}"]`).text();
                    container.append(`
                        <span class="badge rounded-pill bg-light-primary me-25 me-1 px-75 py-75 fs-6">
                            ${filters[key].label}: ${itemText}
                           <span class="ms-1 cursor-pointer remove-filter" data-filter-key="${key}" data-filter-value="${item}">&times;</span>
                        </span>`);
                });
            }
            continue; // Saltamos al siguiente filtro
        }
        // Lógica para filtros simples
        else {
            value = filters[key].el.val();
        }

        if (value && value.length > 0) {
            hasActiveFilters = true;
            container.append(`
                <span class="badge rounded-pill bg-light-primary me-25 me-1 px-75 py-75 fs-6">
                    ${filters[key].label}: ${value}
                   <span class="ms-1 cursor-pointer remove-filter" data-filter-key="${key}">&times;</span>
                </span>`);
        }
    }

    $('#active-filters-section').toggleClass('d-none', !hasActiveFilters);
}

/**
 * Inicializa el listener para eliminar las "pills" al hacer clic en la 'x'.
 * @param {object} datatable - La instancia de la DataTable.
 */
function initializePillRemoval(datatable) {
    $('#pills-container').on('click', '.remove-filter', function() {
        const filterKey = $(this).data('filter-key');
        
        // Lógica para limpiar el filtro correspondiente
        switch (filterKey) {
            case 'search': $('#main-search').val(''); break;
            case 'minStock': $('#min-stock-filter').val(''); break;
            case 'sku': $('#sku-filter').val(''); break;
            case 'eanBarcode': $('#ean-barcode-filter').val(''); break;
            case 'qty': $('#min-qty, #max-qty').val(''); break;
            case 'reservable': $('#min-reservable, #max-reservable').val(''); break;
            case 'weight': $('#min-weight, #max-weight').val(''); break;
            case 'volume': $('#min-volume, #max-volume').val(''); break;
            
            // --- LÓGICA CORREGIDA PARA DATE RANGE PICKER ---
            // Simplemente borramos el valor del input. 
            // La llamada a applyAllFilters se encargará del resto.
            case 'createdAt':
                $('#created-at-range').val('');
                break;
            case 'updatedAt':
                $('#updated-at-range').val('');
                break;
            
            // Los filtros modulares se resetean y disparan su propio evento de actualización
            case 'status':
                $('#status-filter').val(null).trigger('change');
                return; // Salimos para evitar la llamada duplicada
            case 'customer':
                const filterValue = $(this).data('filter-value');
                const newSelection = $('#customer-filter').val().filter(item => item !== filterValue);
                $('#customer-filter').val(newSelection).trigger('change');
                return; // Salimos para evitar la llamada duplicada
        }
        
        // Para todos los filtros no modulares, llamamos a la función maestra.
        applyAllFilters(datatable);
    });
}

