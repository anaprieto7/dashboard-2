'use strict';

/**
 * Módulo para gestionar las Vistas de Filtros Guardadas con un menú desplegable mejorado.
 */
function initializeSavedFilters(datatable) {
    // ... (El bloque 1. de variables no cambia) ...
    // ===================================================================================
    // 1. DECLARACIÓN DE CONSTANTES Y VARIABLES
    // ===================================================================================
    const savedViewsBtn = $('#saved-views-btn');
    const currentViewNameSpan = $('#current-view-name');
    const savedViewsDropdownMenu = $('#saved-views-dropdown-menu');
    const saveViewModalElement = document.getElementById('saveViewModal');
    const saveViewModal = new bootstrap.Modal(saveViewModalElement);
    const saveViewForm = $('#save-view-form');
    const viewNameInput = $('#view-name-input');

    const storageKey = 'productFilterViews_user1';
    const filterInputIds = [
        'main-search', 'customer-filter', 'status-filter', 'min-stock-filter',
        'sku-filter', 'ean-barcode-filter', 'min-qty', 'max-qty',
        'min-reservable', 'max-reservable', 'min-weight', 'max-weight',
        'min-volume', 'max-volume', 'created-at-range', 'updated-at-range'
    ];
    let activeViewName = 'Unsaved View';

    // ===================================================================================
    // 2. DEFINICIÓN DE FUNCIONES
    // ===================================================================================

    // ... (Las funciones getCurrentFilterValues y saveFilterSet no cambian) ...
    function getCurrentFilterValues() {
        const currentFilters = {};
        filterInputIds.forEach(id => {
            currentFilters[id] = $('#' + id).val();
        });
        return currentFilters;
    }

    function saveFilterSet(viewName) {
        const newView = getCurrentFilterValues();
        const allViews = JSON.parse(localStorage.getItem(storageKey)) || {};
        
        if (allViews[viewName] && !confirm(`A view named "${viewName}" already exists. Do you want to overwrite it?`)) {
            return;
        }

        allViews[viewName] = newView;

        // TODO: BACKEND - Llamada a la API para guardar la vista.
        localStorage.setItem(storageKey, JSON.stringify(allViews));
        console.log(`View saved: "${viewName}"`, newView);

        activeViewName = viewName;
        loadAndPopulateViews();
        updateUIState();
    }

    /**
     * Carga las vistas desde localStorage y construye el menú desplegable (VERSIÓN MEJORADA).
     */
    function loadAndPopulateViews() {
        const allViews = JSON.parse(localStorage.getItem(storageKey)) || {};
        savedViewsDropdownMenu.empty();

        savedViewsDropdownMenu.append('<li><h6 class="dropdown-header">Saved Views</h6></li>');

        if (Object.keys(allViews).length === 0) {
            savedViewsDropdownMenu.append('<li><span class="dropdown-item-text fst-italic text-muted">No saved views yet.</span></li>');
        } else {
            for (const viewName in allViews) {
                const isActive = viewName === activeViewName;
                const activeClass = isActive ? 'active' : '';
                const checkIcon = isActive ? '<i data-feather="check" class="me-50"></i>' : '';

                const itemHtml = `
                    <li class="d-flex align-items-center justify-content-between saved-view-item">
                        <a class="dropdown-item view-item-link ${activeClass}" href="#" data-view-name="${viewName}">
                            ${checkIcon}
                            <span>${viewName}</span>
                        </a>
                        <button type="button" class="btn btn-sm btn-icon btn-flat-danger delete-view-btn me-1" data-view-name="${viewName}" title="Delete view">
                            <i data-feather="trash-2" class="font-small-4"></i>
                        </button>
                    </li>`;
                savedViewsDropdownMenu.append(itemHtml);
            }
        }

        savedViewsDropdownMenu.append('<li><hr class="dropdown-divider"></li>');
        savedViewsDropdownMenu.append(`
            <li>
                <a class="dropdown-item" href="#" id="save-view-btn-dropdown" data-bs-toggle="modal" data-bs-target="#saveViewModal">
                    <i data-feather="save" class="me-50"></i> Save Current View
                </a>
            </li>`);

        if (feather) feather.replace();
    }

    // ... (El resto de las funciones applyFilterSet, deleteFilterSet, etc. no cambian) ...
    function applyFilterSet(viewName) {
        const allViews = JSON.parse(localStorage.getItem(storageKey)) || {};
        const viewToApply = allViews[viewName];

        if (!viewToApply) return;

        filterInputIds.forEach(id => {
            const element = $('#' + id);
            const value = viewToApply[id];
            element.val(value);
            if (element.hasClass('date-range-picker') && element[0]._flatpickr) {
                element[0]._flatpickr.setDate(value, false);
            }
        });

        $('#customer-filter, #status-filter').trigger('change.select2');
        applyAllFilters(datatable);
        activeViewName = viewName;
        loadAndPopulateViews(); // Recargamos para actualizar el icono de check
        updateUIState();
    }
    
    function deleteFilterSet(viewName) {
        if (!confirm(`Are you sure you want to delete the view "${viewName}"?`)) return;

        const allViews = JSON.parse(localStorage.getItem(storageKey)) || {};
        delete allViews[viewName];
        
        // TODO: BACKEND - Llamada a la API para eliminar la vista.
        localStorage.setItem(storageKey, JSON.stringify(allViews));
        
        if (activeViewName === viewName) {
            activeViewName = 'Unsaved View';
        }
        loadAndPopulateViews();
        updateUIState();
    }

    function isAnyFilterActive() {
        const currentFilters = getCurrentFilterValues();
        for (const id in currentFilters) {
            const value = currentFilters[id];
            if (Array.isArray(value) ? value.length > 0 : (value && value !== '')) {
                return true;
            }
        }
        return false;
    }

    function updateUIState() {
        currentViewNameSpan.text(activeViewName);
        
        const saveBtnInDropdown = $('#save-view-btn-dropdown');
        if (isAnyFilterActive()) {
            saveBtnInDropdown.removeClass('disabled');
        } else {
            saveBtnInDropdown.addClass('disabled');
        }
    }

    // ===================================================================================
    // 3. ASIGNACIÓN DE EVENTOS
    // ===================================================================================
    saveViewForm.on('submit', function(e) {
        e.preventDefault();
        const viewName = viewNameInput.val();
        if (viewName) {
            saveFilterSet(viewName);
            saveViewModal.hide();
            viewNameInput.val('');
            viewNameInput.removeClass('is-invalid');
        } else {
            viewNameInput.addClass('is-invalid');
        }
    });
    
    savedViewsDropdownMenu.on('click', '.view-item-link', function(e) {
        e.preventDefault();
        const viewName = $(this).data('view-name');
        applyFilterSet(viewName);
    });

    savedViewsDropdownMenu.on('click', '.delete-view-btn', function(e) {
        e.stopPropagation();
        const viewName = $(this).data('view-name');
        deleteFilterSet(viewName);
    });
    
    $('.form-control, .form-select').on('input change keyup', function() {
        activeViewName = 'Unsaved View';
        // Recargamos el menú para quitar el 'check' de la vista que ya no está activa
        loadAndPopulateViews(); 
        updateUIState();
    });

    // ===================================================================================
    // 4. INICIALIZACIÓN
    // ===================================================================================
    loadAndPopulateViews();
    updateUIState();
    new bootstrap.Tooltip(savedViewsBtn);
}

