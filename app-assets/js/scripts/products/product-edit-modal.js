'use strict';

// Creamos un objeto global para gestionar el modal de edición.
const ProductEditManager = {
    datatable: null,
    modal: null,
    currentRow: null,
    
    /**
     * Método público para abrir el modal para una fila específica.
     * Será llamado desde otros módulos.
     */
    openModal: function(rowElement) {
        console.log('ProductEditManager.openModal() fue llamado.', rowElement);
        $('.modal').modal('hide');
        this.currentRow = rowElement;
        const rowData = this.datatable.row(this.currentRow).data();
        
        if (rowData) {
            this._populateForm(rowData);
            this.modal.show();
        }

                setTimeout(() => {
            if (rowElement) {
                this.currentRow = rowElement;
                const rowData = this.datatable.row(this.currentRow).data();
                
                if (rowData) {
                    this._populateForm(rowData);
                    this.modal.show();
                } else {
                    console.error('No se pudieron obtener los datos de la fila');
                }
            } else {
                console.error('No se proporcionó una fila válida');
            }
        }, 300);
    },
    
    /**
     * Método privado para rellenar el formulario (empieza con _).
     */
    _populateForm: function(data) {
        $('#edit-product-id').val(data.id);
        $('#edit-product-name').val(data.name);
        $('#edit-product-sku').val(data.sku);
        $('#edit-product-ean').val(data.ean);
        $('#edit-product-group').val(data.product_group || 'Default');
        $('#edit-qty-total').val(data.quantity);
        $('#edit-qty-available').val(data.reservableQuantity);
        $('#edit-qty-reserved').val(data.announcedQuantity);
        $('#edit-qty-virtual').val(data.virtualQuantity);
        $('#edit-product-weight').val(data.weight);
        $('#edit-product-volume').val(data.unitVolume);
        $('#edit-product-barcode').val(data.barcode);
    },
    
    /**
     * Método privado para manejar el envío del formulario.
     */
    _handleFormSubmit: function(event) {
        event.preventDefault();
        
        const updatedData = {
            id: $('#edit-product-id').val(),
            name: $('#edit-product-name').val(),
            ean: $('#edit-product-ean').val(),
            product_group: $('#edit-product-group').val(),
            quantity: $('#edit-qty-total').val(),
            reservableQuantity: $('#edit-qty-available').val(),
            announcedQuantity: $('#edit-qty-reserved').val(),
            virtualQuantity: $('#edit-qty-virtual').val(),
            weight: $('#edit-product-weight').val(),
            unitVolume: $('#edit-product-volume').val(),
            barcode: $('#edit-product-barcode').val(),
            sku: this.datatable.row(this.currentRow).data().sku, 
            customer: this.datatable.row(this.currentRow).data().customer,
            status: this.datatable.row(this.currentRow).data().status,
            createdAt: this.datatable.row(this.currentRow).data().createdAt,
            updatedAt: new Date().toISOString().slice(0, 10)
        };
        
        // TODO: BACKEND - Llamada a la API para guardar los datos.
        console.log('Enviando datos actualizados al servidor:', updatedData);

        this.datatable.row(this.currentRow).data(updatedData).draw();
        this.modal.hide();
    }
};

/**
 * Función de inicialización que configura el gestor.
 */
function initializeProductEditModal(datatable) {
    // Configura las propiedades del gestor
    ProductEditManager.datatable = datatable;
    ProductEditManager.modal = new bootstrap.Modal(document.getElementById('productEditModal'));

    // El listener del clic en la tabla ahora solo llama al gestor.
    $('body').on('click', '#product-table .item-edit', function () {
        ProductEditManager.openModal($(this).closest('tr'));
    });

    // El listener del formulario ahora solo llama al gestor.
    $('#product-edit-form').on('submit', function(e) {
        ProductEditManager._handleFormSubmit(e);
    });
}