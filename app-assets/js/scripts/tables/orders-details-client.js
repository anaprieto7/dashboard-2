/**
 * orders-details.js 
 *
 * Refactored logic for the order details page.
 * Uses a module pattern, state management (loading/error), and best practices.
 */

$(function () {
    'use strict';

    const orderDetailsPage = {
        //================================================================================
        // 1. STATUS, CONFIGURATION, AND SELECTORS
        //================================================================================
        
        orderId: null,
        currentOrderData: null, 
        shopifyModal: null, 
        deleteDocConfirmModal: null,
        editRecipientModal: null,
        editNotAllowedModal: null, 
        mockProductDatabase: [],
        editItemsModal: null,
        editItemsNotAllowedModal: null,
        assetPath: '/app-assets/',

        elements: {
            container: $('#orderDetailsContainer'),
            loadingIndicator: $('#loadingIndicator'),
            errorContainer: $('#errorContainer'),
            errorMessage: $('#errorMessage'),
            contentContainer: $('#contentContainer'),
            documentsCard: $('#documents'),
            recipientCard: $('#recipientInfo') 
        },
        
        config: {
            statusMap: {
                0:  { title: 'Draft', class: 'bg-info', icon: 'circle' },
                1:  { title: 'Faulty', class: 'bg-danger', icon: 'alert-triangle' },
                2:  { title: 'Incorrect Address', class: 'bg-danger', icon: 'map-pin' },
                3:  { title: 'Not in Stock', class: 'bg-danger', icon: 'box' },
                4:  { title: 'On Hold', class: 'bg-warning', icon: 'pause-circle' },
                5:  { title: 'Missing Invoice', class: 'bg-danger', icon: 'file-minus' },
                6:  { title: 'Delivery date not reached', class: 'bg-danger', icon: 'calendar' },
                7:  { title: 'Incorrect Country', class: 'bg-danger', icon: 'globe' },
                8:  { title: 'Known Issue', class: 'bg-warning', icon: 'alert-circle' },
                9:  { title: 'Open', class: 'bg-primary', icon: 'folder-plus' },
                10: { title: 'In Progress', class: 'bg-primary', icon: 'loader' },
                11: { title: 'In Picking', class: 'bg-primary', icon: 'shopping-bag' },
                12: { title: 'Ready for Packing', class: 'bg-primary', icon: 'package' },
                13: { title: 'Blocked Packet', class: 'bg-warning', icon: 'slash' },
                14: { title: 'Packet', class: 'bg-primary', icon: 'box' },
                15: { title: 'Shipped', class: 'bg-success', icon: 'truck' },
                16: { title: 'Cancelled', class: 'bg-danger', icon: 'x-circle' }
            },
           actionConfig: {
                // Acciones Principales (botones siempre visibles si están activos)
            cancelOrder: { text: 'Cancel Order', icon: 'x-circle', className: 'btn-danger', type: 'button', visibleOnStatus: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
            synchronize: { text: 'Synchronize', icon: 'zap', className: 'btn-info', type: 'button', visibleOnStatus: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
            requestInvestigation: { text: 'Request Investigation', icon: 'external-link', className: 'btn-dark', type: 'button', visibleOnStatus: [ 15] },
            uploadDocument: { text: 'Upload Document', icon: 'upload', type: 'dropdown', visibleOnStatus: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
            splitOrder: { text: 'Split Order', icon: 'layers', type: 'dropdown', visibleOnStatus: [ 4, 5, 6, 7, 8, 9] },
            generateBill: { text: 'Generate Bill', icon: 'file-text', type: 'dropdown', visibleOnStatus: [ ] },
            generateDeliveryNote: { text: 'Generate Delivery Note', icon: 'file', type: 'dropdown', visibleOnStatus: [] },
            prioritizeOrder: { text: 'Prioritize Order', icon: 'trending-up', type: 'dropdown', visibleOnStatus: [0, 1, 2, 3, 4, 7, 9] },
            changeShippingDispatcher: { text: 'Change Shipping Dispatcher', icon: 'truck', type: 'dropdown', visibleOnStatus: [1, 3, 4, 7, 9, 10, 11, 12, 13] },
            requestReturn: { text: 'Register Return', icon: 'tag', type: 'dropdown', visibleOnStatus: [15] }
            },
            ITEMS_PER_PAGE: 10,
            PARCELS_PER_PAGE: 10
        },

        //================================================================================
        // 2. MAIN INITIALIZATION METHOD
        //================================================================================
        
      init: function () {
        this.orderId = this.getOrderIdFromUrl();
        if (!this.orderId) {
            this.showError("Order ID not found in the URL.");
            return;
        }
        this.fetchOrderData();
        },

        getOrderIdFromUrl: function () {
        // 1) Hash (#order_number=...)
        if (window.location.hash) {
            const hs = new URLSearchParams(window.location.hash.slice(1));
            const idH = hs.get("order_number") || hs.get("order_id") || hs.get("orderNumber");
            if (idH) return idH;
        }

        // 2) Query (?order_number=... / ?order_id=...)
        const qs = new URLSearchParams(window.location.search);
        const idQ = qs.get("order_number") || qs.get("order_id") || qs.get("orderNumber");
        if (idQ) return idQ;

        // 3) Ruta /orderDetailClient/ORD123 o /orderDetailClient.html/ORD123
        const m = window.location.pathname.match(/orderDetailClient(?:\.html)?\/([^\/?#]+)/i);
        if (m && m[1]) return decodeURIComponent(m[1]);

        return null;
        },



        //================================================================================
        //  3. UI STATUS MANAGEMENT (LOAD, ERROR, CONTENT)
        //================================================================================

        showLoading: function() {
            this.elements.loadingIndicator.removeClass('d-none');
            this.elements.contentContainer.addClass('d-none');
            this.elements.errorContainer.addClass('d-none');
        },

        showError: function(message) {
            this.elements.loadingIndicator.addClass('d-none');
            this.elements.contentContainer.addClass('d-none');
            this.elements.errorMessage.text(message);
            this.elements.errorContainer.removeClass('d-none');
            feather.replace();
        },

        showContent: function() {
            this.elements.loadingIndicator.addClass('d-none');
            this.elements.errorContainer.addClass('d-none');
            this.elements.contentContainer.removeClass('d-none');
        },

        //================================================================================
        // 4. DATA LOGIC AND RENDERING
        //================================================================================
        
        fetchOrderData: function () {
            this.showLoading();
            const jsonUrl = this.assetPath + 'data/table-datatable.json';

            fetch(jsonUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(response => {
                    const data = response.data || [];
                    const order = data.find(o => o.order_number == this.orderId);

                    if (!order) {
                        this.showError(`Order with ID "${this.orderId}" was not found.`);
                        return;
                    }
                    
                    this.currentOrderData = order; // Guardamos la orden actual
                    this.renderPage(order);
                })
                .catch(error => {
                    console.error("❌ Failed to fetch order data:", error);
                    this.showError("There was a problem loading the order details. Please try again later.");
                });
        },

        renderPage: function(order) {
            this.renderOrderHeader(order);
            this.renderItemsList(order.items);
            this.renderParcels(order.parcels);
            this.adjustInternalLayoutForParcels(Array.isArray(order.parcels) && order.parcels.length > 0);
            this.renderRecipient(order.customer_recipient || order.recipient || {});
            this.renderTimeline(order.timeline, order);
            this.renderShopify(order.shopify);
            this.renderDocuments(order.documents);
            this.renderKnownIssues(order);

            this.initShopifyModal(); // Inicializamos el modal después de renderizar la página
            this.showContent();
            this.initDocumentActions();
            this.initRecipientActions();
            this.initDeleteDocConfirmationModal();
            this.initEditItemsModal();
            feather.replace();
        },

        //================================================================================
        //5. COMPONENT RENDERING FUNCTIONS
        //================================================================================

        renderOrderHeader: function(order) {
            const el = document.getElementById("orderHeader");
            const statusInfo = this.config.statusMap[order.status] || { title: 'Unknown', class: 'bg-secondary', icon: 'alert-triangle' };
            const creationDate = this.formatDate(order.creation_date);
            const lastUpdate = this.formatDate(order.last_update);
            const openedDate = this.formatDate(order.opened_at);
            const actionsHTML = this.generateActionsHTML(order);
            
            el.innerHTML = `
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h2 class="mb-0">Order ${order.order_number}</h2>
                        <span class="badge ${statusInfo.class} fs-6 d-inline-flex align-items-center">
                          <i data-feather="${statusInfo.icon}" class="me-25"></i> ${statusInfo.title}
                        </span>
                      </div>
                      <div class="d-flex align-items-center gap-25">
                        ${actionsHTML}
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-3"><p class="mb-1"><strong>External Order Id:</strong> <span>${order.external_order_id || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Category:</strong> <span>${order.category || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Warehouse:</strong> <span>${order.storage || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Additional Fee:</strong> <span>${order.fee || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Tracking N:</strong> <span>${order.tracking_number || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Priority:</strong> <span>${order.priority || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Dispatcher Profile:</strong> <span>${order.dispatcher_profile || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Total Invoice:</strong> <span>${order.invoice|| '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Creation Date:</strong> <span>${creationDate}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Extra Information:</strong> <span>${order.extra_info || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Opened at:</strong> <span>${openedDate || '---'}</span></p></div>
                      <div class="col-md-3"><p class="mb-1"><strong>Last Update:</strong> <span>${lastUpdate}</span></p></div>
                    </div>
                  </div>
                </div>`;

            
        },

        generateActionsHTML: function(order) {
            const status = order.status;
            let mainActionsHTML = '';
            let dropdownActionsHTML = '';

            for (const actionKey in this.config.actionConfig) {
                const action = this.config.actionConfig[actionKey];

                if (action.visibleOnStatus.includes(status)) {
                    if (action.type === 'button' || action.type === 'link') {
                        const tag = action.type === 'link' ? 'a' : 'button';
                        const href = action.type === 'link' ? `href="https://wemalo.example.com/order/${order.external_order_id}" target="_blank"` : '';
                        mainActionsHTML += `
                            <${tag} ${href} type="button" class="btn ${action.className} waves-effect">
                                <i data-feather="${action.icon}" class="me-25"></i>
                                <span>${action.text}</span>
                            </${tag}>`;
                    } else if (action.type === 'dropdown') {
                        dropdownActionsHTML += `<a class="dropdown-item" href="#"><i data-feather="${action.icon}" class="me-25"></i>${action.text}</a>`;
                    }
                }
            }

            let finalHTML = mainActionsHTML;

            if (dropdownActionsHTML) {
                finalHTML += `
                    <div class="btn-group">
                        <button type="button" class="btn btn-flat-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i data-feather="layers" class="me-25"></i>
                            More Actions
                        </button>
                        <div class="dropdown-menu dropdown-menu-end">
                            ${dropdownActionsHTML}
                        </div>
                    </div>`;
            }

            return finalHTML;
        },



        renderItemsList: function(items) {
            const container = document.getElementById('itemsListContainer');
            const emptyState = document.getElementById('itemsEmptyState');
            const pagination = document.querySelector('#itemsPaginationNav ul.pagination');
            const countEl = document.getElementById('itemsCount');
            const totalEl = document.getElementById('itemsTotalPrice');

            if (!container || !emptyState || !countEl || !totalEl) return;

            container.innerHTML = '';
            if (pagination) pagination.innerHTML = '';

            if (!items || items.length === 0) {
                emptyState.style.display = '';
                countEl.textContent = '0';
                totalEl.textContent = '0.00';
                return;
            }

            emptyState.style.display = 'none';

            let totalQty = 0, totalSum = 0;
            items.forEach(it => {
                totalQty += it.quantity ?? 0;
                totalSum += (it.quantity ?? 0) * (it.unit_price ?? 0);
            });
            countEl.textContent = totalQty;
            totalEl.textContent = totalSum.toFixed(2);

            const totalPages = Math.ceil(items.length / this.config.ITEMS_PER_PAGE);
            
            const drawPage = (page) => {
                const start = (page - 1) * this.config.ITEMS_PER_PAGE;
                const pageItems = items.slice(start, start + this.config.ITEMS_PER_PAGE);

                container.innerHTML = pageItems.map(it => {
                    const nameField = it.item_name || it.name || '—';
                    const skuField = it.sku || '';
                    const serialField = it.serial_number || it.serial || '—';
                    const qty = it.quantity ?? 0;
                    const price = typeof it.unit_price === 'number' ? it.unit_price.toFixed(2) : '0.00';
                    return `
                        <div class="d-flex align-items-center justify-content-between mt-25 border-bottom pb-50">
                          <div>
                            <p class="mb-0">${nameField} ${skuField ? `[${skuField}]` : ''}</p>
                            <span class="badge badge-light-secondary border-secondary">SN: ${serialField}</span>
                          </div>
                          <div class="text-end">
                            <span>${qty}</span><span class="ms-2">${price} €</span>
                          </div>
                        </div>`;
                }).join('');
                
                if (!pagination) return;
                pagination.innerHTML = '';
                // Rebuild pagination controls

                // ‹ Previous
                const prevLi = document.createElement('li');
                prevLi.className = 'page-item' + (page === 1 ? ' disabled' : '');
                prevLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&lsaquo;</span>
                </a>`;
                prevLi.addEventListener('click', e => {
                e.preventDefault();
                drawPage(page - 1);
                });
                pagination.appendChild(prevLi);

                // page numbers
                for (let p = 1; p <= totalPages; p++) {
                const li = document.createElement('li');
                li.className = 'page-item' + (p === page ? ' active' : '');
                li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
                li.addEventListener('click', e => {
                    e.preventDefault();
                    drawPage(p);
                });
                pagination.appendChild(li);
                }

                // Next ›
                const nextLi = document.createElement('li');
                nextLi.className = 'page-item' + (page === totalPages ? ' disabled' : '');
                nextLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&rsaquo;</span>
                </a>`;
                nextLi.addEventListener('click', e => {
                e.preventDefault();
                drawPage(page + 1);
                });
                pagination.appendChild(nextLi);
            };
            drawPage(1);
        },
        
        renderParcels: function(parcels) {
            const summaryBadge = document.getElementById('parcelsSummaryBadge');
            const container = document.getElementById('parcelsListContainer');
            const emptyState = document.getElementById('parcelsEmptyState');
            const pagination = document.querySelector('#parcelsPaginationNav .pagination');

            if (!summaryBadge || !container || !emptyState || !pagination) return;

            container.innerHTML = '';
            pagination.innerHTML = '';

            if (!Array.isArray(parcels) || parcels.length === 0) {
                emptyState.style.display = '';
                summaryBadge.textContent = '0 Parcels / 0 Items';
                return;
            }
            emptyState.style.display = 'none';

            const totalParcels = parcels.length;
            const totalItems = parcels.reduce((sum, p) => sum + (p.product_qty ?? 0), 0);
            summaryBadge.textContent = `${totalParcels} Parcel${totalParcels !== 1 ? 's' : ''} / ${totalItems} Item${totalItems !== 1 ? 's' : ''}`;

            const totalPages = Math.ceil(parcels.length / this.config.PARCELS_PER_PAGE);
            
            const drawPage = (page) => {
                const start = (page - 1) * this.config.PARCELS_PER_PAGE;
                const pageParcels = parcels.slice(start, start + this.config.PARCELS_PER_PAGE);

                container.innerHTML = pageParcels.map(p => {
                    const id = p.parcel_id ?? '—';
                    const qty = p.product_qty ?? 0;
                    const tn = p.tracking_number ?? '-';
                    const weight = (typeof p.weight === 'number') ? p.weight.toFixed(2) + ' Kg' : '— Kg';
                    return `
                        <div class="mt-25 border-bottom pb-50">
                          <div><p class="mb-0">Parcel ${id} / ${qty} Item(s)</p></div>
                          <div>
                            <span class="badge badge-light-secondary border-secondary">${weight}</span>
                            <span class="badge badge-light-secondary border-secondary">Tracking # ${tn}</span>
                          </div>
                        </div>`;
                }).join('');
                if (!pagination) return;
                pagination.innerHTML = '';
                // Rebuild pagination controls

                // ‹ Previous
                const prevLi = document.createElement('li');
                prevLi.className = 'page-item' + (page === 1 ? ' disabled' : '');
                prevLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&lsaquo;</span>
                </a>`;
                prevLi.addEventListener('click', e => {
                e.preventDefault();
                drawPage(page - 1);
                });
                pagination.appendChild(prevLi);

                // page numbers
                for (let p = 1; p <= totalPages; p++) {
                const li = document.createElement('li');
                li.className = 'page-item' + (p === page ? ' active' : '');
                li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
                li.addEventListener('click', e => {
                    e.preventDefault();
                    drawPage(p);
                });
                pagination.appendChild(li);
                }

                // Next ›
                const nextLi = document.createElement('li');
                nextLi.className = 'page-item' + (page === totalPages ? ' disabled' : '');
                nextLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&rsaquo;</span>
                </a>`;
                nextLi.addEventListener('click', e => {
                e.preventDefault();
                drawPage(page + 1);
                });
                pagination.appendChild(nextLi);
                // Update the pagination controls
            };
            drawPage(1);
        },
        
        renderRecipient: function(recipientData) {
            const el = document.getElementById("recipientInfo");
            if (!recipientData || Object.keys(recipientData).length === 0) {
                el.innerHTML = `<div class="card-body"><p class="text-muted">Recipient data is not available.</p></div>`;
                return;
            }

            const data = {
                name: recipientData.name || '—', surname: recipientData.surname || '',
                street: recipientData.street || '—', house_number: recipientData.house_number || '',
                postal_code: recipientData.postal_code || '', city: recipientData.city || '—',
                country: recipientData.country || '—', email: recipientData.email || '—',
                phone: recipientData.phone || '—'
            };

            el.innerHTML = `
                <div class="card-header d-flex align-items-center justify-content-between border-bottom mb-50">
                    <h4 class="fw-bold mb-1">Recipient Info</h4>
                    <button class="btn btn-primary btn-icon round" id="editRecipientBtn">
                        <i data-feather="edit"></i>
                    </button>                                            
                </div>
                <div class="card-body">
                    <p>${data.name} ${data.surname}</p>
                    <p>${data.street} ${data.house_number}</p>
                    <p>${data.postal_code}, ${data.city}, ${data.country}</p>
                    <p><a href="mailto:${data.email}">${data.email}</a></p>
                    <p>Phone: ${data.phone}</p>
                </div>`;
        },

        renderTimeline: function(timeline, orderData) {
            const el = document.getElementById("timeline");
            if (!timeline || timeline.length === 0) {
                el.innerHTML = '<div class="card-body"><p class="text-muted">No timeline events available.</p></div>';
                return;
            }

            const timelineHTML = `
                <div class="card-header d-flex align-items-center justify-content-between border-bottom mb-50">
                    <h4 class="fw-bold mb-1">Timeline</h4>
                    <span class="badge badge-light-primary border-primary">${orderData.time_spent || 'N/A'}</span>
                </div>
                <div class="card-body">
                    <ul class="timeline">
                        ${timeline.map(event => {
                            const statusInfo = this.config.statusMap[event.status] || { title: 'Unknown', class: 'bg-secondary' };
                            const pointClass = statusInfo.class.replace('bg-', 'timeline-point-');
                            return `
                                <li class="timeline-item">
                                    <span class="timeline-point ${pointClass} timeline-point-indicator"></span>
                                    <div class="timeline-event">
                                        <h6>${statusInfo.title}</h6>
                                        <span class="timeline-event-time">${new Date(event.date).toLocaleString()}</span>
                                    </div>
                                </li>`;
                        }).join("")}
                    </ul>
                </div>`;
            el.innerHTML = timelineHTML;
        },

        renderShopify: function(shopifyData) {
            const el = document.getElementById("shopifyFulfillment");
            if (!shopifyData) { el.innerHTML = ''; return; }
            el.innerHTML = `
                <div class="card-header d-flex align-items-center justify-content-between border-bottom mb-50">
                  <h4 class="fw-bold mb-1">Shopify fulfillment</h4>
                  <button class="btn btn-primary btn-icon round" id="editShopifyBtn">
                      <i data-feather="edit"></i>
                  </button>                                            
                </div>                                            
                <div class="card-body">
                  <p>Tracking #: ${shopifyData.tracking_number || '—'}</p>
                  <p>Tracking Link: ${shopifyData.tracking_link || '—'}</p>
                  <p>Courier: ${shopifyData.courier || "Not defined"}</p>
                  <p>Notify Customer: ${shopifyData.notify ? "YES" : "NO"}</p>
                </div>`;
        },
        
        renderDocuments: function(documents) {
            const el = document.getElementById("documents");
            
            const documentsListHTML = !documents || documents.length === 0 
                ? '<p class="text-muted text-center m-0">No documents available.</p>' 
                : `<ul class="list-group list-group-flush">
                     ${documents.map(doc => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <i data-feather="file-text" class="me-1"></i>
                                ${doc.name}
                            </span>
                            <button class="btn btn-sm btn-icon btn-outline-danger btn-delete-document" data-doc-name="${doc.name}">
                                <i data-feather="trash-2"></i>
                            </button>
                        </li>
                     `).join("")}
                   </ul>`;

            el.innerHTML = `
                <div class="card-header d-flex align-items-center justify-content-between border-bottom mb-50">
                  <h4 class="fw-bold mb-1">Documents</h4>
                  <button class="btn btn-primary btn-icon round"><i data-feather="upload"></i></button>
                </div>  
                <div class="card-body">
                  ${documentsListHTML}
                </div>`;
            
            feather.replace();
        },
        
        renderKnownIssues: function(orderData) {
            const el = document.getElementById('knownIssuesCardContainer');
            const issues = orderData.known_issues;
            if (!issues || issues.length === 0) { el.innerHTML = ''; return; }
            const statusStyles = { 'in process': 'bg-light-warning border-warning', 'Resolved': 'bg-light-success border-success', 'default': 'bg-light-secondary border-secondary' };
            el.innerHTML = `
                <div class="card">
                    <div class="card-header"><h4 class="card-title">Known Issues</h4></div>
                    <div class="card-body">
                        <ul class="list-group border-start-0">
                            ${issues.map(issue => {
                                const badgeClass = statusStyles[issue.status] || statusStyles.default;
                                const formattedDate = new Date(issue.date).toLocaleDateString();
                                return `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span>${issue.title}</span>
                                        <div>
                                            <span class="badge rounded-pill ${badgeClass}">${issue.status}</span>
                                            <small class="ms-1 text-muted">${formattedDate}</small>
                                        </div>
                                    </li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>`;
        },

        //================================================================================
        // 6. SHOPIFY MODAL LOGIC
        //================================================================================

        initShopifyModal: function() {
            const modalElement = document.getElementById('shopifyFulfillmentModal');
            if (modalElement) {
                this.shopifyModal = new bootstrap.Modal(modalElement);
            }

            $(document).on('click', '#editShopifyBtn', () => {
                if (this.currentOrderData && this.currentOrderData.shopify) {
                    this.populateAndShowShopifyModal(this.currentOrderData.shopify);
                }
            });

            $(document).on('click', '#submitFulfillmentButton', () => {
                this.handleFulfillmentSubmit();
            });
        },

        populateAndShowShopifyModal: function(shopifyData) {
            if (!this.shopifyModal) return;

            $('#fulfillmentOrderId').val(shopifyData.fulfillment_order_id || '');
            $('#trackingNumber').val(shopifyData.tracking_number || '');
            $('#trackingLink').val(shopifyData.tracking_link || '');
            $('#carrier').val(shopifyData.courier || '');
            $('#notifyCustomerSwitch').prop('checked', shopifyData.notify || false);
            
            this.shopifyModal.show();
        },

        handleFulfillmentSubmit: function() {
            const updatedData = {
                fulfillment_order_id: $('#fulfillmentOrderId').val(),
                tracking_number: $('#trackingNumber').val(),
                tracking_link: $('#trackingLink').val(),
                courier: $('#carrier').val(),
                notify: $('#notifyCustomerSwitch').is(':checked')
            };

            console.log("Submitting Fulfillment Data:", updatedData);
            alert("Fulfillment data submitted! Check the console for the data object.");

            this.currentOrderData.shopify = updatedData;
            this.renderShopify(updatedData);
            feather.replace();

            this.shopifyModal.hide();
        },

        //================================================================================
        // 7.  EDIT RECIPIENT DATA MODEL LOGIC
        //================================================================================

        initRecipientActions: function() {
            const self = this;
            const editModalEl = document.getElementById('editRecipientModal');
            const notAllowedModalEl = document.getElementById('editNotAllowedModal');

            if (editModalEl) this.editRecipientModal = new bootstrap.Modal(editModalEl);
            if (notAllowedModalEl) this.editNotAllowedModal = new bootstrap.Modal(notAllowedModalEl);

            this.elements.recipientCard.off('click', '#editRecipientBtn').on('click', '#editRecipientBtn', function() {
                const status = self.currentOrderData.status;

                if (status >= 1 && status <= 9) {
                    self.populateAndShowRecipientModal(self.currentOrderData.customer_recipient || {});
                } else {
                    if (self.editNotAllowedModal) self.editNotAllowedModal.show();
                }
            });

            $(document).off('click', '#saveRecipientButton').on('click', '#saveRecipientButton', function() {
                self.handleRecipientSubmit();
            });
        },

        populateAndShowRecipientModal: function(recipientData) {
            if (!this.editRecipientModal) return;

            $('#recipientName1').val(recipientData.name || '');
            $('#recipientName2').val(recipientData.surname || '');
            $('#recipientStreet').val(recipientData.street || '');
            $('#recipientHouseNumber').val(recipientData.house_number || '');
            $('#recipientPostalCode').val(recipientData.postal_code || '');
            $('#recipientCity').val(recipientData.city || '');
            $('#recipientCountry').val(recipientData.country || '');
            $('#recipientEmail').val(recipientData.email || '');
            $('#recipientPhone').val(recipientData.phone || '');
            
            this.editRecipientModal.show();
        },

        handleRecipientSubmit: function() {
            const updatedRecipient = {
                name: $('#recipientName1').val(),
                surname: $('#recipientName2').val(),
                street: $('#recipientStreet').val(),
                house_number: $('#recipientHouseNumber').val(),
                postal_code: $('#recipientPostalCode').val(),
                city: $('#recipientCity').val(),
                country: $('#recipientCountry').val(),
                email: $('#recipientEmail').val(),
                phone: $('#recipientPhone').val()
            };

            console.log("Saving Recipient Data:", updatedRecipient);
            alert("Recipient data saved! Check the console for the data object.");

            this.currentOrderData.customer_recipient = updatedRecipient;
            this.renderRecipient(updatedRecipient);
            feather.replace();

            this.editRecipientModal.hide();
        },

        //================================================================================
        // 8. LOGIC OF THE EDIT ITEMS MODE
        //================================================================================
        initEditItemsModal: function() {
            const self = this;
            const modalElement = document.getElementById('editItemsModal');
            const notAllowedModalElement = document.getElementById('editItemsNotAllowedModal');

            if (modalElement) {
                this.editItemsModal = new bootstrap.Modal(modalElement);
            }
            if (notAllowedModalElement) {
                this.editItemsNotAllowedModal = new bootstrap.Modal(notAllowedModalElement);
            }

            // Event for the main button to edit items
            $(document).off('click', '#editItemsButton').on('click', '#editItemsButton', () => {
                if (!self.currentOrderData) return;

                const status = self.currentOrderData.status;

                // conditional check for status 1 -9 
                if (status >= 1 && status <= 9) {
                    if (self.editItemsModal) {
                        self.populateAndShowEditItemsModal(self.currentOrderData.items);
                    } else {
                        console.error("Edit items modal is not initialized.");
                    }
                } else {
                    if (self.editItemsNotAllowedModal) {
                        self.editItemsNotAllowedModal.show();
                    } else {
                        console.error("'Not Allowed' modal is not initialized.");
                    }
                }
            });

            // Event delegation for the modal actions
            const modal = $('#editItemsModal');
            modal.on('input', '#productSearchInput', (e) => self.handleProductSearch(e));
            modal.on('click', '.suggestion-item', (e) => self.handleSuggestionClick(e));
            modal.on('click', '#addNewItemBtn', () => self.handleAddNewItem());
            modal.on('click', '.btn-delete-item-row', (e) => self.handleDeleteItemRow(e));
            modal.on('input', '.item-quantity, .item-unit-price, #additionalFeeInput', () => self.updateTotals());
            modal.on('click', '#saveItemsButton', () => self.handleSaveChanges());
        },

        populateAndShowEditItemsModal: function(items) {
            const tbody = $('#editableItemsTbody');
            tbody.empty();

            items.forEach(item => {
                const rowHTML = this.createItemRowHTML(item);
                tbody.append(rowHTML);
            });

            this.updateTotals();
            this.editItemsModal.show();
            feather.replace();
        },

        createItemRowHTML: function(item) {
            const name = item.item_name || item.name || 'Unknown Product';
            const sku = item.sku || 'N/A';
            const quantity = item.quantity || 1;
            const unitPrice = (item.unit_price || 0).toFixed(2);
            const positionPrice = (quantity * unitPrice).toFixed(2);
            const serial = item.serial_number || '';

            return `
                <tr data-sku="${sku}">
                    <td>${name} [${sku}]</td>
                    <td><input type="number" class="form-control item-quantity" value="${quantity}"></td>
                    <td><div class="input-group"><input type="number" class="form-control item-unit-price" value="${unitPrice}"><span class="input-group-text">€</span></div></td>
                    <td><div class="input-group"><input type="text" class="form-control item-position-price" value="${positionPrice}" readonly><span class="input-group-text">€</span></div></td>
                    <td><input type="text" class="form-control item-serial" value="${serial}"></td>
                    <td><button class="btn btn-sm btn-icon btn-outline-danger btn-delete-item-row"><i data-feather="trash-2"></i></button></td>
                </tr>`;
        },

        updateTotals: function() {
            let totalPositions = 0;
            $('#editableItemsTbody tr').each(function() {
                const row = $(this);
                const quantity = parseFloat(row.find('.item-quantity').val()) || 0;
                const unitPrice = parseFloat(row.find('.item-unit-price').val()) || 0;
                const positionPrice = quantity * unitPrice;
                row.find('.item-position-price').val(positionPrice.toFixed(2));
                totalPositions += positionPrice;
            });

            const additionalFee = parseFloat($('#additionalFeeInput').val()) || 0;
            const totalInvoice = totalPositions + additionalFee;

            $('#totalPositionsPrice').text(totalPositions.toFixed(2) + ' €');
            $('#totalInvoicePrice').text(totalInvoice.toFixed(2) + ' €');
        },

        handleSaveChanges: function() {
            const newItems = [];
            $('#editableItemsTbody tr').each(function() {
                const row = $(this);
                const nameAndSku = row.find('td:first').text().trim();
                const match = nameAndSku.match(/(.*) \[(.*)\]/);
                
                newItems.push({
                    item_name: match ? match[1] : nameAndSku,
                    sku: match ? match[2] : 'N/A',
                    quantity: parseInt(row.find('.item-quantity').val()) || 0,
                    unit_price: parseFloat(row.find('.item-unit-price').val()) || 0,
                    serial_number: row.find('.item-serial').val()
                });
            });

            this.currentOrderData.items = newItems;
            this.renderItemsList(newItems);
            this.editItemsModal.hide();
            console.log("Saved items:", newItems);
        },

        buildMockProductDatabase: function(allOrders) {
           const allItems = allOrders.flatMap(order => order.items || []);
            const uniqueItems = new Map();
            
            allItems.forEach(item => {
                // The JSON structure confirms that the property is ‘item_name’.
                const itemName = item.item_name;
                
                //We use the item name as a unique identifier.
                if (itemName && !uniqueItems.has(itemName)) {
                    uniqueItems.set(itemName, {
                        name: itemName,
                        sku: item.sku || 'N/A', // save SKU if exists, otherwise 'N/A'
                        price: item.unit_price || 0
                    });
                }
            });
            
            this.mockProductDatabase = [...uniqueItems.values()];
            
            console.log(`✅ Mock Product Database created with ${this.mockProductDatabase.length} unique items.`);
        },

        handleProductSearch: function(event) {
            const query = $(event.target).val().toLowerCase();
            const suggestionsContainer = $('#productSuggestions');
            suggestionsContainer.empty();

            if (query.length < 3) {
                return;
            }

            const filteredProducts = this.mockProductDatabase.filter(p => 
                (p.name && p.name.toLowerCase().includes(query)) || 
                (p.sku && p.sku.toLowerCase().includes(query))
            ).slice(0, 5);

            console.log(`Searching for "${query}", found ${filteredProducts.length} results.`);

            filteredProducts.forEach(p => {
                suggestionsContainer.append(
                    `<a href="#" class="list-group-item list-group-item-action suggestion-item" 
                        data-name="${p.name}" data-sku="${p.sku}" data-price="${p.price}">
                        ${p.name} [${p.sku}]
                    </a>`
                );
            });
        },

        handleSuggestionClick: function(event) {
            event.preventDefault();
            const target = $(event.currentTarget);
            $('#productSearchInput').val(`${target.data('name')} [${target.data('sku')}]`);
            $('#productPriceInput').val(target.data('price').toFixed(2));
            $('#productSuggestions').empty();
        },

        handleAddNewItem: function() {
            const searchVal = $('#productSearchInput').val();
            const match = searchVal.match(/(.*) \[(.*)\]/);

            if (!match) {
                alert("Please select a valid product from the suggestions.");
                return;
            }

            const newItem = {
                item_name: match[1],
                sku: match[2],
                quantity: parseInt($('#productQuantityInput').val()) || 1,
                unit_price: parseFloat($('#productPriceInput').val()) || 0
            };

            const newRowHTML = this.createItemRowHTML(newItem);
            $('#editableItemsTbody').append(newRowHTML);
            this.updateTotals();
            feather.replace();

            $('#productSearchInput').val('');
            $('#productPriceInput').val('');
            $('#productQuantityInput').val(1);
        },

        handleDeleteItemRow: function(event) {
            $(event.currentTarget).closest('tr').remove();
            this.updateTotals();
        },

        //================================================================================
        // 9. Deleted Documents
        //================================================================================

        // Management of document deleting
        initDocumentActions: function() {
            const self = this;
            this.elements.documentsCard.off('click', '.btn-delete-document').on('click', '.btn-delete-document', function() {
                const docName = $(this).data('doc-name');
                if (docName && self.deleteConfirmModal) {
                    self.docNameToDelete = docName;
                    $('#docNameToDelete').text(docName);
                    self.deleteConfirmModal.show();
                }
            });
        },

        initDeleteDocConfirmationModal: function() {
            const self = this;
            const modalElement = document.getElementById('deleteDocConfirmModal');
            if (modalElement) {
                this.deleteConfirmModal = new bootstrap.Modal(modalElement);

                $(document).off('click', '#confirmDeleteButton').on('click', '#confirmDeleteButton', function() {
                    if (self.docNameToDelete) {
                        self.handleDeleteDocument(self.docNameToDelete);
                        self.docNameToDelete = null;
                        self.deleteConfirmModal.hide();
                    }
                });
            } else {
                console.warn('Warning: The HTML for the delete confirmation modal (#deleteConfirmModal) was not found.');
            }
        },

        handleDeleteDocument: function(docNameToDelete) {
            if (!this.currentOrderData || !this.currentOrderData.documents) return;

            this.currentOrderData.documents = this.currentOrderData.documents.filter(
                doc => doc.name !== docNameToDelete
            );

            console.log(`Document "${docNameToDelete}" deleted.`);
            
            this.renderDocuments(this.currentOrderData.documents);
        },

        //================================================================================
        // 8. HELP FUNCTIONS
        //================================================================================

        formatDate: function(dateString) {
            if (!dateString) return '---';
            const date = new Date(dateString);
            if (isNaN(date)) return '---';
            return date.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        },

        adjustInternalLayoutForParcels: function(hasParcels) {
            const itemsCol = document.getElementById('itemsCol');
            const parcelsCol = document.getElementById('parcelsCol');
            if (itemsCol && parcelsCol) {
                itemsCol.className = hasParcels ? 'col-lg-8 col-md-8 col-sm-12' : 'col-lg-12 col-md-12 col-sm-12';
                parcelsCol.classList.toggle('d-none', !hasParcels);
            }
        }
    };

    $(document).on('click', '.js-go-order', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const id = $(this).data('order');
        const basePath = window.location.pathname.replace(/[^/]+$/, '');
        const target = `${basePath}orderDetailClient.html?order_number=${id}#order_number=${id}`;
        window.location.assign(target);
        });


    //================================================================================
    //  Entry point
    //================================================================================
    orderDetailsPage.init();
});
