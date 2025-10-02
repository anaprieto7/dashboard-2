const inventoryApiService = (() => {
    const aggregateDataByClient = (productData) => {
        const clientSummary = {};

        productData.forEach(product => {
            if (!clientSummary[product.customer]) {
                clientSummary[product.customer] = {
                    clientName: product.customer,
                    totalSku: 0,
                    totalUnits: 0,         // NUEVO
                    availableUnits: 0,
                    reservedUnits: 0,
                    virtualQty: 0,           // NUEVO
                    approxVolume: 0,
                    status: 'Inactive',      // Se calcula al final
                    hasActiveProduct: false, // Ayudante para calcular el estado
                    clientId: product.id 
                };
            }

            const summary = clientSummary[product.customer];
            summary.totalSku += 1;
            summary.totalUnits += product.total_units;
            summary.availableUnits += product.available_qty;
            summary.reservedUnits += product.reserved_units;
            summary.virtualQty += product.virtual_qty;
            summary.approxVolume += product.volume_m3;
            
            if (product.status === 'Active') {
                summary.hasActiveProduct = true;
            }
        });

        // Lógica final para determinar el estado del cliente
        for (const clientName in clientSummary) {
            if (clientSummary[clientName].hasActiveProduct) {
                clientSummary[clientName].status = 'Active';
            }
        }

        return Object.values(clientSummary);
    };

    const fetchAllInventory = () => {
        const aggregatedData = aggregateDataByClient(inventoryMockData);
        return new Promise(resolve => setTimeout(() => resolve(aggregatedData), 200));
    };

    return { fetchAllInventory };
})();