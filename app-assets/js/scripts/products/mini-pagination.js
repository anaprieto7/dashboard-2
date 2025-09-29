// Archivo: js/mini-pagination.js

'use strict';

function initializeMiniPagination(datatable) {
    const container = $('#mini-pagination-container');

    // Función para actualizar el texto y los botones
    function updateMiniPagination() {
        // Obtenemos toda la información de la página actual desde la API de DataTables
        const info = datatable.page.info();

        // Si no hay registros (después de filtrar), no mostramos nada
        if (info.recordsDisplay === 0) {
            container.html('');
            return;
        }
        
        // Construimos el texto "1-10 von 100"
        const pageInfoText = `${info.start + 1} - ${info.end} von ${info.recordsDisplay}`;

        // Creamos el HTML para el control
        const controlHTML = `
            <a href="javascript:;" class="page-prev me-1 ${info.page === 0 ? 'disabled' : ''}">
                <i data-feather="chevron-left" class="small text-muted"></i>
            </a>
            <span class=" small text-muted">${pageInfoText}</span>
            <a href="javascript:;" class="page-next ms-1 ${info.page + 1 === info.pages ? 'disabled' : ''}">
                <i data-feather="chevron-right" class="small text-muted"></i>
            </a>
        `;

        container.html(controlHTML);
        feather.replace(); // Re-renderizamos los iconos de Feather
    }

    // --- EVENTOS ---

    // 1. Cada vez que la tabla se redibuja (cambio de página, filtro, etc.), actualizamos nuestro control.
    datatable.on('draw', updateMiniPagination);

    // 2. Añadimos los listeners para los clics en nuestros nuevos botones
    container.on('click', '.page-prev:not(.disabled)', function () {
        datatable.page('previous').draw('page');
    });

    container.on('click', '.page-next:not(.disabled)', function () {
        datatable.page('next').draw('page');
    });

    // 3. Llamada inicial para que se muestre el control al cargar la página
    updateMiniPagination();
}