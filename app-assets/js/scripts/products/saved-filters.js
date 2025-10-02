'use strict';

// 👇 ESTA LÍNEA ES LA QUE FALTA Y CAUSA EL ERROR
let hasSavedFiltersBeenInitialized = false;

function initializeSavedFilters(config) {
    // Si ya se ha inicializado, no hacemos nada y salimos para evitar errores.
    if (hasSavedFiltersBeenInitialized) {
        return;
    }
    
    // --- REFERENCIAS A ELEMENTOS ---
    const currentViewNameSpan = $('#current-view-name');
    const savedViewsDropdownMenu = $('#saved-views-dropdown-menu');
    const saveViewModalElement = document.getElementById('saveViewModal');
    const saveViewForm = $('#save-view-form');
    let activeViewName = 'Unsaved View';

    // --- LÓGICA DE FOCO PARA ACCESIBILIDAD ---
    let modalTriggerElement = null; 
    if (saveViewModalElement) {
        saveViewModalElement.addEventListener('show.bs.modal', function (event) {
            modalTriggerElement = event.relatedTarget;
        });
        saveViewModalElement.addEventListener('hidden.bs.modal', function () {
            if (modalTriggerElement) modalTriggerElement.focus();
        });
    }

    // --- FUNCIONES INTERNAS ---
    function getValues() { const filters = {}; config.filterInputIds.forEach(id => filters[id] = $('#' + id).val()); return filters; }
    
    function updateUI() { 
        currentViewNameSpan.text(activeViewName); 
        const saveBtn = $('#save-view-btn-dropdown'); 
        const isAnyActive = config.filterInputIds.some(id => { const val = $('#' + id).val(); return Array.isArray(val) ? val.length > 0 : (val && val !== ''); }); 
        saveBtn.toggleClass('disabled', !isAnyActive); 
        const allViews = JSON.parse(localStorage.getItem(config.storageKey)) || {}; 
        savedViewsDropdownMenu.empty(); 
        savedViewsDropdownMenu.append('<li><h6 class="dropdown-header">Saved Views</h6></li>'); 
        if (Object.keys(allViews).length > 0) { 
            for (const viewName in allViews) { 
                const item = $(`<li class="d-flex align-items-center justify-content-between"><a class="dropdown-item w-100" href="#" data-view-name="${viewName}">${viewName}</a><button class="btn btn-sm btn-icon btn-flat-danger delete-view-btn me-1" data-view-name="${viewName}"><i data-feather="trash-2"></i></button></li>`); 
                savedViewsDropdownMenu.append(item); 
            } 
        } else { 
            savedViewsDropdownMenu.append('<li><span class="dropdown-item-text">No saved views.</span></li>'); 
        } 
        savedViewsDropdownMenu.append('<li><hr class="dropdown-divider"></li>'); 
        savedViewsDropdownMenu.append('<li><a class="dropdown-item" href="#" id="save-view-btn-dropdown" data-bs-toggle="modal" data-bs-target="#saveViewModal"><i data-feather="save" class="me-50"></i>Save Current View</a></li>'); 
        if (feather) feather.replace(); 
    }

    // --- ASIGNACIÓN DE EVENTOS ---
    saveViewForm.on('submit', function(e) { 
        e.preventDefault(); 
        const viewName = $('#view-name-input').val(); 
        if (!viewName) return; 
        const allViews = JSON.parse(localStorage.getItem(config.storageKey)) || {}; 
        allViews[viewName] = getValues(); 
        localStorage.setItem(config.storageKey, JSON.stringify(allViews)); 
        activeViewName = viewName; 
        updateUI(); 
        bootstrap.Modal.getInstance(saveViewModalElement).hide(); 
        $('#view-name-input').val(''); 
    });

    savedViewsDropdownMenu.on('click', 'a[data-view-name]', function(e) { 
        e.preventDefault(); 
        const viewName = $(this).data('view-name'); 
        const allViews = JSON.parse(localStorage.getItem(config.storageKey)) || {}; 
        const viewToApply = allViews[viewName]; 
        if (viewToApply) { 
            config.filterInputIds.forEach(id => $('#' + id).val(viewToApply[id])); 
            $('.select2').trigger('change'); 
            activeViewName = viewName; 
            config.filterFunction(config.datatable); 
        } 
    });

    savedViewsDropdownMenu.on('click', '.delete-view-btn', function(e) { 
        e.stopPropagation(); 
        const viewName = $(this).data('view-name'); 
        if (confirm(`Delete the view "${viewName}"?`)) { 
            const allViews = JSON.parse(localStorage.getItem(config.storageKey)) || {}; 
            delete allViews[viewName]; 
            localStorage.setItem(config.storageKey, JSON.stringify(allViews)); 
            if (activeViewName === viewName) activeViewName = 'Unsaved View'; 
            updateUI(); 
        } 
    });

    $(config.filterInputIds.join(', ')).on('input change keyup', function() { 
        activeViewName = 'Unsaved View'; 
        updateUI(); 
    });

    // --- PRIMERA EJECUCIÓN ---
    updateUI();
    hasSavedFiltersBeenInitialized = true;
}