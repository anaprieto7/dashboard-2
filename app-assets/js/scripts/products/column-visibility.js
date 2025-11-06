// CÓDIGO ACTUALIZADO: app-assets/js/scripts/products/column-visibility.js

function initializeColumnVisibility(datatable, columnGroups) {
    const modalBody = $('#colvis-modal-body');
    modalBody.empty(); // Limpiar contenido previo

    // CORRECCIÓN: 
    // Usar los grupos de columnas que recibimos de app.js
    if (!columnGroups) {
        console.error('Column visibility groups not provided. Aborting modal init.');
        modalBody.append('<p>Error: Column configuration not found.</p>');
        return;
    }

    // Cargar estado guardado o usar estado por defecto
    const storageKey = datatable.table().node().id + '_columnVisibility';
    const savedVisibility = localStorage.getItem(storageKey);
    let visibilityState = {};

    if (savedVisibility) {
        visibilityState = JSON.parse(savedVisibility);
    } else {
        // Estado por defecto: se construye desde los grupos
        for (const groupName in columnGroups) {
            columnGroups[groupName].forEach(colIndex => {
                const column = datatable.column(colIndex);
                if (column.header()) { // Asegurarse de que la columna existe
                    visibilityState[colIndex] = column.visible();
                }
            });
        }
        localStorage.setItem(storageKey, JSON.stringify(visibilityState));
    }

    // Aplicar estado guardado al DataTable
    for (const colIndex in visibilityState) {
        if (datatable.column(colIndex).visible() !== visibilityState[colIndex]) {
            datatable.column(colIndex).visible(visibilityState[colIndex]);
        }
    }

    // Crear interfaz de switches
    for (const groupName in columnGroups) {
        modalBody.append(`<h5 class="mt-2">${groupName}</h5>`);
        const groupContainer = $(`<div class="row mb-2"></div>`);
        modalBody.append(groupContainer);

        columnGroups[groupName].forEach(colIndex => {
            const column = datatable.column(colIndex);
            
            // CORRECCIÓN: Comprobar si la columna existe antes de continuar
            if (!column.header()) {
                console.warn(`Skipping colvis for non-existent column index: ${colIndex}`);
                return; 
            }
            
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
        // Volver a llamar con los grupos para refrescar los switches
        initializeColumnVisibility(datatable, columnGroups); 
        var colvisModal = new bootstrap.Modal(document.getElementById('colvis-modal'));
        colvisModal.show();
    });

    // Manejar cambios en los switches
    modalBody.off('change', '.colvis-checkbox').on('change', '.colvis-checkbox', function () {
        const columnIndex = $(this).data('column-index');
        const isChecked = $(this).is(':checked');
        
        datatable.column(columnIndex).visible(isChecked);
        datatable.columns.adjust().draw();
        
        // Guardar nuevo estado
        const currentState = JSON.parse(localStorage.getItem(storageKey)) || {};
        currentState[columnIndex] = isChecked;
        localStorage.setItem(storageKey, JSON.stringify(currentState));
    });
}