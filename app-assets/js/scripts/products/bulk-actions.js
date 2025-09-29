'use strict';

function initializeBulkActions(datatable) {
    const selectAllCheckbox = $('#select-all-checkbox');
    const bulkActionContainer = $('#bulk-action-container');
    const tableBody = $('#product-table tbody');

    function updateBulkActionVisibility() {
        const selectedCount = $('.row-checkbox:checked').length;
        bulkActionContainer.toggleClass('d-none', selectedCount === 0);
        const totalCheckboxes = $('.row-checkbox').length;
        selectAllCheckbox.prop('checked', selectedCount > 0 && selectedCount === totalCheckboxes);
    }
    
    selectAllCheckbox.on('change', function() {
        $('.row-checkbox').prop('checked', this.checked);
        updateBulkActionVisibility();
    });

    tableBody.on('change', '.row-checkbox', function() {
        updateBulkActionVisibility();
    });
    
    datatable.on('draw', function() {
        updateBulkActionVisibility();
    });

    updateBulkActionVisibility(); // Llamada inicial
}