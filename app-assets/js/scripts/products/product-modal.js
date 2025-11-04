'use strict';

$(function () {
    // ===================================================================================
    // 1. DECLARACIÓN DE VARIABLES
    // ===================================================================================
    const detailsModalElement = document.getElementById('productDetailsModal');
    const detailsModal = new bootstrap.Modal(detailsModalElement);
    let currentRowForActions = null; // Variable para guardar la fila actual
    let currentProductData = null; // Guardar los datos del producto

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
        
        // Guardar los datos actuales
        currentProductData = data;
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
        if (currentRowForActions && currentProductData) {
            $(this).blur(); // Quita el foco del botón para evitar conflictos.
            
            // Cerrar el modal de detalles primero
            detailsModal.hide();
            
            // Esperar a que el modal de detalles se cierre completamente
            $(detailsModalElement).on('hidden.bs.modal', function() {
                // Limpiar el evento
                $(detailsModalElement).off('hidden.bs.modal');
                
                // Abrir el modal de edición directamente
                if (typeof ProductEditManager !== 'undefined') {
                    console.log('Opening edit modal from view modal...');
                    ProductEditManager.openModal(currentRowForActions);
                } else {
                    console.error('ProductEditManager is not defined');
                }
            });
        }
    });

    // Elimina o comenta el listener antiguo que causaba problemas
    /*
    detailsModalElement.addEventListener('hidden.bs.modal', function (event) {
        // Este listener ya no es necesario porque manejamos la transición en el click del botón editar
    });
    */
});