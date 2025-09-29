'use strict';

/**
 * MOTOR 1: Inicializa un filtro de tipo Select2 para selección MÚLTIPLE.
 * @param {object} datatable La instancia de la DataTable a filtrar.
 * @param {object} options Opciones de configuración.
 */
function initializeSelectFilter(datatable, options) {
    const selectElement = $(options.selector);

    selectElement.on('change', function () {
        const selectedValues = $(this).val();
        let searchTerm = '';

        if (selectedValues && selectedValues.length > 0) {
            const escapedValues = selectedValues.map(value => 
                value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
            );
            searchTerm = '^(' + escapedValues.join('|') + ')$';
        }

        datatable.column(options.columnIndex).search(searchTerm, true, false).draw();

        if (options.onUpdate) {
            options.onUpdate();
        }
    });
}

/**
 * MOTOR 2: Inicializa un filtro para un <select> de valor ÚNICO.
 * @param {object} datatable La instancia de la DataTable a filtrar.
 * @param {object} options Opciones de configuración.
 */
function initializeSingleValueSelectFilter(datatable, options) {
    const selectElement = $(options.selector);

    selectElement.on('change', function () {
        const value = $(this).val();
        const searchTerm = value ? '^' + value + '$' : '';

        datatable.column(options.columnIndex).search(searchTerm, true, false).draw();

        if (options.onUpdate) {
            options.onUpdate();
        }
    });
}

/**
 * MOTOR 3: Inicializa un selector de RANGO DE FECHA avanzado.
 * @param {string} selector El selector del elemento input al que se adjuntará (ej. '#my-date-picker').
 */
function initializeDateRangePicker(selector) {
    const element = $(selector);

    if (!element.length) {
        console.error('Date Range Picker target element not found:', selector);
        return;
    }
        
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
        alwaysShowCalendars: true,
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
