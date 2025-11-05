// product-detail-edit-adapter.js - Versión simplificada
'use strict';

console.log('🔄 product-detail-edit-adapter.js cargado');

function initializeProductDetailEdit() {
    console.log('🎯 Inicializando edit para product detail...');
    
    const editButton = document.getElementById('edit-product-detail-btn');
    console.log('🔍 Botón encontrado:', editButton);
    
    if (editButton) {
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Botón Edit clickeado');
            openEditModalForCurrentProduct();
        });
        
        // Agregar estilo para confirmar que el evento está configurado
        editButton.style.border = '2px solid green';
    } else {
        console.error('❌ NO se encontró el botón con id: edit-product-detail-btn');
    }
}

function openEditModalForCurrentProduct() {
    console.log('📦 Abriendo modal para producto actual...');
    
    try {
        const productData = getCurrentProductData();
        console.log('📊 Datos del producto:', productData);
        
        if (productData) {
            // Llenar el formulario directamente
            populateEditForm(productData);
            
            // Mostrar el modal usando Bootstrap
            const modalElement = document.getElementById('productEditModal');
            console.log('🔍 Modal element encontrado:', modalElement);
            
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('✅ Modal mostrado exitosamente');
            } else {
                console.error('❌ NO se encontró el modal con id: productEditModal');
            }
        }
    } catch (error) {
        console.error('❌ Error abriendo modal:', error);
        alert('Error opening edit modal: ' + error.message);
    }
}

function getCurrentProductData() {
    console.log('📡 Obteniendo datos del producto...');
    
    const productId = getProductIdFromURL();
    console.log('🆔 Product ID from URL:', productId);
    
    // Obtener datos de los elementos de la página
    const productName = document.getElementById('product-name')?.textContent || '';
    const productSku = document.getElementById('product-sku')?.textContent || '';
    
    console.log('📝 Datos encontrados - Name:', productName, 'SKU:', productSku);
    
    return {
        id: productId,
        name: productName,
        sku: productSku,
        ean: document.getElementById('spec-ean')?.textContent || '',
        product_group: 'Default',
        quantity: parseInt(document.getElementById('qty-total')?.textContent) || 0,
        reservableQuantity: parseInt(document.getElementById('qty-available')?.textContent) || 0,
        announcedQuantity: parseInt(document.getElementById('qty-reserved')?.textContent) || 0,
        virtualQuantity: parseInt(document.getElementById('qty-virtual')?.textContent) || 0,
        weight: document.getElementById('spec-weight')?.textContent || '',
        unitVolume: document.getElementById('spec-volume')?.textContent || '',
        barcode: document.getElementById('spec-barcode')?.textContent || '',
        customer: document.getElementById('product-customer')?.textContent || '',
        status: 'Active' // Valor por defecto
    };
}

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function populateEditForm(data) {
    console.log('📝 Llenando formulario con datos:', data);
    
    // Llenar cada campo del formulario
    document.getElementById('edit-product-id').value = data.id || '';
    document.getElementById('edit-product-name').value = data.name || '';
    document.getElementById('edit-product-sku').value = data.sku || '';
    document.getElementById('edit-product-ean').value = data.ean || '';
    document.getElementById('edit-product-group').value = data.product_group || 'Default';
    document.getElementById('edit-qty-total').value = data.quantity || 0;
    document.getElementById('edit-qty-available').value = data.reservableQuantity || 0;
    document.getElementById('edit-qty-reserved').value = data.announcedQuantity || 0;
    document.getElementById('edit-qty-virtual').value = data.virtualQuantity || 0;
    document.getElementById('edit-product-weight').value = data.weight || '';
    document.getElementById('edit-product-volume').value = data.unitVolume || '';
    document.getElementById('edit-product-barcode').value = data.barcode || '';
    
    console.log('✅ Formulario llenado exitosamente');
}

// Configurar el event listener del formulario
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Configurando edit adapter...');
    
    // Inicializar después de un pequeño delay para asegurar que todo esté cargado
    setTimeout(() => {
        initializeProductDetailEdit();
        
        // Configurar el submit del formulario
        const editForm = document.getElementById('product-edit-form');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('💾 Formulario enviado');
                saveProductChanges();
            });
        }
    }, 100);
});

function saveProductChanges() {
    console.log('💾 Guardando cambios...');
    
    const updatedData = {
        id: document.getElementById('edit-product-id').value,
        name: document.getElementById('edit-product-name').value,
        sku: document.getElementById('edit-product-sku').value,
        ean: document.getElementById('edit-product-ean').value,
        product_group: document.getElementById('edit-product-group').value,
        quantity: document.getElementById('edit-qty-total').value,
        reservableQuantity: document.getElementById('edit-qty-available').value,
        announcedQuantity: document.getElementById('edit-qty-reserved').value,
        virtualQuantity: document.getElementById('edit-qty-virtual').value,
        weight: document.getElementById('edit-product-weight').value,
        unitVolume: document.getElementById('edit-product-volume').value,
        barcode: document.getElementById('edit-product-barcode').value
    };
    
    console.log('📤 Datos a guardar:', updatedData);
    
    // TODO: Aquí iría la llamada a la API
    alert('Product updated successfully! (Simulación)');
    
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('productEditModal'));
    if (modal) {
        modal.hide();
    }
    
    // Recargar después de guardar
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}