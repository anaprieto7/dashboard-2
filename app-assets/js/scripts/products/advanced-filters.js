'use strict';

/**
 * Módulo para inicializar los filtros avanzados, usando la librería Date Range Picker.
 */
function initializeAdvancedFilters(datatable) {
    
    function createDateRangePicker(selector) {
        const element = $(selector);
        
        const ranges = {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        };

        element.daterangepicker({
            ranges: ranges,
            opens: 'left',
            alwaysShowCalendars: true, // <-- ¡CLAVE 1! Muestra siempre los calendarios.
            autoUpdateInput: false, 
            locale: {
                format: 'YYYY-MM-DD',
                separator: ' to ',
                applyLabel: 'Apply',
                cancelLabel: 'Clear',
            }
        });

        element.on('apply.daterangepicker', function(ev, picker) {
            const value = picker.startDate.format('YYYY-MM-DD') + ' to ' + picker.endDate.format('YYYY-MM-DD');
            $(this).val(value).trigger('change'); 
        });

        element.on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('').trigger('change');
        });
    }

    // --- Inicialización ---
    createDateRangePicker('#created-at-range');
    createDateRangePicker('#updated-at-range');

    // --- Listeners de los botones del panel ---
    $('#apply-offcanvas-filters-btn').on('click', function() {
        applyAllFilters(datatable);
        const collapseElement = document.getElementById('advancedFiltersCollapse');
        if (collapseElement) {
            const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement, {toggle: false});
            bsCollapse.hide();
        }
    });

    $('#reset-offcanvas-filters-btn').on('click', function() {
        $('.advanced-filter-input').val('').trigger('change');
        applyAllFilters(datatable);
    });
}