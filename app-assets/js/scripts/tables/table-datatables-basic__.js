/**
 * data-datatable-basic.js
 *
 * Lógica refactorizada para la página de Órdenes.
 * Utiliza un patrón de módulo para mayor organización y mantenibilidad.
 */

$(function () {
    'use strict';

    const ordersPage = {
        //================================================================================
        // 1. ESTADO, CONFIGURACIÓN Y SELECTORES
        //================================================================================
        
        dataTable: null,
        assetPath: '../../../app-assets/',

        state: {
            activeMarketplace: null,
            activeStatusGroup: null,
            selectedStatuses: [],
            selectedCustomers: [],
            selectedStorage: []
        },

        elements: {
            table: $('#orders-table'), // Asegúrate que tu tabla tenga id="orders-table"
            statusFilter: $('#status-filter'),
            customerFilter: $('#customer-filter'),
            storageFilter: $('#storage-filter'),
            searchInput: $('#search-input'),
            activeFilters: $('#active-filters'),
            marketplaceCards: $('#marketplace-alert-cards'),
            consolidatedCards: $('#consolidated-cards-container'),
            drillDownSection: $('#drill-down-section')
        },
        
        config: {
            statusMap: {
                1: { title: 'Faulty', class: 'bg-danger', icon: 'alert-triangle' },
                2: { title: 'Incorrect Address', class: 'bg-danger', icon: 'map-pin' },
                3: { title: 'Not in Stock', class: 'bg-danger', icon: 'box' },
                4: { title: 'On Hold', class: 'bg-warning', icon: 'pause-circle' },
                5: { title: 'Missing Invoice', class: 'bg-danger', icon: 'file-minus' },
                6: { title: 'Delivery date not reached', class: 'bg-danger', icon: 'calendar' },
                7: { title: 'Incorrect Country', class: 'bg-danger', icon: 'globe' },
                8: { title: 'Open', class: 'bg-primary', icon: 'folder-plus' },
                9: { title: 'In Progress', class: 'bg-primary', icon: 'loader' },
                10: { title: 'In Picking', class: 'bg-primary', icon: 'shopping-bag' },
                11: { title: 'Ready for Packing', class: 'bg-primary', icon: 'package' },
                12: { title: 'Blocked Packet', class: 'bg-warning', icon: 'slash' },
                13: { title: 'Packet', class: 'bg-primary', icon: 'box' },
                14: { title: 'Shipped', class: 'bg-success', icon: 'truck' },
                15: { title: 'Known Issue', class: 'bg-warning', icon: 'alert-circle' },
                16: { title: 'Cancelled', class: 'bg-secondary', icon: 'x-circle' }
            },
            statusGroups: {
                alerts: { title: 'Requieren Action', statuses: [1, 2, 3, 4, 5, 6, 7, 12, 15], color: 'danger', icon: 'alert-octagon' },
                inProgress: { title: 'In progress', statuses: [8, 9, 10, 11, 13], color: 'primary', icon: 'loader' },
                completed: { title: 'Completed / cancelled', statuses: [14, 16], color: 'success', icon: 'check-circle' }
            }
        },

        //================================================================================
        // 2. MÉTODO PRINCIPAL DE INICIALIZACIÓN
        //================================================================================
        
        init: function () {
            if (this.elements.table.length === 0) return;
            
            this.adjustAssetPath();
            this.initDataTable();
            this.initFilters();
            this.initCardClicks();
            this.initModal();
        },
        
        adjustAssetPath: function() {
            if ($('body').attr('data-framework') === 'laravel') {
                this.assetPath = $('body').attr('data-asset-path');
            }
        },

        //================================================================================
        // 3. LÓGICA DE DATATABLE
        //================================================================================

        initDataTable: function () {
            const tableConfig = this.getDataTableConfig();
            this.dataTable = this.elements.table.DataTable(tableConfig);
        },

        getDataTableConfig: function () {
            return {
                ajax: this.assetPath + 'data/table-datatable.json',
                columns: [
                    { data: null, defaultContent: '' }, // Responsive
                    { data: 'id' }, // Checkbox
                    { data: 'id' }, // Sorting
                    { data: 'order_number' }, { data: 'customer_name' }, { data: 'recipient_name' },
                    { data: 'recipient_address' }, { data: 'external_order_id' }, { data: 'storage' },
                    { data: 'opened_at' }, { data: 'last_update' }, { data: 'time_spent' },
                    { data: 'current_update' }, { data: 'status' }, { data: null } // Actions
                ],
                columnDefs: this.getColumnDefs(),
                order: [[2, 'desc']],
                dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons-container d-flex justify-content-end align-items-center gap-1">><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                displayLength: 10,
                lengthMenu: [10, 25, 50, 75, 100],
                buttons: this.getButtonsConfig(),
                responsive: { /* ... tu configuración responsive ... */ },
                language: { paginate: { previous: '&nbsp;', next: '&nbsp;' } },
                initComplete: this.onInitComplete.bind(this),
                drawCallback: this.onDrawCallback.bind(this)
            };
        },
        
        getColumnDefs: function () {
            const self = this;
            return [
                { className: 'control', orderable: false, targets: 0 },
                { targets: 1, orderable: false, render: data => `<div class="form-check"><input class="form-check-input dt-checkboxes" type="checkbox" value="${data}" id="checkbox${data}" /><label class="form-check-label" for="checkbox${data}"></label></div>`, checkboxes: { selectAllRender: '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="checkboxSelectAll" /><label class="form-check-label" for="checkboxSelectAll"></label></div>' } },
                { targets: 2, visible: false },
                { responsivePriority: 1, targets: 4 },
                {
                    targets: -2, // Status
                    render: function (data, type, full) {
                        const statusInfo = self.config.statusMap[full.status] || { title: 'Unknown' };
                        const statusClasses = { /*... tus clases originales ...*/ };
                        return `<span class="badge rounded-pill ${statusClasses[full.status] || 'badge-light-secondary'}">${statusInfo.title}</span>`;
                    }
                },
                {
                    targets: -1, // Actions
                    title: 'Actions', orderable: false, className: 'no-modal',
                    render: (data, type, full) => `<div class="d-flex gap-1"><a href="orderDetail.html?order_number=${full.order_number}" class="btn px-25 py-25 btn-sm btn-outline-primary m-0">${feather.icons['eye'].toSvg({ class: 'me-25' })} Details</a><a href="https://wemalo.example.com/order/${full.external_order_id}" target="_blank" class="btn btn-outline-primary btn-sm px-25 py-25 m-0">${feather.icons['external-link'].toSvg({ class: 'me-25' })} wemalo</a></div>`
                }
            ];
        },
        
        getButtonsConfig: function() {
            return [{
                extend: 'collection',
                className: 'btn btn-outline-secondary dropdown-toggle',
                text: feather.icons['share'].toSvg({ class: 'font-small-4 me-50' }) + 'Export',
                buttons: [ /* ... tus botones de exportación ... */ ]
            }];
        },

        onInitComplete: function(settings, json) {
            const container = $(this.dataTable.table().container());
            container.find('.head-label').html('<h4 class="mb-0">Orders Out</h4>');
            
            // Lógica de Mini-Paginación
            const actionContainer = container.find('.dt-action-buttons-container');
            const miniPaginationHTML = `<div id="datatable-mini-pagination" class="d-flex align-items-center ms-2"><button id="mini-prev" class="btn btn-sm btn-flat-secondary px-50 py-25"><i data-feather="chevron-left"></i></button><span id="mini-page-info" class="small text-muted mx-1" style="min-width: 80px; text-align: center;">–</span><button id="mini-next" class="btn btn-sm btn-flat-secondary px-50 py-25"><i data-feather="chevron-right"></i></button></div>`;
            actionContainer.append(this.dataTable.buttons().container()).append(miniPaginationHTML);

            actionContainer.on('click', '#mini-prev', () => this.dataTable.page('previous').draw('page'));
            actionContainer.on('click', '#mini-next', () => this.dataTable.page('next').draw('page'));
            
            // Carga inicial de datos para tarjetas y filtros del sidebar
            this.renderCards(json.data);
            this.renderSidebarFilters(json.data);
        },
        
        onDrawCallback: function() {
            const info = this.dataTable.page.info();
            const container = $(this.dataTable.table().container());
            const pageInfoText = info.recordsTotal === 0 ? '0–0 of 0' : `${info.start + 1}–${info.end} of ${info.recordsDisplay}`;
            container.find('#mini-page-info').text(pageInfoText);
            container.find('#mini-prev').prop('disabled', info.page === 0);
            container.find('#mini-next').prop('disabled', info.page >= info.pages - 1);
            feather.replace();
        },

        //================================================================================
        // 4. LÓGICA DE FILTROS Y EVENTOS
        //================================================================================

        initFilters: function() {
            // Filtros del Sidebar
            this.elements.statusFilter.select2({ placeholder: 'Select status', width: '100%' }).on('change', (e) => { this.state.selectedStatuses = $(e.currentTarget).val() || []; this.applyFilters(); });
            this.elements.customerFilter.select2({ placeholder: 'Select customers', width: '100%' }).on('change', (e) => { this.state.selectedCustomers = $(e.currentTarget).val() || []; this.applyFilters(); });
            this.elements.storageFilter.select2({ placeholder: 'Select storage', width: '100%' }).on('change', (e) => { this.state.selectedStorage = $(e.currentTarget).val() || []; this.applyFilters(); });

            // Búsqueda principal y Rango de Fechas
            this.elements.searchInput.on('input', () => this.applyFilters());
            flatpickr("#date-range", { mode: "range", dateFormat: "Y-m-d", onClose: (selectedDates) => { if (selectedDates.length === 2) { this.applyDateFilter(selectedDates); this.applyFilters(); } } });
            
            // Badges y botón de limpiar
            this.elements.activeFilters.on('click', '.remove-filter', this.removeBadge.bind(this));
            $(document).on('click', '#clear-all-filters', this.clearAllFilters.bind(this));
            
            // Filtro personalizado de DataTables
            $.fn.dataTable.ext.search.push(this.customFilter.bind(this));
        },

        applyFilters: function() {
            this.dataTable.draw();
            this.renderBadges();
        },
        
        customFilter: function(settings, data, dataIndex) {
            const rowData = this.dataTable.row(dataIndex).data();
            if (this.state.activeMarketplace && (rowData.marketplace !== this.state.activeMarketplace || !this.config.statusGroups.alerts.statuses.includes(rowData.status))) return false;
            if (this.state.activeStatusGroup && !this.config.statusGroups[this.state.activeStatusGroup].statuses.includes(rowData.status)) return false;
            if (this.state.selectedStatuses.length > 0 && !this.state.selectedStatuses.includes(String(rowData.status))) return false;
            if (this.state.selectedCustomers.length > 0 && !this.state.selectedCustomers.includes(rowData.customer_name)) return false;
            if (this.state.selectedStorage.length > 0 && !this.state.selectedStorage.includes(rowData.storage)) return false;
            return true;
        },
        
        // ... (Aquí irían las funciones de manejo de badges, clear all, etc.)

        //================================================================================
        // 5. LÓGICA DE RENDERIZADO DE COMPONENTES (TARJETAS, MODAL, ETC)
        //================================================================================
        
        initCardClicks: function() {
            // ... tus manejadores de clic para las tarjetas, que actualizan el estado y llaman a this.applyFilters()
        },
        
        renderCards: function(data) {
            // ... tu lógica para renderMarketplaceAlerts y renderConsolidatedCards
        },
        
        renderSidebarFilters: function(data) {
            // ... tu lógica para populateSidebarFilters
        },
        
        renderBadges: function() {
            // ... tu lógica para updateBadges y toggleClearFiltersButton
        },
        
        initModal: function() {
            const self = this;
            this.elements.table.on('click', 'tbody tr', function(e) {
                if ($(e.target).closest('.no-modal, .form-check').length) return;
                const rowData = self.dataTable.row(this).data();
                if (rowData) self.openModal(rowData);
            });
        },
        
        openModal: function(data) {
            // Lógica para poblar y mostrar el modal.
            // Aquí llamarías a orderModalBinder.bind(data) y orderModalInstance.show()
            console.log("Opening modal for:", data);
        }
    };

    //================================================================================
    // PUNTO DE ENTRADA PRINCIPAL
    //================================================================================
    ordersPage.init();

});