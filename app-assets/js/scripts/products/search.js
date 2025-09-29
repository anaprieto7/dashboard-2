// Archivo: js/search.js
'use strict';
function initializeMainSearch(datatable) {
    $('#main-search').on('keyup', function () {
        datatable.search(this.value).draw();
        updateActiveFiltersUI(); // <-- AÑADIR ESTA LÍNEA
    });
}