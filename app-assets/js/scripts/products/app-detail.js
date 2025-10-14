'use strict';

$(function () {
    // ===================================================================================
    // 1. DECLARACIONES Y CONSTANTES
    // ===================================================================================
    const statusObj = { Active: { class: 'badge-light-success' }, Inactive: { class: 'badge-light-danger' } };
    const orderStatusMap = {
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

    // ===================================================================================
    // 2. FUNCIONES DE RENDERIZADO
    // ===================================================================================

    /**
     * Renderiza la tabla de órdenes de salida.
     * @param {Array} orders - La lista de órdenes que contienen el producto.
     * @param {string} productSku - El SKU del producto actual para encontrar la cantidad correcta.
     */
    function renderOrdersTable(orders, productSku) {
        const tableBody = $('#orders-out-table-body');
        tableBody.empty();

        if (!orders || orders.length === 0) {
            tableBody.html('<tr><td colspan="8" class="text-center text-muted">This product is not found in any outgoing orders.</td></tr>');
            return;
        }

        orders.forEach(order => {
            const itemInOrder = order.items.find(item => item.sku === productSku);
            const quantity = itemInOrder ? itemInOrder.quantity : 'N/A';
            const statusInfo = orderStatusMap[order.status];
            const id = encodeURIComponent(order.order_number);
            // Allocated usará la cantidad del item como placeholder
            const allocated = quantity;

            const row = `
                <tr>
                    <td><a href="#" class="fw-bold js-go-order" data-order="${id}">${id}</a></td>
                    <td>${order.creation_date.split(' ')[0]}</td>
                    <td>${quantity}</td>
                    <td> <span class="badge rounded-pill ${statusInfo.tableClass}">${statusInfo.title}</span></td>
                </tr>`;
            tableBody.append(row);
        });
    }

    /**
     * Renderiza la página completa con los datos del producto y las órdenes.
     * @param {object} product - El objeto del producto.
     * @param {Array} matchingOrders - Las órdenes que contienen este producto.
     */
    function renderPage(product, matchingOrders) {
        // --- Lógica de Advertencias ---
        let warningHtml = '';
        if (product.status === 'Inactive' || product.quantity === 0) {
            warningHtml = `<div class="stock-warning out-of-stock mb-1"><i data-feather="x-circle"></i><span>Out of Stock / Inactive</span></div>`;
        } else if (product.reservableQuantity < 20) {
            warningHtml = `<div class="stock-warning low-stock mb-1"><i data-feather="alert-triangle"></i><span>Low Stock Warning</span></div>`;
        }
        
        // --- Inyecta la información en el HTML ---
        $('#breadcrumb-product-name').text(product.name);
        $('#product-name').text(product.name);
        $('#product-sku').text(product.sku);
        $('#product-status-badge').html(`<span class="badge rounded-pill ${statusObj[product.status].class}">${product.status}</span>`);
        $('#product-warnings').html(warningHtml);
        $('#product-customer').text(product.customer);
        
        $('#qty-total').text(product.quantity);
        $('#qty-available').text(product.reservableQuantity);
        $('#qty-reserved').text(product.quantity - product.reservableQuantity);
        $('#qty-virtual').text(product.virtualQuantity);
        
        $('#spec-ean').text(product.ean);
        $('#spec-barcode').text(product.barcode);
        $('#spec-weight').text(`${product.weight} g`);
        $('#spec-volume').text(`${product.unitVolume} cm³`);
        $('#spec-created-at').text(product.createdAt);
        $('#spec-updated-at').text(product.updatedAt);

        // --- Renderiza la tabla de órdenes ---
        renderOrdersTable(matchingOrders, product.sku);

        // --- Galería de Imágenes ---
        const mainImage = $('#main-product-image');
        const thumbnailGallery = $('#thumbnail-gallery');
        if (product.images && product.images.length > 0) {
            mainImage.attr('src', product.images[0]);
            thumbnailGallery.empty();
            product.images.forEach((imgUrl, index) => {
                const thumb = $('<img>', { src: imgUrl, class: 'img-fluid rounded ' + (index === 0 ? 'active' : '') });
                thumb.on('click', function() {
                    mainImage.attr('src', imgUrl);
                    thumbnailGallery.find('img').removeClass('active');
                    $(this).addClass('active');
                });
                thumbnailGallery.append(thumb);
            });
        } else {
            mainImage.attr('src', 'https://placehold.co/600x600/F8F7FA/CCC?text=No+Image');
        }

        feather.replace();
    }

    // ===================================================================================
    // 3. LÓGICA DE INICIALIZACIÓN
    // ===================================================================================
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            $('.content-body').html('<div class="alert alert-danger">No product ID provided.</div>');
            return;
        }

        try {
            // Cargamos ambos conjuntos de datos en paralelo para mayor eficiencia
            const [product, allOrders] = await Promise.all([
                ProductDetailService.getProductById(productId),
                ProductDetailService.getAllOrders()
            ]);
            
            // Filtramos las órdenes para encontrar solo las que contienen nuestro producto
            const matchingOrders = allOrders.filter(order => 
                order.items.some(item => item.sku === product.sku)
            );
            
            // Renderizamos la página con toda la información
            renderPage(product, matchingOrders);

        } catch (error) {
            console.error("Error loading product details:", error);
            $('.content-body').html(`<div class="alert alert-danger">${error}</div>`);
        }
    }

    // ===================================================================================
    // 4. ASIGNACIÓN DE EVENTOS GLOBALES
    // ===================================================================================
    $(document).on('click', '.js-go-order', function(e) {
        e.preventDefault();
        const orderNumber = $(this).data('order');
        if (orderNumber) {
            const url = `../orderDetail.html?order_number=${orderNumber}`// URL relativa simplificada
            window.open(url, '_blank');
        }
    });

    // --- INICIAMOS LA APLICACIÓN ---
    init();
});