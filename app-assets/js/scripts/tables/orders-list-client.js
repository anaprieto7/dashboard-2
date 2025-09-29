/**
 * DataTables Basic
 */

$(function () {
    'use strict';

    //--- CONFIGURATION AND MAPS ---
    const statusMap = {
        1: { title: 'Faulty', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'alert-triangle' },
        2: { title: 'Incorrect Address', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'map-pin' },
        3: { title: 'Not in Stock', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'box' },
        4: { title: 'On Hold', class: 'bg-warning', tableClass: 'badge-light-warning border-warning', icon: 'pause-circle' },
        5: { title: 'Missing Invoice', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'file-minus' },
        6: { title: 'Delivery date not reached', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'calendar' },
        7: { title: 'Incorrect Country', class: 'bg-danger', tableClass: 'badge-light-danger border-danger', icon: 'globe' },
        8: { title: 'Known Issue', class: 'bg-warning', tableClass: 'badge-light-warning border-warning', icon: 'alert-circle' },
        9: { title: 'Open', class: 'bg-primary', tableClass: 'badge-light-primary border-primary', icon: 'folder-plus' },
        10: { title: 'In Progress', class: 'bg-primary', tableClass: 'badge-light-primary border-primary', icon: 'loader' },
        11: { title: 'In Picking', class: 'bg-primary', tableClass: 'badge-light-primary border-primary', icon: 'shopping-bag' },
        12: { title: 'Ready for Packing', class: 'bg-primary', tableClass: 'badge-light-primary border-primary', icon: 'package' },
        13: { title: 'Blocked Packet', class: 'bg-warning', tableClass: 'badge-light-warning border-warning', icon: 'slash' },
        14: { title: 'Packet', class: 'bg-primary', tableClass: 'badge-light-primary border-primary', icon: 'box' },
        15: { title: 'Shipped', class: 'bg-success', tableClass: 'badge-light-success border-success', icon: 'truck' },
        16: { title: 'Cancelled', class: 'bg-secondary', tableClass: 'badge-light-danger border-danger', icon: 'x-circle' }
    };

    const STATUS_GROUPS = {
        alerts: { title: 'Requieren Action', statuses: [1, 2, 3, 4, 5, 6, 7, 8, 13], color: 'danger', icon: 'alert-octagon' },
        inProgress: { title: 'In progress', statuses: [9, 10, 11, 12, 14], color: 'primary', icon: 'loader' },
        completed: { title: 'Completed / cancelled', statuses: [15, 16], color: 'success', icon: 'check-circle' }
    };

    //--- VARIABLES DE ESTADO PARA LOS FILTROS ---
    let activeMarketplaceFilter = null;
    let activeStatusGroup = null;
    let activeStatusFilter = null; 
    let selectedStatuses = [];
    let selectedCustomers = [];
    let selectedStorage = [];

    //--- SELECTORS JQUERY ---
    const dt_basic_table = $('.datatables-basic');
    let assetPath = '/app-assets/';
    const statusFilter = $('#status-filter');
    const customerFilter = $('#customer-filter');
    const storageFilter = $('#storage-filter');
    const searchInput = $('#search-input');
    const activeFilters = $('#active-filters');
    const dateRangeInput = $('#date-range'); // <-- ¡LÍNEA AÑADIDA!

    if ($('body').attr('data-framework') === 'laravel') {
        assetPath = $('body').attr('data-asset-path');
    }

    // Table ORDERS
    // --------------------------------------------------------------------
    if (dt_basic_table.length) {
        const dt_basic = dt_basic_table.DataTable({
            ajax: assetPath + 'data/table-datatable.json',
            columns: [
                { data: 'responsive_id' }, { data: 'id' }, { data: 'id' },
                { data: 'order_number', className: 'exportable' }, 
                { data: 'recipient_name', className: 'exportable' }, { data: 'recipient_address', className: 'exportable' },
                { data: 'external_order_id', className: 'exportable' }, 
                { data: 'opened_at' }, { data: 'last_update' }, { data: 'current_update' },
                { data: '' }, { data: '' }
            ],
            columnDefs: [
                { className: 'control', orderable: false, responsivePriority: 2, targets: 0 },
                {
                    targets: 1, orderable: false, responsivePriority: 3,
                    render: function (data, type, full, meta) {
                        return `<div class="form-check"> <input class="form-check-input dt-checkboxes" type="checkbox" value="" id="checkbox${data}" /><label class="form-check-label" for="checkbox${data}"></label></div>`;
                    },
                    checkboxes: { selectAllRender: '<div class="form-check"> <input class="form-check-input" type="checkbox" value="" id="checkboxSelectAll" /><label class="form-check-label" for="checkboxSelectAll"></label></div>' }
                },
                { targets: 2, visible: false }, { responsivePriority: 1, targets: 4 },
                {
                    targets: -2,
                    render: function (data, type, full, meta) {
                        const statusNumber = full['status'];
                        const statusInfo = statusMap[statusNumber];
                        if (typeof statusInfo === 'undefined') return data;
                        return `<span class="badge rounded-pill ${statusInfo.tableClass}">${statusInfo.title}</span>`;
                    }
                },
                {
                targets: -1,
                title: 'Actions',
                className: 'no-modal actions-column',
                orderable: false,
                render: function (data, type, full, meta) {
                    const id = encodeURIComponent(full.order_number);
                    return `
                    <div class="d-flex gap-1">
                        <a href="#" 
                        class="btn px-25 py-25 btn-sm btn-outline-primary m-0 js-go-order"
                        data-order="${id}">
                        ${feather.icons['eye'].toSvg({ class: 'me-25' })} Details
                        </a>
                    </div>`;
                }
                }
            ],
            order: [[2, 'desc']],
            dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons-container d-flex justify-content-end align-items-center gap-1">><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 10,
            lengthMenu: [10, 25, 50, 75, 100],
            buttons: [
                {
                    extend: 'collection', className: 'btn btn-outline-secondary dropdown-toggle me-2', text: feather.icons['share'].toSvg({ class: 'font-small-4 me-50' }) + 'Export',
                    buttons: [
                        { extend: 'print', text: feather.icons['printer'].toSvg({ class: 'font-small-4 me-50' }) + 'Print', className: 'dropdown-item', exportOptions: { columns: '.exportable' } },
                        { extend: 'csv', text: feather.icons['file-text'].toSvg({ class: 'font-small-4 me-50' }) + 'Csv', className: 'dropdown-item', exportOptions: { columns: '.exportable' } },
                        { extend: 'excel', text: feather.icons['file'].toSvg({ class: 'font-small-4 me-50' }) + 'Excel', className: 'dropdown-item', exportOptions: { columns: '.exportable' } },
                        { extend: 'pdf', text: feather.icons['clipboard'].toSvg({ class: 'font-small-4 me-50' }) + 'Pdf', className: 'dropdown-item', exportOptions: { columns: '.exportable' } },
                        { extend: 'copy', text: feather.icons['copy'].toSvg({ class: 'font-small-4 me-50' }) + 'Copy', className: 'dropdown-item', exportOptions: { columns: '.exportable' } }
                    ],
                    init: function (api, node, config) {
                        $(node).removeClass('btn-secondary');
                        $(node).parent().removeClass('btn-group');
                        setTimeout(function () {
                            $(node).closest('.dt-buttons').removeClass('btn-group').addClass('d-inline-flex me-1');
                            $('.dt-action-buttons-container').append($(node).closest('.dt-buttons'));
                        }, 50);
                    }
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.childRow,
                    type: 'column',
                    target: 'tr',
                    renderer: function (api, rowIdx, columns) {
                        const data = $.map(columns, function (col, i) {
                            if (col.hidden && col.title) {
                                return `<tr data-dt-row="${col.rowIdx}" data-dt-column="${col.columnIndex}">
                                            <td>${col.title}:</td>
                                            <td>${col.data}</td>
                                        </tr>`;
                            }
                            return '';
                        }).join('');
                        return data ? $('<table class="table child-table"/>').append(`<tbody>${data}</tbody>`) : false;
                    }
                }
            },
            language: { paginate: { previous: '&nbsp;', next: '&nbsp;' } }
        });

        dt_basic.on('draw', function () {
            updateMiniPagination();
        });

        $('div.head-label').html('<h4 class="mb-0">Orders Out</h4>');
        $('.dt-action-buttons-container').append($('.dt-buttons'));

        $('.dt-action-buttons-container').append(`
            <div id="datatable-mini-pagination" class="d-flex align-items-center ms-2">
                <button id="mini-prev" class="btn btn-sm btn-flat-secondary px-50 py-25 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-feather="chevron-left"></i></button>
                <span id="mini-page-info" class="small text-muted mx-1" style="min-width: 80px; text-align: center;">–</span>
                <button id="mini-next" class="btn btn-sm btn-flat-secondary px-50 py-25 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-feather="chevron-right"></i></button>
            </div>`);
        feather.replace();

        function updateMiniPagination() {
            const info = dt_basic.page.info();
            const start = info.start + 1;
            const end = info.end;
            const total = info.recordsDisplay;
            $('#mini-page-info').text(`${start}–${end} von ${total}`);
            $('#mini-prev').prop('disabled', info.page === 0);
            $('#mini-next').prop('disabled', info.page === info.pages - 1);
        }

        $('#mini-prev').on('click', function () { dt_basic.page('previous').draw('page'); });
        $('#mini-next').on('click', function () { dt_basic.page('next').draw('page'); });

        // OPEN MODAL ORDERS DETAILS
        $('.datatables-basic tbody').on('click', 'tr', function (e) {
            const $cell = $(e.target).closest('td');
            if ($cell.hasClass('actions-column')) return;
            const rowData = dt_basic.row(this).data();
            OrderDetailModal.open(rowData, dt_basic); 
        });

        // --- FILTERS ON ALL CARDS (VERSIÓN UNIFICADA) ---
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            if (settings.nTable.id !== dt_basic_table.attr('id')) return true;
            const rowData = dt_basic.row(dataIndex).data();
            const dateRange = dateRangeInput.val();
            if (dateRange && dateRange.includes('to')) {
                const [from, to] = dateRange.split(' to ');
                const openedAt = rowData.opened_at ? rowData.opened_at.split(' ')[0] : '';
                if ((from && openedAt < from) || (to && openedAt > to)) return false;
            }
            if (activeMarketplaceFilter && (rowData.marketplace !== activeMarketplaceFilter || !STATUS_GROUPS.alerts.statuses.includes(rowData.status))) return false;
            
            if (activeStatusFilter !== null && rowData.status !== activeStatusFilter) {
                return false;
            }
            if (activeStatusFilter === null && activeStatusGroup && !STATUS_GROUPS[activeStatusGroup].statuses.includes(rowData.status)) {
                return false;
            }

            if (selectedStatuses.length > 0 && !selectedStatuses.includes(String(rowData.status))) return false;
            if (selectedCustomers.length > 0 && !selectedCustomers.includes(rowData.customer_name)) return false;
            if (selectedStorage.length > 0 && !selectedStorage.includes(rowData.storage)) return false;
            return true;
        });

        dt_basic.on('xhr', function () {
            const response = dt_basic.ajax.json();
            const data = response.data || [];
            renderMarketplaceAlerts(data);
            renderConsolidatedCards(data);
            populateSidebarFilters(data);
        });

        function renderMarketplaceAlerts(data) {
            const TARGET_MARKETPLACES = ['Amazon', 'Zalando', 'OTTO', 'Ebay'];
            const marketplaceCounts = {};
            data.forEach(order => {
                if (TARGET_MARKETPLACES.includes(order.marketplace) && STATUS_GROUPS.alerts.statuses.includes(order.status)) {
                    marketplaceCounts[order.marketplace] = (marketplaceCounts[order.marketplace] || 0) + 1;
                }
            });
            const $container = $('#marketplace-alert-cards');
            const $noAlertsMsg = $('#no-marketplace-alerts');
            $container.empty();
            if (Object.keys(marketplaceCounts).length === 0) {
                $noAlertsMsg.show();
                return;
            }
            $noAlertsMsg.hide();
            for (const marketplace in marketplaceCounts) {
                const count = marketplaceCounts[marketplace];
                $container.append(`<div class="card marketplace-card bg-light-danger shadow-none border-danger h-100 flex-grow-1" data-marketplace="${marketplace}" style="min-width: 180px; cursor: pointer; transition: transform 0.2s ease;">
                    <div class="card-body d-flex align-items-center p-2"><div class="avatar bg-danger p-50 me-1"><span class="avatar-content"><i data-feather="alert-triangle" class="font-medium-3"></i></span></div>
                    <div class="d-flex flex-column"><h2 class="fw-bolder text-danger mb-0">${count}</h2><p class="card-text fw-bold">${marketplace}</p></div></div></div>`);
            }
            feather.replace();
        }

        function renderConsolidatedCards(data) {
            const groupCounts = { alerts: 0, inProgress: 0, completed: 0 };
            data.forEach(order => {
                if (STATUS_GROUPS.alerts.statuses.includes(order.status)) groupCounts.alerts++;
                else if (STATUS_GROUPS.inProgress.statuses.includes(order.status)) groupCounts.inProgress++;
                else if (STATUS_GROUPS.completed.statuses.includes(order.status)) groupCounts.completed++;
            });
            const $container = $('#consolidated-cards-container');
            $container.empty();
            for (const groupName in groupCounts) {
                const groupInfo = STATUS_GROUPS[groupName];
                const count = groupCounts[groupName];
                $container.append(`<div class="card consolidated-card shadow-none border border-${groupInfo.color} flex-grow-1" data-group="${groupName}" style="cursor: pointer; transition: all 0.2s ease;">
                    <div class="card-body d-flex align-items-center justify-content-between p-2"><div><h2 class="fw-bolder mb-0 text-${groupInfo.color}">${count}</h2><p class="card-text fw-bold">${groupInfo.title}</p></div>
                    <div class="avatar bg-light-${groupInfo.color} p-50"><span class="avatar-content"><i data-feather="${groupInfo.icon}" class="font-medium-5 text-${groupInfo.color}"></i></span></div></div></div>`);
            }
            feather.replace();
        }

        function renderDrillDownCards(groupName) {
            const $section = $('#drill-down-section');
            const $container = $('#drill-down-cards-container');
            const $title = $('#drill-down-title');
            if (!groupName) { $section.hide(); return; }
            $container.empty();
            $title.text(`Breakdown of "${STATUS_GROUPS[groupName].title}"`);
            const groupStatuses = STATUS_GROUPS[groupName].statuses;
            const data = dt_basic.rows().data().toArray();
            const statusCounts = {};
            groupStatuses.forEach(s => statusCounts[s] = 0);
            data.forEach(order => { if (groupStatuses.includes(order.status)) { statusCounts[order.status]++; } });
            groupStatuses.forEach(status => {
                const count = statusCounts[status];
                if (count > 0) {
                    const info = statusMap[status];
                    $container.append(`<div class="card status-card-small bg-light shadow-none border mb-0" data-status="${status}" style="min-width: 180px; cursor: pointer; transition: all 0.2s ease;"><div class="card-body d-flex p-1"><div class="avatar bg-light-${info.class.replace('bg-', '')} me-1"><div class="avatar-content"><i data-feather="${info.icon}" class="font-medium-2"></i></div></div><div class="d-flex flex-column"><h6 class="fw-bolder mb-0">${count}</h6><small>${info.title}</small></div></div></div>`);
                }
            });
            $section.show();
            feather.replace();
        }

        $('#marketplace-alert-cards').on('click', '.marketplace-card', function () {
            const clickedMarketplace = $(this).data('marketplace');
            activeStatusGroup = null;
            $('.consolidated-card').removeClass('border-3');
            renderDrillDownCards(null);
            if (activeMarketplaceFilter === clickedMarketplace) {
                activeMarketplaceFilter = null;
                $(this).removeClass('border-3');
            } else {
                activeMarketplaceFilter = clickedMarketplace;
                $('.marketplace-card').removeClass('border-3');
                $(this).addClass('border-3');
            }
            dt_basic.draw();
        });

        $('#consolidated-cards-container').on('click', '.consolidated-card', function () {
            const clickedGroup = $(this).data('group');
            activeMarketplaceFilter = null;
            $('.marketplace-card').removeClass('border-3');

            activeStatusFilter = null;
            $('#drill-down-cards-container .status-card-small').removeClass('border-3');

            if (activeStatusGroup === clickedGroup) {
                activeStatusGroup = null;
                $(this).removeClass('border-3');
                renderDrillDownCards(null);
            } else {
                activeStatusGroup = clickedGroup;
                $('.consolidated-card').removeClass('border-3');
                $(this).addClass('border-3');
                renderDrillDownCards(clickedGroup);
            }
            dt_basic.draw();
        });

        $('#drill-down-cards-container').on('click', '.status-card-small', function () {
            const clickedStatus = $(this).data('status');
    
            if (activeStatusFilter === clickedStatus) {
                activeStatusFilter = null;
                $(this).removeClass('border-3');
            } else {
                activeStatusFilter = clickedStatus;
                $('#drill-down-cards-container .status-card-small').removeClass('border-3');
                $(this).addClass('border-3');
            }
            dt_basic.draw();
        });

        initializeDateRangePicker('#date-range');

        dateRangeInput.on('change', function() {
            dt_basic.draw();
            updateBadges();
        });

        function applySearchFilter() {
            dt_basic.search(searchInput.val()).draw();
            updateBadges();
            toggleClearFiltersButton();
        }
        searchInput.on('input', applySearchFilter);

        function createBadge(type, value, label) {
            return $(`<span class="badge rounded-pill bg-light-primary me-25 me-1 px-75 py-75 fs-6" data-type="${type}" data-value="${value}">${label}<span class="ms-1 cursor-pointer remove-filter">&times;</span></span>`);
        }

        function populateSidebarFilters(data) {
            const uniqueStatuses = [...new Set(data.map(row => row.status))].sort((a, b) => a - b);
            statusFilter.empty();
            uniqueStatuses.forEach(status => statusFilter.append(`<option value="${status}">${statusMap[status] ? statusMap[status].title : `Status ${status}`}</option>`));
            statusFilter.val(selectedStatuses).trigger('change.select2');

            const uniqueCustomers = [...new Set(data.map(row => row.customer_name))].sort();
            customerFilter.empty();
            uniqueCustomers.forEach(customer => customerFilter.append(`<option value="${customer}">${customer}</option>`));
            customerFilter.val(selectedCustomers).trigger('change.select2');

            const uniqueStorage = [...new Set(data.map(row => row.storage))].filter(Boolean).sort();
            storageFilter.empty();
            uniqueStorage.forEach(storage => storageFilter.append(`<option value="${storage}">${storage}</option>`));
            storageFilter.val(selectedStorage).trigger('change.select2');
        }

        statusFilter.select2({ placeholder: 'Select status', width: '100%' }).on('change', function () {
            selectedStatuses = $(this).val() || [];
            dt_basic.draw(); updateBadges();
        });
        customerFilter.select2({ placeholder: 'Select customers', width: '100%' }).on('change', function () {
            selectedCustomers = $(this).val() || [];
            dt_basic.draw(); updateBadges();
        });
        storageFilter.select2({ placeholder: 'Select storage', width: '100%' }).on('change', function () {
            selectedStorage = $(this).val() || [];
            dt_basic.draw(); updateBadges();
        });

        function updateBadges() {
            activeFilters.empty();
            if (searchInput.val().trim() !== '') activeFilters.append(createBadge('search', searchInput.val(), `Search: ${searchInput.val()}`));
            if ($('#date-range').val().trim() !== '') activeFilters.append(createBadge('date', $('#date-range').val(), `Date: ${$('#date-range').val()}`));
            selectedStatuses.forEach(status => activeFilters.append(createBadge('status', status, `Status: ${statusMap[status] ? statusMap[status].title : `Status ${status}`}`)));
            selectedCustomers.forEach(customer => activeFilters.append(createBadge('customer', customer, `Customer: ${customer}`)));
            selectedStorage.forEach(storage => activeFilters.append(createBadge('storage', storage, `WH: ${storage}`)));
            toggleClearFiltersButton();
        }

        function toggleClearFiltersButton() {
            const hasFilters = searchInput.val().trim() !== '' || $('#date-range').val().trim() !== '' || selectedStatuses.length > 0 || selectedCustomers.length > 0 || selectedStorage.length > 0;
            $('#clear-all-filters').remove();
            if (hasFilters) {
                const clearBtn = $(`<button id="clear-all-filters" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center ms-auto"><i class="me-50" data-feather="x-circle"></i> Clear All</button>`);
                activeFilters.append(clearBtn);
                feather.replace();
                clearBtn.on('click', clearAllFilters);
            }
        }

        function clearAllFilters() {
            searchInput.val('');
            $('#date-range').val('');
            statusFilter.val(null).trigger('change');
            customerFilter.val(null).trigger('change');
            storageFilter.val(null).trigger('change');
            selectedStatuses = []; selectedCustomers = []; selectedStorage = [];
            dt_basic.search('').draw();
            updateBadges();
        }

        activeFilters.on('click', '.remove-filter', function () {
            const badge = $(this).closest('.badge');
            const value = badge.data('value');
            const type = badge.data('type');
            if (type === 'search') { searchInput.val(''); dt_basic.search('').draw(); }
            if (type === 'date') { $('#date-range').val(''); dt_basic.draw(); }
            if (type === 'status') { selectedStatuses = selectedStatuses.filter(s => String(s) !== String(value)); statusFilter.val(selectedStatuses).trigger('change'); }
            if (type === "customer") { selectedCustomers = selectedCustomers.filter(s => String(s) !== String(value)); customerFilter.val(selectedCustomers).trigger('change'); }
            if (type === "storage") { selectedStorage = selectedStorage.filter(s => String(s) !== String(value)); storageFilter.val(selectedStorage).trigger('change'); }
            updateBadges();
        });

        $('#clear-filters').on('click', clearAllFilters);
    } // END if (dt_basic_table.length)

        // Click delegado en el tbody de ESTA tabla para que sobreviva a redraws
        $('.datatables-basic tbody')
        .off('click.ordersGo', 'a.js-go-order')
        .on('click.ordersGo', 'a.js-go-order', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const id = $(this).data('order');

            // Si ordersClient.html y orderDetailClient.html están en la misma carpeta:
            const target = `orderDetailClient.html?order_number=${id}#order_number=${id}`;

            // Navega (query + hash por si tu server limpia la query-string)
            window.location.assign(target);
        });



    // ===================================================================================
    // ========================== LÓGICA ENCAPSULADA DEL MODAL ===========================
    // ===================================================================================
    const OrderDetailModal = {

      currentData: [],
      currentIndex: -1, 
        instance: null,
        config: {
            ITEMS_PER_PAGE: 10,
            PARCELS_PER_PAGE: 10,
            actionConfig: {
            cancelOrder: { text: 'Cancel Order', icon: 'x-circle', className: 'btn-danger', type: 'button', visibleOnStatus: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
            synchronize: { text: 'Synchronize', icon: 'zap', className: 'btn-info', type: 'button', visibleOnStatus: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
            requestInvestigation: { text: 'Request Investigation', icon: 'external-link', className: 'btn-dark', type: 'link', visibleOnStatus: [ 15] },
            uploadDocument: { text: 'Upload Document', icon: 'upload', type: 'dropdown', visibleOnStatus: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
            splitOrder: { text: 'Split Order', icon: 'layers', type: 'dropdown', visibleOnStatus: [ 4, 5, 6, 7, 8, 9] },
            generateBill: { text: 'Generate Bill', icon: 'file-text', type: 'dropdown', visibleOnStatus: [ ] },
            generateDeliveryNote: { text: 'Generate Delivery Note', icon: 'file', type: 'dropdown', visibleOnStatus: [] },
            prioritizeOrder: { text: 'Prioritize Order', icon: 'trending-up', type: 'dropdown', visibleOnStatus: [0, 1, 2, 3, 4, 7, 9] },
            changeShippingDispatcher: { text: 'Change Shipping Dispatcher', icon: 'truck', type: 'dropdown', visibleOnStatus: [1, 3, 4, 7, 9, 10, 11, 12, 13] },
            requestReturn: { text: 'Register Return', icon: 'tag', type: 'dropdown', visibleOnStatus: [15] }
            }
        },

        init: function() {
            const modalElement = document.getElementById('orderDetailModal');
            if (modalElement) {
                this.instance = new bootstrap.Modal(modalElement);
            }
            $('#modal-prev-order').on('click', () => this._navigateTo(-1));
            $('#modal-next-order').on('click', () => this._navigateTo(1));

            $('#modal-dynamic-actions').on('click', '.btn, .dropdown-item', function(e) {
                e.preventDefault();
                const action = $(this).data('action');
                if (action) {
                    alert(`Action preparate: ${action}`);
                }
            });
        },

        open: function(rowData, dt_basic) {
          if (!this.instance) this.init();

          this.currentData = dt_basic.rows({ search: 'applied', order: 'applied' }).data().toArray();
          this.currentIndex = this.currentData.findIndex(row => row.id === rowData.id);

          this._bindData(rowData);
          this.instance.show();
        },

        _navigateTo: function(direction) {
            const newIndex = this.currentIndex + direction;

            if (newIndex >= 0 && newIndex < this.currentData.length) {
                this.currentIndex = newIndex;
                const newData = this.currentData[this.currentIndex];
                this._bindData(newData);
            }
        },
        
        _updateNavButtons: function() {
            $('#modal-prev-order').prop('disabled', this.currentIndex <= 0);
            $('#modal-next-order').prop('disabled', this.currentIndex >= this.currentData.length - 1);
        },

        _renderActionButtons: function(status) {
          const container = $('#modal-dynamic-actions').empty();
          let primaryButtonsHtml = '';
          let dropdownItemsHtml = '';

          for (const actionKey in this.config.actionConfig) {
              const action = this.config.actionConfig[actionKey];
              if (action.visibleOnStatus.includes(status)) {
                  const iconHtml = feather.icons[action.icon] ? feather.icons[action.icon].toSvg({ class: 'me-25' }) : '';
                  
                  if (action.type === 'button' || action.type === 'link') {
                      const tag = action.type === 'link' ? 'a' : 'button';
                      primaryButtonsHtml += `<${tag} href="#" class="btn btn-sm ${action.className}" data-action="${actionKey}">${iconHtml}${action.text}</${tag}>`;
                  } else if (action.type === 'dropdown') {
                      dropdownItemsHtml += `<li><a class="dropdown-item" href="#" data-action="${actionKey}">${iconHtml}${action.text}</a></li>`;
                  }
              }
          }

          container.append(primaryButtonsHtml);

          if (dropdownItemsHtml) {
              const dropdownHtml = `
                  <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-flat-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                          <i data-feather="layers" class="me-25"></i>
                          More Actions
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                          ${dropdownItemsHtml}
                      </ul>
                  </div>`;
              container.append(dropdownHtml);
          }
        },


        _bindData: function(data) {
          this._updateNavButtons();
          this._renderActionButtons(data.status); 
            const hasParcels = data.parcels && data.parcels.length > 0;
            const itemsCol = document.getElementById('itemsCol');
            const parcelsCol = document.getElementById('parcelsCol');
            if (itemsCol && parcelsCol) {
                itemsCol.className = hasParcels ? 'col-lg-8 col-md-8 col-sm-12' : 'col-lg-12 col-md-12 col-sm-12';
                parcelsCol.style.display = hasParcels ? '' : 'none';
            }

            const statusInfo = statusMap[data.status] || { title: 'Unknown', class: 'bg-secondary', icon: 'alert-triangle' };
            const statusBadge = document.getElementById('modalStatusBadge');
            if (statusBadge) {
                statusBadge.innerHTML = statusInfo.icon ? `${statusInfo.title} ${feather.icons[statusInfo.icon].toSvg({ class: 'ms-25' })}` : statusInfo.title;
                statusBadge.className = 'badge ' + statusInfo.class;
                feather.replace();
            }

            const cancelBtn = document.getElementById('cancelOrderButton');
            if (cancelBtn) {
                const shouldDisable = data.status >= 8 && data.status <= 16;
                cancelBtn.disabled = shouldDisable;
                cancelBtn.classList.toggle('disabled', shouldDisable);
            }

            const trackingSpan = document.getElementById('modalTrackingNumber');
            if (trackingSpan) {
                const trackingP = trackingSpan.closest('p');
                if (data.tracking_number) {
                    trackingSpan.textContent = data.tracking_number;
                    trackingP.style.display = '';
                } else {
                    trackingP.style.display = 'none';
                }
            }

            this._setText('modalOrderNumber', data.order_number || '-');
            this._setText('modalExternalOrderId', data.external_order_id || '-');
            this._setText('modalPriority', data.priority || '-');
            this._setText('modalMarketplace', data.marketplace || '-');
            this._setText('modalCreationDate', data.creation_date || '-');
            this._setText('modalCustomerName', data.customer_name || '-');
            this._setText('modalDispatcherProfile', data.dispatcher_profile || '-');
            
            const carrierEl = document.getElementById('modalCarrierInfo');
            if (carrierEl) carrierEl.innerHTML = data.carrier_html || '-';

            this._renderItems(data.items || []);
            this._renderParcels(data.parcels || []);
            feather.replace();
        },

        _setText: function(id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        },

        _renderItems: function(items) {
            const container = document.getElementById('itemsListContainer');
            const emptyState = document.getElementById('itemsEmptyState');
            const pagination = document.querySelector('#itemsPaginationNav .pagination');

            container.innerHTML = '';
            pagination.innerHTML = '';

            if (items.length === 0) {
                emptyState.style.display = '';
                this._setText('itemsCount', 0);
                this._setText('itemsTotalPrice', '0.00');
                return;
            }
            emptyState.style.display = 'none';

            let totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
            let totalSum = items.reduce((sum, it) => sum + ((it.quantity || 0) * (it.unit_price || 0)), 0);
            this._setText('itemsCount', totalQty);
            this._setText('itemsTotalPrice', totalSum.toFixed(2));

            const totalPages = Math.ceil(items.length / this.config.ITEMS_PER_PAGE);
            const drawPage = (page) => {
                const start = (page - 1) * this.config.ITEMS_PER_PAGE;
                const pageItems = items.slice(start, start + this.config.ITEMS_PER_PAGE);

                container.innerHTML = pageItems.map(it => {
                    return `<div class="d-flex align-items-center justify-content-between mt-25 border-bottom pb-50">
                                <div>
                                    <p class="mb-0">${it.item_name || it.name || '—'} [${it.sku || ''}]</p>
                                    <span class="badge badge-light-secondary border-secondary">SN: ${it.serial_number || it.serial || '—'}</span>
                                </div>
                                <div class="text-end">
                                    <span>${it.quantity || 0}</span>
                                    <span class="ms-2">${(typeof it.unit_price === 'number' ? it.unit_price.toFixed(2) : '0.00')} €</span>
                                </div>
                            </div>`;
                }).join('');

                pagination.innerHTML = '';
                if (totalPages > 1) {
                    const prevLi = document.createElement('li');
                    prevLi.className = `page-item ${page === 1 ? 'disabled' : ''}`;
                    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&lsaquo;</span></a>`;
                    prevLi.addEventListener('click', e => { e.preventDefault(); if (page > 1) drawPage(page - 1); });
                    pagination.appendChild(prevLi);

                    for (let p = 1; p <= totalPages; p++) {
                        const li = document.createElement('li');
                        li.className = `page-item ${p === page ? 'active' : ''}`;
                        li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
                        li.addEventListener('click', e => { e.preventDefault(); drawPage(p); });
                        pagination.appendChild(li);
                    }

                    const nextLi = document.createElement('li');
                    nextLi.className = `page-item ${page === totalPages ? 'disabled' : ''}`;
                    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&rsaquo;</span></a>`;
                    nextLi.addEventListener('click', e => { e.preventDefault(); if (page < totalPages) drawPage(page + 1); });
                    pagination.appendChild(nextLi);
                }
            };
            drawPage(1);
        },

        _renderParcels: function(parcels) {
            const container = document.getElementById('parcelsListContainer');
            const emptyState = document.getElementById('parcelsEmptyState');
            const pagination = document.querySelector('#parcelsPaginationNav .pagination');
            const summaryBadge = document.getElementById('parcelsSummaryBadge');

            container.innerHTML = '';
            pagination.innerHTML = '';

            if (parcels.length === 0) {
                emptyState.style.display = '';
                if (summaryBadge) summaryBadge.textContent = '0 Parcels / 0 Items';
                return;
            }
            emptyState.style.display = 'none';

            const totalParcels = parcels.length;
            const totalItems = parcels.reduce((sum, p) => sum + (p.product_qty || 0), 0);
            if (summaryBadge) {
                summaryBadge.textContent = `${totalParcels} Parcel${totalParcels > 1 ? 's' : ''} / ${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
            }

            const totalPages = Math.ceil(parcels.length / this.config.PARCELS_PER_PAGE);
            const drawPage = (page) => {
                const start = (page - 1) * this.config.PARCELS_PER_PAGE;
                const pageParcels = parcels.slice(start, start + this.config.PARCELS_PER_PAGE);
                container.innerHTML = pageParcels.map(p => {
                    return `<div class="mt-25 border-bottom pb-50">
                                <div><p class="mb-0">Parcel ${p.parcel_id || '—'} / ${p.product_qty || 0} Item(s)</p></div>
                                <div><span class="badge badge-light-secondary border-secondary">${(typeof p.weight === 'number' ? p.weight.toFixed(2) : '—')} Kg</span></div>
                            </div>`;
                }).join('');

                pagination.innerHTML = '';
                 if (totalPages > 1) {
                    const prevLi = document.createElement('li');
                    prevLi.className = `page-item ${page === 1 ? 'disabled' : ''}`;
                    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&lsaquo;</span></a>`;
                    prevLi.addEventListener('click', e => { e.preventDefault(); if (page > 1) drawPage(page - 1); });
                    pagination.appendChild(prevLi);

                    for (let p = 1; p <= totalPages; p++) {
                        const li = document.createElement('li');
                        li.className = `page-item ${p === page ? 'active' : ''}`;
                        li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
                        li.addEventListener('click', e => { e.preventDefault(); drawPage(p); });
                        pagination.appendChild(li);
                    }

                    const nextLi = document.createElement('li');
                    nextLi.className = `page-item ${page === totalPages ? 'disabled' : ''}`;
                    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&rsaquo;</span></a>`;
                    nextLi.addEventListener('click', e => { e.preventDefault(); if (page < totalPages) drawPage(page + 1); });
                    pagination.appendChild(nextLi);
                }
            };
            drawPage(1);
        }
    };

    // Inicializa el modal para que esté listo para ser usado.
    OrderDetailModal.init();
});
