const inventoryDataTable = (() => {
    let dt;
    const init = (callback) => {
        const table = $('#inventory-all-table');
        if (!table.length) return;

        inventoryApiService.fetchAllInventory().then(data => {
            table.find('thead tr').html(
                `<th>Customer</th>
                 <th>Total SKU's</th>
                 <th>Total Units</th>
                 <th>Available Qty</th>
                 <th>Reservable Qty</th>
                 <th>Virtual Qty</th>
                 <th>Volume</th>
                 <th>Status</th>
                 <th>Actions</th>`
            );

            dt = table.DataTable({
                data: data,
                serverSide: false,
                columns: [
                    { data: 'clientName' },
                    { data: 'totalSku' },
                    { data: 'totalUnits' },
                    { data: 'availableUnits' },
                    { data: 'reservedUnits' },
                    { data: 'virtualQty' },
                    { data: 'approxVolume', render: (d) => d.toFixed(2) + ' m³' },
                    { data: 'status', render: (d) => `<span class="badge rounded-pill badge-light-${d === 'Active' ? 'success' : 'secondary'}">${d}</span>` },
                    { data: null, orderable: false, searchable: false, render: (d, t, f) => 
                        `<div class="d-inline-flex">
                            <a class="pe-1 dropdown-toggle hide-arrow text-primary" data-bs-toggle="dropdown"><i data-feather="more-vertical"></i></a>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a href="javascript:;" class="dropdown-item" data-client-id="${f.clientId}"><i data-feather="eye" class="me-50"></i><span>Details</span></a>
                                <a href="javascript:;" class="dropdown-item" data-client-id="${f.clientId}"><i data-feather="download" class="me-50"></i><span>Generate Report</span></a>
                            </div>
                        </div>`
                    }
                ],
                
                // 👇 ESTA LÍNEA ES LA CLAVE. LA HEMOS COPIADO Y ADAPTADO DE TU REFERENCIA.
                dom:
                    '<"d-flex justify-content-between align-items-center mx-2 row"' +
                        '<"col-sm-12 col-md-6"l>' + // Selector "Show X entries"
                        '<"col-sm-12 col-md-6"f>' + // Campo de búsqueda
                    '>' +
                    't' + // La tabla en sí
                    '<"d-flex justify-content-between mx-2 row"' +
                        '<"col-sm-12 col-md-6"i>' + // Información "Showing X to X"
                        '<"col-sm-12 col-md-6"p>' + // Paginación
                    '>',

                language: { 
                    paginate: { previous: '&nbsp;', next: '&nbsp;' }
                },
                drawCallback: () => { 
                    if (feather) feather.replace({ width: 14, height: 14 }); 
                }
            });

            if (callback) callback(dt);
        });
    };
    const getInstance = () => dt;
    return { init, getInstance };
})();