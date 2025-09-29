// Archivo: js/column-visibility.js (Actualizado)

function initializeColumnVisibility(datatable) {
    const modalBody = $('#colvis-modal-body');
    
    // Limpiamos el contenido previo para evitar duplicados si se llama varias veces
    modalBody.empty();

    const columnGroups = {
        'General Info': [1, 2, 3, 4, 5],
        'Inventory Details': [6, 7, 8, 9],
        'Measurements': [10, 11],
        'Timestamps': [12, 13]
    };

    // Creamos un contenedor para cada grupo
    for (const groupName in columnGroups) {
        modalBody.append(`<h5 class="mt-2">${groupName}</h5>`);
        const groupContainer = $(`<div class="row mb-2"></div>`);
        modalBody.append(groupContainer);

        columnGroups[groupName].forEach(colIndex => {
            const column = datatable.column(colIndex);
            // Evitamos errores si la columna no existe
            if (!column.header()) return;
            
            const header = $(column.header()).text();
            const isVisible = column.visible();
            
            // --- ESTE ES EL CÓDIGO ACTUALIZADO ---
            const switchHTML = `
                <div class="form-check form-switch col-lg-6 col-md-12">
                    <input class="form-check-input colvis-checkbox" type="checkbox" role="switch" ${isVisible ? 'checked' : ''} data-column-index="${colIndex}">
                    <label class="form-check-label">${header}</label>
                </div>
            `;
            groupContainer.append(switchHTML);
        });
    }

    // El resto de la función para abrir el modal y manejar los clicks no cambia.
    // Asegurémonos de que el listener del botón solo se añade una vez.
    $('#colvis-btn').off('click').on('click', function () {
        var colvisModal = new bootstrap.Modal(document.getElementById('colvis-modal'));
        colvisModal.show();
    });

   modalBody.off('change').on('change', '.colvis-checkbox', function () {
        const columnIndex = $(this).data('column-index');
        const column = datatable.column(columnIndex);
        column.visible(this.checked);

        // Guardar el estado en localStorage
        const visibilityState = datatable.columns().visible().toArray();
        localStorage.setItem('productTableColumnVisibility', JSON.stringify(visibilityState));
    });
}