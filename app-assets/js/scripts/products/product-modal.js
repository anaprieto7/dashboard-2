'use strict';

$(function () {
    // ===================================================================================
    // 1. DECLARACIÓN DE VARIABLES
    // ===================================================================================
    const detailsModalElement = document.getElementById('productDetailsModal');
    const detailsModal = new bootstrap.Modal(detailsModalElement);
    let currentRowForActions = null; // Variable para guardar la fila actual
    let shouldOpenEditModal = false; // Flag para controlar la transición entre modales

    // ===================================================================================
    // 2. DEFINICIÓN DE FUNCIONES
    // ===================================================================================

    /**
     * Rellena el modal de detalles con los datos de una fila.
     * @param {object} data - El objeto de datos de la fila de DataTables.
     */
    function populateDetailsModal(data) {
        $('#modalProductName').text(data.name || 'N/A');
        $('#modalProductSKU').text('SKU: ' + (data.sku || 'N/A'));
        $('#modalProductEAN').text(data.ean || 'N/A');
        $('#modalProductGroup').text(data.product_group || 'Default');

        // Inventario
        $('#modalQtyTotal').text(data.quantity || 0);
        $('#modalQtyAvailable').text(data.reservableQuantity || 0);
        $('#modalQtyReserved').text(data.announcedQuantity || 0);
        $('#modalQtyVirtual').text(data.virtualQuantity || 0);

        // Atributos físicos
        $('#modalProductDimensions').text(data.dimensions || 'N/A');
        $('#modalProductVolume').text(data.unitVolume ? data.unitVolume + ' cm³' : 'N/A');
        $('#modalProductWeight').text(data.weight ? data.weight + ' g' : 'N/A');
        
        // Barcode
        const barcodeValue = data.barcode || '';
        $('#modalProductBarcodeText').text(barcodeValue);
        if (window.JsBarcode && barcodeValue) {
            try {
                JsBarcode("#modalProductBarcodeImg", barcodeValue);
            } catch (e) {
                console.error("Error generating barcode", e);
            }
        }
    }

    // ===================================================================================
    // 3. ASIGNACIÓN DE EVENTOS
    // ===================================================================================

    // Listener para el icono de información en la tabla (tu versión robusta)
    $('body').on('click', '#product-table .view-info-btn', function () {
        const dataTable = $('#product-table').DataTable();
        currentRowForActions = $(this).closest('tr'); // Guarda la referencia a la fila
        const rowData = dataTable.row(currentRowForActions).data();
        
        if (rowData) {
            populateDetailsModal(rowData);
            detailsModal.show();
        }
    });

    // Listener para el botón "Edit Product" DENTRO del modal de detalles
    $('#editProductBtn').on('click', function() {
        if (currentRowForActions) {
            $(this).blur(); // <-- ¡NUEVA LÍNEA! Quita el foco del botón para evitar conflictos.
            shouldOpenEditModal = true;
            detailsModal.hide();
        }
    });

    // Listener que se dispara DESPUÉS de que el modal de detalles se haya cerrado
    detailsModalElement.addEventListener('hidden.bs.modal', function (event) {
        if (shouldOpenEditModal && currentRowForActions) {
            // Mensaje de depuración para confirmar que se dispara el evento
            console.log('View modal closed. Triggering click on edit icon...');
            // Simula un clic en el botón de editar de la fila guardada.
            // Esto activa la lógica en 'product-edit-modal.js'.
            $(currentRowForActions).find('.item-edit').trigger('click');
        }
        // Resetea el flag para la próxima vez
        shouldOpenEditModal = false;
    });
});

