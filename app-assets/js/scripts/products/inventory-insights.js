'use strict';

// =================================================================
// VARIABLES GLOBALES PARA EXPORTACIÓN
// =================================================================
let totalProducts = 0;
let totalLowStock = 0;
let totalOutOfStock = 0;
let totalCriticalLowStock = 0;
let topCustomers = [];
let reservedZero = [];
let inactiveStock = [];
let missingEAN = [];
let stale = [];

// Función principal para generar insights
function generateInventoryInsights() {
    console.log('📈 Starting inventory insights generation...');
    
    const container = document.getElementById('insights-container');
    if (!container) {
        console.error('❌ insights-container not found');
        return;
    }

    // Mostrar loading
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading insights...</span>
            </div>
            <p class="mt-2 text-muted">Generating insights...</p>
        </div>
    `;

    // Intentar obtener datos de múltiples fuentes
    let productData = [];

    
    // Fuente 1: window.productData (si existe)
    if (window.productData && Array.isArray(window.productData)) {
        console.log('📊 Using window.productData');
        productData = window.productData;
    }
    // Fuente 2: DataTable (si existe)
    else if (window.productDatatable) {
        console.log('📊 Using DataTable data');
        try {
            productData = window.productDatatable.rows().data().toArray();
        } catch (error) {
            console.warn('❌ Could not get data from DataTable:', error);
        }
    }
    // Fuente 3: Buscar la tabla manualmente
    else {
        console.log('🔍 Searching for product table data...');
        const table = document.getElementById('product-table');
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            productData = Array.from(rows).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    customer: cells[1]?.textContent?.trim() || '',
                    quantity: parseInt(cells[6]?.textContent) || 0, // Columna quantity
                    reservableQuantity: parseInt(cells[7]?.textContent) || 0,
                    status: cells[14]?.textContent?.trim() || 'Active',
                    ean: cells[4]?.textContent?.trim() || '',
                    updatedAt: cells[13]?.textContent?.trim() || null
                };
            });
        }
    }

    console.log('📋 Data for insights:', productData.length, 'products');

    // Si no hay datos, mostrar mensaje
    if (!productData || productData.length === 0) {
        console.warn('❌ No product data available for insights');
        container.innerHTML = `
            <div class="alert alert-info mb-1 mt-1">
                <h6>No Product Data Available</h6>
                <p class="mb-0">Please check the inventory list first to load product data.</p>
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="window.location.reload()">
                        Refresh Page
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="generateInventoryInsights()">
                        Retry
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Procesar los datos
    const now = new Date();
    
    // Normalizador de campos - USANDO LA ESTRUCTURA DE TU DATATABLE
    const norm = p => ({
        customer: p.customer || '',
        quantity: p.quantity || 0, // Columna quantity de data-table-init.js
        reservableQuantity: p.reservableQuantity || 0,
        ean: p.ean || '',
        status: p.status || 'Active',
        updatedAt: p.updatedAt || null
    });

    const data = productData.map(norm);
    console.log('📊 Normalized data for insights:', data);

    // =================================================================
    // CÁLCULOS DE INSIGHTS - CON LOW STOCK ≤ 20
    // =================================================================
    const LOW_STOCK_THRESHOLD = 20; // Definir el umbral de bajo stock
    
    const customersLow = {};
    
    // ACTUALIZAR LAS VARIABLES GLOBALES
    totalProducts = data.length;
    totalLowStock = 0; // quantity ≤ 20
    totalOutOfStock = 0; // quantity = 0
    totalCriticalLowStock = 0; // quantity ≤ 5

    data.forEach(p => {
        const quantity = parseInt(p.quantity) || 0;
        
        // Contar productos con bajo stock (quantity ≤ 20)
        if (quantity > 0 && quantity <= LOW_STOCK_THRESHOLD) {
            totalLowStock++;
            
            // Contar stock crítico (quantity ≤ 5)
            if (quantity <= 5) {
                totalCriticalLowStock++;
            }
            
            // Agrupar por cliente para top customers
            if (p.customer) {
                customersLow[p.customer] = (customersLow[p.customer] || 0) + 1;
            }
        }
        
        // Contar productos sin stock (quantity = 0)
        if (quantity === 0) {
            totalOutOfStock++;
        }
    });

    topCustomers = Object.entries(customersLow)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    reservedZero = data.filter(p => p.reservableQuantity > 0 && p.quantity === 0);
    inactiveStock = data.filter(p => p.status === 'Inactive' && p.quantity > 0);
    missingEAN = data.filter(p => !p.ean || p.ean.trim() === '');
    stale = data.filter(p => {
        if (!p.updatedAt) return false;
        const diffDays = (now - new Date(p.updatedAt)) / 86400000;
        return diffDays > 90;
    });

    console.log('📈 Insights calculated:', {
        totalProducts,
        totalLowStock, // quantity ≤ 20
        totalCriticalLowStock, // quantity ≤ 5
        totalOutOfStock,
        topCustomers: topCustomers.length,
        reservedZero: reservedZero.length,
        inactiveStock: inactiveStock.length,
        missingEAN: missingEAN.length,
        stale: stale.length
    });

    // =================================================================
    // GENERAR HTML CON LOW STOCK ≤ 20
    // =================================================================
    const html = `
        <div class="row">
            <!-- Header con botones de exportación alineados a la derecha -->
            <div class="col-12 mb-2">
                <div class="text-end"> <!-- Clase text-end para alinear a la derecha -->
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" onclick="exportInsightsToPDF()">
                            <i data-feather="download" class="me-1"></i> Export PDF
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="exportInsightsToExcel()">
                            <i data-feather="download" class="me-1"></i> Export Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <!-- Quick Stats -->
            <div class="row match-height mb-1">
            <!-- Total Products Card -->
            <div class="col-lg-3 col-md-6 col-12">
                <div class="card card-statistic">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="fw-bolder mb-25">Total Products</h6>
                                <h2 class="text-primary mb-0">${totalProducts}</h2>
                                <p class="text-muted">Sku(s)</p>
                            </div>
                            <div>
                                <div class="avatar bg-light-primary p-25">
                                    <span class="avatar-content">
                                        <i data-feather="package" class="font-medium-5"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <small class="text-muted">Across all warehouses</small>
                    </div>
                </div>
            </div>

            <!-- Low Stock Card -->
            <div class="col-lg-3 col-md-6 col-12">
                <div class="card card-statistic">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="fw-bolder mb-25">Low Stock</h6>
                                <h2 class="text-warning mb-0">${totalLowStock}</h2>
                                <p class="text-muted">Sku(s)</p>
                            </div>
                            <div>
                                <div class="avatar bg-light-warning p-50">
                                    <span class="avatar-content">
                                        <i data-feather="alert-triangle" class="font-medium-5"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <small class="text-muted">Quantity ≤ 20 units</small>
                    </div>
                </div>
            </div>

            <!-- Critical Stock Card -->
            <div class="col-lg-3 col-md-6 col-12">
                <div class="card card-statistic">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="fw-bolder mb-25">Critical Stock</h6>
                                <h2 class="text-danger mb-0">${totalCriticalLowStock}</h2>
                                <p class="text-muted">Sku(s)</p>
                            </div>
                            <div>
                                <div class="avatar bg-light-danger p-50">
                                    <span class="avatar-content">
                                        <i data-feather="x-circle" class="font-medium-5"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <small class="text-muted">Quantity ≤ 5 units</small>
                    </div>
                </div>
            </div>

            <!-- Out of Stock Card -->
            <div class="col-lg-3 col-md-6 col-12">
                <div class="card card-statistic">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="fw-bolder mb-25">Out of Stock</h6>
                                <h2 class="text-dark mb-0">${totalOutOfStock}</h2>
                                <p class="text-muted">Sku(s)</p>
                            </div>
                            <div>
                                <div class="avatar bg-light-dark p-50">
                                    <span class="avatar-content">
                                        <i data-feather="minus-circle" class="font-medium-5"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <small class="text-muted">0 units available</small>
                    </div>
                </div>
            </div>
        </div>
            
            <!-- Low Stock Analysis -->
            <div class="col-md-6 mb-3">
                <div class="card h-100 border-primary">
                    <div class="card-header bg-light-primary text-dark">
                        <h5 class="card-title mb-0">⚠️ Low Stock Analysis (≤ 20 units)</h5>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-warning mb-3 mt-2 p-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Total Low Stock Items</strong><br>
                                    <span class="h4 mb-0">${totalLowStock}</span> SKUs
                                </div>
                                <i data-feather="alert-triangle" class="text-warning" style="width: 40px; height: 40px;"></i>
                            </div>
                        </div>    
                        <div class="progress mb-3" style="height: 25px;">
                            <div class="progress-bar bg-danger" role="progressbar" 
                                 style="width: ${totalCriticalLowStock > 0 ? (totalCriticalLowStock / totalLowStock * 100) : 0}%" 
                                 aria-valuenow="${totalCriticalLowStock}" aria-valuemin="0" aria-valuemax="${totalLowStock}">
                                Critical: ${totalCriticalLowStock}
                            </div>
                            <div class="progress-bar bg-warning" role="progressbar" 
                                 style="width: ${totalLowStock - totalCriticalLowStock > 0 ? ((totalLowStock - totalCriticalLowStock) / totalLowStock * 100) : 0}%" 
                                 aria-valuenow="${totalLowStock - totalCriticalLowStock}" aria-valuemin="0" aria-valuemax="${totalLowStock}">
                                Low: ${totalLowStock - totalCriticalLowStock}
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <h6>Breakdown:</h6>
                            <ul class="list-unstyled">
                                <li class="mb-1">
                                    <span class="badge bg-danger me-2">Critical</span>
                                    ${totalCriticalLowStock} SKUs with ≤ 5 units
                                </li>
                                <li class="mb-1">
                                    <span class="badge bg-warning me-2">Low</span>
                                    ${totalLowStock - totalCriticalLowStock} SKUs with 6-20 units
                                </li>
                                <li class="mb-1">
                                    <span class="badge bg-success me-2">Good</span>
                                    ${totalProducts - totalLowStock - totalOutOfStock} SKUs with > 20 units
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Top Customers with Low Stock -->
            <div class="col-md-6 mb-3">
                <div class="card h-100 border-primary">
                    <div class="card-header bg-light-primary text-dark">
                        <h5 class="card-title mb-0"> Top Customers with Low Stock</h5>
                    </div>
                    <div class="card-body mt-1">
                        ${topCustomers.length > 0 ? `
                            <div class="customer-list">
                                ${topCustomers.map(([name, count], index) => {
                                    const percentage = Math.round((count / totalLowStock) * 100);
                                    return `
                                    <div class="customer-item mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="fw-medium text-truncate">
                                                <span class="badge bg-light text-dark me-50">${index + 1}</span>
                                                ${name}
                                            </span>
                                            <span class="badge bg-warning rounded-pill">${count} SKUs</span>
                                        </div>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar bg-primary" role="progressbar" 
                                                style="width: ${percentage}%" 
                                                aria-valuenow="${percentage}" 
                                                aria-valuemin="0" 
                                                aria-valuemax="100">
                                            </div>
                                        </div>
                                        <small class="text-muted">${percentage}% of low stock items</small>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-2">
                                <i data-feather="users" class="text-muted mb-2" style="width: 48px; height: 48px;"></i>
                                <p class="text-muted mb-0">No customers with low stock items</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
        </div>
        
        <!-- Additional Inventory Alerts -->
        <div class="row">
            <div class="col-12">
                <div class="card border-0">
                    <div class="card-header bg-light-primary">
                        <h5 class="card-title mb-0">
                            <i data-feather="alert-octagon" class="me-25 text-warning"></i>
                            Inventory Indicators
                        </h5>
                    </div>
                    <div class="card-body mt-2">
                        <div class="row">
                            <!-- Reserved but 0 Available -->
                            <div class="col-xl-4 col-md-6 col-12 mb-1">
                                <div class="card card-statistic border-warning">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <div>
                                                <h6 class="fw-bolder mb-0">Critical Alerts</h6>
                                                <h2 class="text-warning">${reservedZero.length}</h2>
                                            </div>
                                            <div class="avatar bg-light-warning p-50">
                                                <span class="avatar-content">
                                                    <i data-feather="alert-triangle" class="font-medium-5 text-warning"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <small class="text-muted">Reserved but 0 available</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Inactive with Stock -->
                            <div class="col-xl-4 col-md-6 col-12 mb-1">
                                <div class="card card-statistic border-secondary">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <div>
                                                <h6 class="fw-bolder mb-0">Inactive with Stock</h6>
                                                <h2 class="text-secondary">${inactiveStock.length}</h2>
                                            </div>
                                            <div class="avatar bg-light-secondary p-50">
                                                <span class="avatar-content">
                                                    <i data-feather="package" class="font-medium-5 text-secondary"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <small class="text-muted">Inactive with inventory</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Not Updated > 90 days -->
                            <div class="col-xl-4 col-md-6 col-12 mb-1">
                                <div class="card card-statistic border-dark">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <div>
                                                <h6 class="fw-bolder mb-0">Stale Products</h6>
                                                <h2 class="text-dark">${stale.length}</h2>
                                            </div>
                                            <div class="avatar bg-light-dark p-50">
                                                <span class="avatar-content">
                                                    <i data-feather="clock" class="font-medium-5 text-dark"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <small class="text-muted">Not updated > 90 days</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Summary -->
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-light-primary mb-2">
                        <h5 class="card-title mb-0">📊 Inventory Health Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-md-4 mb-1">
                                <div class="card bg-light-success">
                                    <div class="card-body">
                                        <h3 class=" mb-1">${Math.round((totalProducts - totalLowStock - totalOutOfStock) / totalProducts * 100)}%</h3>
                                        <small class="text-bold">Healthy Stock</small>
                                        <p class="mb-0 small">${totalProducts - totalLowStock - totalOutOfStock} SKUs with > 20 units</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-1">
                                <div class="card bg-light-warning">
                                    <div class="card-body">
                                        <h3 class="text mb-1">${Math.round(totalLowStock / totalProducts * 100)}%</h3>
                                        <small class="text-muted">Low Stock</small>
                                        <p class="mb-0 small">${totalLowStock} SKUs with ≤ 20 units</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-1">
                                <div class="card bg-light-danger">
                                    <div class="card-body">
                                        <h3 class="text mb-1">${Math.round(totalOutOfStock / totalProducts * 100)}%</h3>
                                        <small class="text-muted">Out of Stock</small>
                                        <p class="mb-0 small">${totalOutOfStock} SKUs with 0 units</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="mb-0 text-secondary text-center mt-1">
                            <strong>Analysis completed:</strong> ${new Date().toLocaleString()} | 
                            Based on ${totalProducts} products in inventory
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Reemplazar iconos Feather
    if (window.feather) {
        setTimeout(() => {
            feather.replace({ width: 18, height: 18 });
        }, 100);
    }
    
    console.log('✅ Insights generated successfully with Low Stock ≤ 20');
}

// =================================================================
// FUNCIONES DE EXPORTACIÓN
// =================================================================

// Función para exportar a PDF
function exportInsightsToPDF() {
    console.log('📄 Exporting insights to PDF...');
    
    // Verificar que html2pdf esté disponible
    if (typeof html2pdf === 'undefined') {
        console.error('❌ html2pdf library not loaded');
        alert('PDF export functionality is not available. Please make sure html2pdf is loaded.');
        return;
    }

    const insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) {
        alert('No insights data available to export.');
        return;
    }

    // Crear un elemento temporal para la exportación
    const exportElement = document.createElement('div');
    exportElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #2c5aa0; text-align: center; margin-bottom: 10px;">Inventory Insights Report</h1>
            <p style="text-align: center; color: #666; margin-bottom: 20px;">
                Generated on: ${new Date().toLocaleString()}
            </p>
            ${generateExportHTML()}
        </div>
    `;

    // Configuración de html2pdf
    const options = {
        margin: [10, 10, 10, 10],
        filename: `inventory-insights-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generar PDF
    html2pdf().set(options).from(exportElement).save();
}

// Función para exportar a Excel
function exportInsightsToExcel() {
    console.log('📊 Exporting insights to Excel...');
    
    // Verificar que XLSX esté disponible
    if (typeof XLSX === 'undefined') {
        console.error('❌ SheetJS library not loaded');
        alert('Excel export functionality is not available. Please make sure SheetJS is loaded.');
        return;
    }

    try {
        // Crear datos para Excel
        const workbook = XLSX.utils.book_new();
        
        // Hoja 1: Resumen de métricas
        const summaryData = [
            ['Inventory Insights Summary', ''],
            ['Generated on', new Date().toLocaleString()],
            [''],
            ['METRIC', 'VALUE', 'DESCRIPTION'],
            ['Total Products', totalProducts, 'Across all warehouses'],
            ['Low Stock (≤20 units)', totalLowStock, 'Products with quantity ≤ 20'],
            ['Critical Stock (≤5 units)', totalCriticalLowStock, 'Products with quantity ≤ 5'],
            ['Out of Stock', totalOutOfStock, 'Products with 0 units available'],
            ['Critical Alerts', reservedZero.length, 'Reserved but 0 available'],
            ['Inactive with Stock', inactiveStock.length, 'Inactive products with inventory'],
            ['Stale Products', stale.length, 'Not updated in 90+ days'],
            ['Missing EAN/Barcode', missingEAN.length, 'Products without identification']
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Hoja 2: Top Customers con Low Stock
        if (topCustomers.length > 0) {
            const customersData = [
                ['Top Customers with Low Stock', '', ''],
                ['Rank', 'Customer Name', 'Low Stock SKUs', 'Percentage of Total Low Stock']
            ];
            
            topCustomers.forEach(([name, count], index) => {
                const percentage = Math.round((count / totalLowStock) * 100);
                customersData.push([index + 1, name, count, `${percentage}%`]);
            });
            
            const customersSheet = XLSX.utils.aoa_to_sheet(customersData);
            XLSX.utils.book_append_sheet(workbook, customersSheet, 'Top Customers');
        }
        
        // Hoja 3: Health Analysis
        const healthData = [
            ['Inventory Health Analysis', '', ''],
            ['Category', 'Count', 'Percentage', 'Description'],
            ['Healthy Stock', totalProducts - totalLowStock - totalOutOfStock, 
             `${Math.round((totalProducts - totalLowStock - totalOutOfStock) / totalProducts * 100)}%`, 
             'SKUs with > 20 units'],
            ['Low Stock', totalLowStock, 
             `${Math.round(totalLowStock / totalProducts * 100)}%`, 
             'SKUs with ≤ 20 units'],
            ['Out of Stock', totalOutOfStock, 
             `${Math.round(totalOutOfStock / totalProducts * 100)}%`, 
             'SKUs with 0 units']
        ];
        
        const healthSheet = XLSX.utils.aoa_to_sheet(healthData);
        XLSX.utils.book_append_sheet(workbook, healthSheet, 'Health Analysis');
        
        // Descargar archivo
        XLSX.writeFile(workbook, `inventory-insights-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        console.log('✅ Excel export completed successfully');
        
    } catch (error) {
        console.error('❌ Error exporting to Excel:', error);
        alert('Error exporting to Excel: ' + error.message);
    }
}

// Función auxiliar para generar HTML de exportación
function generateExportHTML() {
    const healthyStockCount = totalProducts - totalLowStock - totalOutOfStock;
    const healthyStockPercentage = Math.round(healthyStockCount / totalProducts * 100);
    const lowStockPercentage = Math.round(totalLowStock / totalProducts * 100);
    const outOfStockPercentage = Math.round(totalOutOfStock / totalProducts * 100);
    
    return `
        <div style="margin-bottom: 10px;">
            <h4 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">Key Metrics</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Metric</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Count</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Products</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalProducts}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Across all warehouses</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Low Stock (≤20 units)</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalLowStock}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Products needing replenishment</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Critical Stock (≤5 units)</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalCriticalLowStock}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Urgent attention required</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Out of Stock</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalOutOfStock}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">0 units available</td>
                </tr>
            </table>
        </div>
        
        <div style="margin-bottom: 10px;">
            <h4 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">Inventory Health</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Category</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Count</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Percentage</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Healthy Stock</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${healthyStockCount}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${healthyStockPercentage}%</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Low Stock</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalLowStock}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${lowStockPercentage}%</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Out of Stock</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalOutOfStock}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${outOfStockPercentage}%</td>
                </tr>
            </table>
        </div>
        
        ${topCustomers.length > 0 ? `
        <div style="margin-bottom: 10px;">
            <h4 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">Top Customers with Low Stock</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Rank</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Customer Name</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Low Stock SKUs</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Percentage</th>
                </tr>
                ${topCustomers.map(([name, count], index) => {
                    const percentage = Math.round((count / totalLowStock) * 100);
                    return `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${count}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${percentage}%</td>
                    </tr>
                    `;
                }).join('')}
            </table>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 10px;">
            <h4 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">Additional Alerts</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Alert Type</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Count</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Critical Alerts</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${reservedZero.length}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Reserved but 0 available</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Inactive with Stock</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${inactiveStock.length}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Inactive products with inventory</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Stale Products</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${stale.length}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Not updated in 90+ days</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Missing EAN/Barcode</strong></td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${missingEAN.length}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">Products without identification</td>
                </tr>
            </table>
        </div>
    `;
}

// Hacer las funciones de exportación disponibles globalmente
window.exportInsightsToPDF = exportInsightsToPDF;
window.exportInsightsToExcel = exportInsightsToExcel;

// Función de inicialización para compatibilidad
function initializeInventoryInsights() {
    console.log('🔧 initializeInventoryInsights called');
    
    // Pequeño delay para asegurar que los datos estén cargados
    setTimeout(() => {
        // Solo generar si el tab está activo
        if ($('#tab-insights').hasClass('active')) {
            console.log('📊 Tab is active, generating insights immediately');
            generateInventoryInsights();
        } else {
            console.log('📊 Tab is not active, insights will generate when tab is opened');
        }
    }, 1000);
}

// Auto-inicialización cuando el script se carga
console.log('📊 inventory-insights.js loaded successfully');
console.log('🔍 generateInventoryInsights:', typeof generateInventoryInsights);
console.log('🔍 initializeInventoryInsights:', typeof initializeInventoryInsights);

// Hacer las funciones disponibles globalmente
window.generateInventoryInsights = generateInventoryInsights;
window.initializeInventoryInsights = initializeInventoryInsights;