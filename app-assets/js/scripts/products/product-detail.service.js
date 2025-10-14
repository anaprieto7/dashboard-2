'use strict';

const ProductDetailService = (() => {
    /**
     * Carga el archivo de órdenes completo desde 'table-datatable.json'.
     * @returns {Promise<Array>} Una promesa que resuelve con la lista de todas las órdenes.
     */
    const getAllOrders = async () => {
        try {
            // Ajusta la ruta a tu archivo JSON si es necesario.
            const response = await fetch('../../../../app-assets/data/table-datatable.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Could not fetch orders JSON:", error);
            return []; // Devuelve un array vacío si hay un error.
        }
    };

    /**
     * Busca un producto por su ID en la variable global 'productData'.
     * @param {string|number} productId - El ID del producto a buscar.
     * @returns {Promise<object>} Una promesa que resuelve con los datos del producto.
     */
    const getProductById = async (productId) => {
        if (typeof productData === 'undefined') {
            return Promise.reject("Product data (from data-products-list.js) is not loaded.");
        }
        // Usamos '==' para permitir la comparación entre string y number (ej: '3' == 3)
        const product = productData.find(p => p.id == productId);
        if (product) {
            return Promise.resolve(product);
        } else {
            return Promise.reject(`Product with ID ${productId} not found in productData.`);
        }
    };

    return {
        getProductById,
        getAllOrders
    };
})();