// Archivo: js/export-actions.js

'use strict';

function initializeExportActions(datatable) {
    // Escucha los clics en cada enlace del menú
    $('#export-print').on('click', function (e) {
        e.preventDefault(); // Previene la acción por defecto del enlace
        datatable.buttons('.buttons-print').trigger(); // Dispara el botón de Imprimir de DataTables
    });

    $('#export-csv').on('click', function (e) {
        e.preventDefault();
        datatable.buttons('.buttons-csv').trigger(); // Dispara el botón de CSV
    });

    $('#export-excel').on('click', function (e) {
        e.preventDefault();
        datatable.buttons('.buttons-excel').trigger(); // Dispara el botón de Excel
    });

    $('#export-pdf').on('click', function (e) {
        e.preventDefault();
        datatable.buttons('.buttons-pdf').trigger(); // Dispara el botón de PDF
    });

    $('#export-copy').on('click', function (e) {
        e.preventDefault();
        datatable.buttons('.buttons-copy').trigger(); // Dispara el botón de Copiar
    });
}