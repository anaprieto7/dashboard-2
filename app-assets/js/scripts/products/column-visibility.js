// Archivo: js/column-visibility.js (Corregido)

function initializeColumnVisibility(datatable) {
    const modalBody = $('#colvis-modal-body');
    
    // Limpiar contenido previo
    modalBody.empty();

    const columnGroups = {
        'General Info': [1, 2, 3, 4, 5],
        'Inventory Details': [6, 7, 8, 9],
        'Measurements': [10, 11],
        'Timestamps': [12, 13]
    };

    // Cargar estado guardado o usar estado por defecto
    const savedVisibility = localStorage.getItem('productTableColumnVisibility');
    let visibilityState;
    
    if (savedVisibility) {
        visibilityState = JSON.parse(savedVisibility);
    } else {
        // Estado por defecto: todas visibles
        visibilityState = Array(datatable.columns().count()).fill(true);
        localStorage.setItem('productTableColumnVisibility', JSON.stringify(visibilityState));
    }

    // Aplicar estado guardado al DataTable
    visibilityState.forEach((isVisible, index) => {
        if (datatable.column(index).visible() !== isVisible) {
            datatable.column(index).visible(isVisible);
        }
    });

    // Crear interfaz de switches
    for (const groupName in columnGroups) {
        modalBody.append(`<h5 class="mt-2">${groupName}</h5>`);
        const groupContainer = $(`<div class="row mb-2"></div>`);
        modalBody.append(groupContainer);

        columnGroups[groupName].forEach(colIndex => {
            const column = datatable.column(colIndex);
            if (!column.header()) return;
            
            const header = $(column.header()).text();
            const isVisible = column.visible();
            
            const switchHTML = `
                <div class="form-check form-switch col-lg-6 col-md-12">
                    <input class="form-check-input colvis-checkbox" type="checkbox" role="switch" 
                           ${isVisible ? 'checked' : ''} 
                           data-column-index="${colIndex}">
                    <label class="form-check-label">${header}</label>
                </div>
            `;
            groupContainer.append(switchHTML);
        });
    }

    // Botón para abrir modal (evitar múltiples listeners)
    $('#colvis-btn').off('click').on('click', function () {
        // Re-crear la interfaz cada vez que se abre el modal para reflejar cambios
        initializeColumnVisibility(datatable);
        var colvisModal = new bootstrap.Modal(document.getElementById('colvis-modal'));
        colvisModal.show();
    });

    // Manejar cambios en los switches
    modalBody.off('change', '.colvis-checkbox').on('change', '.colvis-checkbox', function () {
        const columnIndex = $(this).data('column-index');
        const isChecked = $(this).is(':checked');
        
        // Aplicar cambio al DataTable
        datatable.column(columnIndex).visible(isChecked);
        
        // Forzar redibujado
        datatable.columns.adjust().draw();
        
        // Guardar nuevo estado
        const newVisibilityState = datatable.columns().visible().toArray();
        localStorage.setItem('productTableColumnVisibility', JSON.stringify(newVisibilityState));
        
        console.log(`Columna ${columnIndex} visibility:`, isChecked);
        console.log('Estado guardado:', newVisibilityState);
    });
}

// Eliminar el código suelto del final que causa error