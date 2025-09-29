/**
 * parcels.js 
 *
 * Displays a list of individual PARCELS.
 * Extracts parcels from orders with status 13 (Packet) and 14 (Shipped).
 * Includes a complete filtering system with badges.
 */

$(function () {
    'use strict';

    //================================================================================
    // 1. CONFIGURATION AND GLOBAL VARIABLES
    //================================================================================

    const assetPath = '../../../app-assets/';
    let dt_parcels = null;
    let datePickerInstance = null;
    let parcelDetailModal = null;

    const statusMap = {
        14: { title: 'Packet', class: 'badge-light-primary border-primary' },
        15: { title: 'Shipped', class: 'badge-light-success border-success' }
    };

    let selectedStatuses = [], selectedCustomers = [], selectedStorage = [], selectedDispatchers = [];

    const parcelsTableElement = $('#parcels-table');
    const statusFilter = $('#status-filter'), customerFilter = $('#customer-filter');
    const storageFilter = $('#storage-filter'), dispatcherFilter = $('#dispatcher-filter');
    const searchInput = $('#search-input'), activeFilters = $('#active-filters');
    const dateRangeInput = $('#date-range');

    //================================================================================
    // 2.  TABLE SETUP
    //================================================================================

    const parcelsConfig = {
        columns: [
            { data: null, defaultContent: '', orderable: false }, // 0
            { data: 'responsive_id', defaultContent: '' }, // 1
            { data: 'order_number', title: 'Order #', className: 'exportable' }, // 2
            { data: 'customer_name', title: 'Customer', className: 'exportable' }, // 3
            { data: 'package', title: 'Package', className: 'exportable' }, // 4
            { data: 'weight', title: 'Weight (Kg)', className: 'exportable' }, // 5
            { data: 'number_of_items', title: 'Items', className: 'exportable' }, // 6
            { data: 'tracking_number', title: 'Tracking #', className: 'exportable' }, // 7
            { data: 'dispatcher_profile', title: 'Dispatcher Profile',className: 'exportable' }, // 8
            { data: 'hand_over_date', title: 'Handover Date' }, // 9
            { data: 'last_update', title: 'Last Update' }, // 10
            { data: 'order_status', title: 'Status' }, // 11
            { data: 'parcelItems' }, // 12
            { data: null, defaultContent: '', orderable: false } // 13
        ],
        columnDefs: [
            { targets: 0, responsivePriority: 3, render: (data, type, full) => `<div class="form-check"><input class="form-check-input dt-checkboxes" type="checkbox" value="${full.order_number}" id="checkbox${full.order_number}-${full.tracking_number}" /><label class="form-check-label" for="checkbox${full.order_number}-${full.tracking_number}"></label></div>`, checkboxes: { selectAllRender: '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="checkboxSelectAll" /><label class="form-check-label" for="checkboxSelectAll"></label></div>' } },
            { className: 'control', orderable: false, targets: 1 },
            { targets: 2,
                render: function (data, type, full) {
                     const id = encodeURIComponent(full.order_number);
                    return `<a href="#" class="fw-bold js-go-order" data-order="${id}">${data}</a>`;
                }

            },
            { 
                targets: 13,
                title: 'Actions',
                orderable: false,
                render: function () {
                    return `<button type="button" class="btn btn-sm btn-outline-primary btn-view-details">
                                ${feather.icons['eye'].toSvg({ class: 'me-50' })}
                                <span>Details</span>
                            </button>`;
                }
            },
            { targets: 11, render: (data, type, row) => `<span class="badge rounded-pill ${statusMap[row.order_status]?.class || 'badge-light-secondary'}">${statusMap[row.order_status]?.title || 'Unknown'}</span>` },
            { responsivePriority: 1, targets: 2 },
            { responsivePriority: 2, targets: 3 },
            { targets: 5, render: data => { const w = parseFloat(data); return isNaN(w) ? '—' : w.toFixed(2); } },
            { targets: 12, visible: false }
        ],
        order: [[2, 'desc']]
    };

    //================================================================================
    // 3. MAIN INITIALIZATION AND DATA LOADING
    //================================================================================

    if (parcelsTableElement.length) {
        dt_parcels = parcelsTableElement.DataTable({
            ajax: {
                url: assetPath + 'data/table-datatable.json',
                dataType: 'json',
                dataSrc: function (json) {
                    const allOrders = json.data || [];
                    const ordersWithParcels = allOrders.filter(order => order.status === 14 || order.status === 15);
                    
                    const flatParcelsData = ordersWithParcels.flatMap(order => {
                        if (!Array.isArray(order.parcels) || order.parcels.length === 0) return [];
                        
                        return order.parcels.map(parcel => {
                            const totalItemsInParcel = parcel.items ? parcel.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

                            return {
                                parcelItems: parcel.items || [],
                                order_number: order.order_number,
                                customer_name: order.customer_name,
                                order_status: order.status,
                                storage: order.storage,
                                last_update: order.last_update || '—',
                                weight: parcel.weight ?? '—',
                                package: parcel.package ?? '—',
                                tracking_number: parcel.tracking_number || order.tracking_number || '—',
                                dispatcher: parcel.dispatcher || '—',
                                dispatcher_profile: parcel.dispatcher_profile || '—',
                                hand_over_date: parcel.hand_over_date || '—',
                                number_of_items: totalItemsInParcel || parcel.product_qty || 0,
                                responsive_id: ''
                            };
                        });
                    });

                    populateSidebarFilters(allOrders);
                    return flatParcelsData;
                }
            },
            ...parcelsConfig,
            processing: true,
            language: {
                processing: `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>`,
                emptyTable: "No parcels available to display yet.",
                zeroRecords: "No parcels found matching your filters."
            },
            dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons-container d-flex justify-content-end align-items-center gap-1">><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
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
            initComplete: function () {
                this.api().table().container().querySelector('.head-label').innerHTML = '<h4 class="mb-0">Parcel List</h4>';
                
                const bulkActionsButtonHtml = `
                    <div class="btn-group" id="bulk-actions-wrapper" style="display: none;">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" id="bulk-action-button">
                            Bulk Action (0)
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Cancel</a></li>
                            <li><a class="dropdown-item" href="#">Prioritize</a></li>
                            <li><a class="dropdown-item" href="#">Sync</a></li>
                            <li><a class="dropdown-item" href="#">Edit Dispatcher</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#">Edit Selected Row</a></li>
                        </ul>
                    </div>`;

                $('.dt-action-buttons-container').prepend(bulkActionsButtonHtml);
                const $bulkActionsWrapper = $('#bulk-actions-wrapper');
                const $bulkActionButton = $('#bulk-action-button');

                function updateBulkActionButton() {
                    const selectedRows = dt_parcels.column(0).checkboxes.selected();
                    const count = selectedRows.length;

                    if (count > 0) {
                        $bulkActionButton.html(`Bulk Action (${count})`);
                        $bulkActionsWrapper.show();
                    } else {
                        $bulkActionsWrapper.hide();
                    }
                }

                $(dt_parcels.table().container()).on('click', 'input.dt-checkboxes, #checkboxSelectAll', function () {
                    setTimeout(function () {
                        updateBulkActionButton();
                    }, 10);
                });

                updateBulkActionButton();
                
                setupMiniPagination(this.api());
                setupFilterEvents();
                initParcelModal();
            }
        });

        parcelsTableElement.on('error.dt', function (e, settings, techNote, message) {
            console.error('An error has been reported by DataTables: ', message);
            const colspan = parcelsTableElement.find('thead th').length;
            parcelsTableElement.find('tbody').html(
                `<tr><td colspan="${colspan}" class="text-center text-danger"><strong>Could not load data.</strong> Please try again later.</td></tr>`
            );
        });
    }
    //================================================================================
    // 3.B NAVIGATION TO ORDER DETAIL FROM PARCELS
    //================================================================================


        $(document).on('click', '.js-go-order', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const id = $(this).data('order'); // viene de encodeURIComponent(full.order_number)

        // path base actual: …/starter-kit/ltr/vertical-menu-template-semi-dark/
        const basePath = window.location.pathname.replace(/[^/]+$/, '');

        // pasamos el id en query y también en hash (backup)
        const target = `${basePath}orderDetail.html?order_number=${id}#order_number=${id}`;
        window.location.assign(target);
        });


    //================================================================================
    // 4.MODAL LOGIC
    //================================================================================
    
    function initParcelModal() {
        const modalElement = document.getElementById('parcelDetailModal');
        if (modalElement) {
            parcelDetailModal = new bootstrap.Modal(modalElement);
        }

        parcelsTableElement.on('click', '.btn-view-details', function () {
            const cell = $(this).closest('td');
            const row = dt_parcels.cell(cell).row();
            const rowData = row.data();
            if (rowData) {
                populateParcelModal(rowData);
            } else {
                console.error("DataTables could not find row data for the clicked cell.");
            }
        });
    }

    function populateParcelModal(data) {
        if (!parcelDetailModal) return;

        $('#parcelDetailModalLabel span').text(`Details for Parcel in Order #${data.order_number}`);
        $('#modalParcelOrderNumber').text(data.order_number || '—');
        $('#modalParcelCustomer').text(data.customer_name || '—');
        $('#modalParcelWeight').text(data.weight || '—');
        $('#modalParcelPackage').text(data.package || '—').removeClass('bg-secondary').addClass('bg-primary');
        $('#modalParcelItemCount').text(data.number_of_items || '0');

        const trackingContainer = $('#modalParcelTrackingNumberContainer');
        trackingContainer.empty(); 
        if (data.tracking_number && data.tracking_number !== '—') {
            const trackingUrl = `https://www.google.com/search?q=${data.tracking_number}`;
            const trackingLinkHTML = `<a href="${trackingUrl}" target="_blank" class="fw-bold">${data.tracking_number} <i data-feather="external-link" style="width: 14px; height: 14px; margin-left: 4px; vertical-align: middle;"></i></a>`;
            trackingContainer.html(trackingLinkHTML);
        } else {
            trackingContainer.html('<span class="text-muted">Not available</span>');
        }

        const itemsList = $('#modalParcelItemsList');
        itemsList.empty();

        if (Array.isArray(data.parcelItems) && data.parcelItems.length > 0) {
            data.parcelItems.forEach(item => {
                const name = item.item_name || 'Unknown Item';
                const quantity = item.quantity || 0;
                const sku = item.sku || 'N/A';
                const serial = item.serial_number || 'N/A';
                const price = typeof item.unit_price === 'number' ? item.unit_price.toFixed(2) + ' €' : 'N/A';

                const itemHTML = `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <h6 class="mb-1">${name}</h6>
                            <span class="badge bg-primary rounded-pill">Qty: ${quantity}</span>
                        </div>
                        <p class="mb-1 text-muted">
                            <small>SKU: ${sku} | SN: ${serial}</small>
                        </p>
                        <small class="fw-bold">Unit Price: ${price}</small>
                    </div>
                `;
                itemsList.append(itemHTML);
            });
        } else {
            const noItemsHTML = '<div class="list-group-item text-center text-muted">No item details available for this parcel.</div>';
            itemsList.append(noItemsHTML);
        }

        feather.replace();
        parcelDetailModal.show();
    }

    //================================================================================
    // 5. FILTER LOGIC AND FUNCTIONALITIES
    //================================================================================

    function setupMiniPagination(dt_instance) {
        $('.dt-action-buttons-container').append(`
            <div id="datatable-mini-pagination" class="d-flex align-items-center ms-2">
                <button id="mini-prev" class="btn btn-sm btn-flat-secondary px-50 py-25 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-feather="chevron-left"></i></button>
                <span id="mini-page-info" class="small text-muted mx-1" style="min-width: 80px; text-align: center;">–</span>
                <button id="mini-next" class="btn btn-sm btn-flat-secondary px-50 py-25 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i data-feather="chevron-right"></i></button>
            </div>`);
        feather.replace();

        function updatePaginationInfo() {
            const info = dt_instance.page.info();
            const start = info.recordsTotal === 0 ? 0 : info.start + 1;
            const end = info.end;
            const total = info.recordsDisplay;
            $('#mini-page-info').text(`${start}–${end} of ${total}`);
            $('#mini-prev').prop('disabled', info.page === 0);
            $('#mini-next').prop('disabled', info.page === info.pages - 1);
        }

        $('#mini-prev').on('click', function () { dt_instance.page('previous').draw('page'); });
        $('#mini-next').on('click', function () { dt_instance.page('next').draw('page'); });
        dt_instance.on('draw', updatePaginationInfo);

        updatePaginationInfo();
    }

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (!dt_parcels || settings.sTableId !== dt_parcels.table().node().id) {
            return true;
        }

        const rowData = dt_parcels.row(dataIndex).data();
        const dateRange = $('#date-range').val();
        if (dateRange && dateRange.includes('to')) {
            const [from, to] = dateRange.split(' to ');
            const dateToCheck = rowData.hand_over_date || rowData.last_update || '';
            const formattedDate = dateToCheck ? dateToCheck.split(' ')[0] : '';
            if (!formattedDate || (from && formattedDate < from) || (to && formattedDate > to)) {
                return false;
            }
        }

        if (selectedStatuses.length > 0 && !selectedStatuses.includes(String(rowData.order_status))) return false;
        if (selectedCustomers.length > 0 && !selectedCustomers.includes(rowData.customer_name)) return false;
        if (selectedStorage.length > 0 && !selectedStorage.includes(rowData.storage)) return false;
        if (selectedDispatchers.length > 0 && !selectedDispatchers.includes(rowData.dispatcher_profile)) return false;

        return true;
    });
    
    function populateSidebarFilters(allOrdersData) {
        const uniqueCustomers = [...new Set(allOrdersData.map(row => row.customer_name))].sort();
        const uniqueStorage = [...new Set(allOrdersData.map(row => row.storage))].filter(Boolean).sort();
        const uniqueDispatchers = [...new Set(allOrdersData.flatMap(order => order.parcels?.map(p => p.dispatcher_profile) || []))].filter(Boolean).sort();
        
        statusFilter.empty().append('<option value="14">Packet</option><option value="15">Shipped</option>');
        customerFilter.empty();
        uniqueCustomers.forEach(c => customerFilter.append(`<option value="${c}">${c}</option>`));
        storageFilter.empty();
        uniqueStorage.forEach(s => storageFilter.append(`<option value="${s}">${s}</option>`));
        dispatcherFilter.empty();
        uniqueDispatchers.forEach(d => dispatcherFilter.append(`<option value="${d}">${d}</option>`));
        
        statusFilter.select2({ placeholder: 'Select Status', width: '100%', allowClear: true }).val(selectedStatuses).trigger('change');
        customerFilter.select2({ placeholder: 'Select Customer', width: '100%', allowClear: true }).val(selectedCustomers).trigger('change');
        storageFilter.select2({ placeholder: 'Select Storage', width: '100%', allowClear: true }).val(selectedStorage).trigger('change');
        dispatcherFilter.select2({ placeholder: 'Select Dispatcher', width: '100%', allowClear: true }).val(selectedDispatchers).trigger('change');
    }

    function setupFilterEvents() {
        searchInput.on('input', applyAllFilters);
        statusFilter.on('change', function () { selectedStatuses = $(this).val() || []; applyAllFilters(); });
        customerFilter.on('change', function () { selectedCustomers = $(this).val() || []; applyAllFilters(); });
        storageFilter.on('change', function () { selectedStorage = $(this).val() || []; applyAllFilters(); });
        dispatcherFilter.on('change', function () { selectedDispatchers = $(this).val() || []; applyAllFilters(); });

         initializeDateRangePicker('#date-range');

        // Listener que se dispara cuando el Date Range Picker cambia
        dateRangeInput.on('change', function() {
            dt_parcels.draw();
            updateBadges();
        });

        activeFilters.on('click', '.remove-filter', function () {
            const badge = $(this).closest('.badge');
            const value = String(badge.data('value'));
            const type = badge.data('type');
            
            if (type === 'search') searchInput.val('');
            if (type === 'date') {
             if (datePickerInstance) datePickerInstance.clear();
            }
            if (type === 'status') { selectedStatuses = selectedStatuses.filter(s => s !== value); statusFilter.val(selectedStatuses).trigger('change'); }
            if (type === 'customer') { selectedCustomers = selectedCustomers.filter(c => c !== value); customerFilter.val(selectedCustomers).trigger('change'); }
            if (type === 'storage') { selectedStorage = selectedStorage.filter(s => s !== value); storageFilter.val(selectedStorage).trigger('change'); }
            if (type === 'dispatcher') { selectedDispatchers = selectedDispatchers.filter(d => d !== value); dispatcherFilter.val(selectedDispatchers).trigger('change'); }
            
            if (type === 'search' || type === 'date') applyAllFilters();
        });

        $(document).on('click', '#clear-all-filters', clearAllFilters);
        $('#clear-filters').on('click', clearAllFilters);
    }

    function applyAllFilters() {
        if (dt_parcels) {
            dt_parcels.draw();
            updateBadges();
        }
    }
    
    function createBadge(type, value, label) { return $(`<span class="badge rounded-pill bg-light-primary me-1 px-75 py-75 fs-6" data-type="${type}" data-value="${value}">${label}<span class="ms-1 cursor-pointer remove-filter">&times;</span></span>`); }

    function updateBadges() {
        activeFilters.empty();
        const query = searchInput.val(), dateRange = $('#date-range').val();
        
        if (query.trim()) activeFilters.append(createBadge('search', query, `Search: ${query}`));
        if ($('#date-range').val().trim() !== '') activeFilters.append(createBadge('date', $('#date-range').val(), `Date: ${$('#date-range').val()}`));
        selectedStatuses.forEach(s => activeFilters.append(createBadge('status', s, `Status: ${statusMap[s]?.title || s}`)));
        selectedCustomers.forEach(c => activeFilters.append(createBadge('customer', c, `Customer: ${c}`)));
        selectedStorage.forEach(s => activeFilters.append(createBadge('storage', s, `WH: ${s}`)));
        selectedDispatchers.forEach(d => activeFilters.append(createBadge('dispatcher', d, `Dispatcher: ${d}`)));

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
            dt_parcels.search('').draw();
            updateBadges();
        }

        activeFilters.on('click', '.remove-filter', function () {
            const badge = $(this).closest('.badge');
            const value = badge.data('value');
            const type = badge.data('type');
            if (type === 'search') { searchInput.val(''); dt_parcels.search('').draw(); }
            if (type === 'date') { $('#date-range').val(''); dt_parcels.draw(); }
            if (type === 'status') { selectedStatuses = selectedStatuses.filter(s => String(s) !== String(value)); statusFilter.val(selectedStatuses).trigger('change'); }
            if (type === "customer") { selectedCustomers = selectedCustomers.filter(s => String(s) !== String(value)); customerFilter.val(selectedCustomers).trigger('change'); }
            if (type === "storage") { selectedStorage = selectedStorage.filter(s => String(s) !== String(value)); storageFilter.val(selectedStorage).trigger('change'); }
            updateBadges();
        });
});
