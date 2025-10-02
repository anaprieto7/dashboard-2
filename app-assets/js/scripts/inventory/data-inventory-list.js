// Este archivo contiene los datos de ejemplo para la tabla de inventario.
// Cada cliente ahora tiene exactamente 20 SKUs diferentes.
const inventoryMockData = [
  // =======================================================
  // Cliente: 4e Gruppe Anlage (20 SKUs)
  // =======================================================
  { id: 1, customer: '4e Gruppe Anlage', name: 'Apple iPhone 14 Pro', sku: 'APP-IP14P-256', total_units: 150, available_qty: 120, reserved_units: 5, virtual_qty: 5, volume_m3: 0.02, status: 'Active' },
  { id: 2, customer: '4e Gruppe Anlage', name: 'Dell UltraSharp U2723QE Monitor', sku: 'DEL-U2723-4K', total_units: 50, available_qty: 45, reserved_units: 0, virtual_qty: 5, volume_m3: 0.05, status: 'Active' },
  { id: 3, customer: '4e Gruppe Anlage', name: 'Classic T-Shirt - Black', sku: 'TSH-CL-BLK-L', total_units: 500, available_qty: 450, reserved_units: 15, virtual_qty: 5, volume_m3: 0.08, status: 'Active' },
  { id: 4, customer: '4e Gruppe Anlage', name: 'Classic T-Shirt - White', sku: 'TSH-CL-WHT-M', total_units: 450, available_qty: 440, reserved_units: 0, virtual_qty: 5, volume_m3: 0.08, status: 'Active' },
  { id: 5, customer: '4e Gruppe Anlage', name: 'LEGO Star Wars Millennium Falcon', sku: 'LGO-SW-MF75192', total_units: 10, available_qty: 2, reserved_units: 1, virtual_qty: 5, volume_m3: 0.08, status: 'Inactive' },
  { id: 6, customer: '4e Gruppe Anlage', name: 'Water Bottle Stainless Steel', sku: 'WTR-STL-1L', total_units: 1000, available_qty: 850, reserved_units: 50, virtual_qty: 5, volume_m3: 0.002, status: 'Active' },
  { id: 7, customer: '4e Gruppe Anlage', name: 'Yoga Mat Premium', sku: 'YGA-MAT-PRM-BLK', total_units: 200, available_qty: 180, reserved_units: 10, virtual_qty: 5, volume_m3: 0.015, status: 'Active' },
  { id: 8, customer: '4e Gruppe Anlage', name: 'Wireless Charging Pad', sku: 'CHG-WRL-15W', total_units: 350, available_qty: 300, reserved_units: 25, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 9, customer: '4e Gruppe Anlage', name: 'Ergonomic Office Chair', sku: 'CHR-ERG-OFF-GRY', total_units: 40, available_qty: 38, reserved_units: 2, virtual_qty: 5, volume_m3: 0.5, status: 'Active' },
  { id: 10, customer: '4e Gruppe Anlage', name: 'Mechanical Keyboard RGB', sku: 'KBD-MECH-RGB-104', total_units: 120, available_qty: 115, reserved_units: 0, virtual_qty: 5, volume_m3: 0.02, status: 'Active' },
  { id: 11, customer: '4e Gruppe Anlage', name: 'Running Shoes - Size 42', sku: 'SHOE-RUN-MEN-42', total_units: 90, available_qty: 20, reserved_units: 5, virtual_qty: 5, volume_m3: 0.01, status: 'Inactive' },
  { id: 12, customer: '4e Gruppe Anlage', name: 'Bluetooth Speaker Portable', sku: 'SPK-BT-PORT-RED', total_units: 250, available_qty: 240, reserved_units: 10, virtual_qty: 5, volume_m3: 0.008, status: 'Active' },
  { id: 13, customer: '4e Gruppe Anlage', name: 'Hard Drive SSD 2TB', sku: 'HDD-SSD-2TB-EXT', total_units: 85, available_qty: 80, reserved_units: 1, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 14, customer: '4e Gruppe Anlage', name: 'Acoustic Guitar', sku: 'GTR-ACU-DREAD', total_units: 15, available_qty: 12, reserved_units: 0, virtual_qty: 5, volume_m3: 0.1, status: 'Active' },
  { id: 15, customer: '4e Gruppe Anlage', name: 'Espresso Machine', sku: 'COF-ESP-AUTO-SLV', total_units: 30, available_qty: 25, reserved_units: 3, virtual_qty: 5, volume_m3: 0.04, status: 'Active' },
  { id: 16, customer: '4e Gruppe Anlage', name: 'Smart Watch SE', sku: 'WTCH-SMT-SE-44', total_units: 180, available_qty: 150, reserved_units: 20, virtual_qty: 5, volume_m3: 0.0005, status: 'Active' },
  { id: 17, customer: '4e Gruppe Anlage', name: 'Leather Wallet', sku: 'WLT-LTHR-BRN', total_units: 500, available_qty: 480, reserved_units: 0, virtual_qty: 5, volume_m3: 0.0002, status: 'Active' },
  { id: 18, customer: '4e Gruppe Anlage', name: 'Desk Lamp LED', sku: 'LMP-DSK-LED-WHT', total_units: 140, available_qty: 135, reserved_units: 5, virtual_qty: 5, volume_m3: 0.005, status: 'Active' },
  { id: 19, customer: '4e Gruppe Anlage', name: 'Backpack 25L', sku: 'BPK-DAY-25L-BLK', total_units: 300, available_qty: 290, reserved_units: 10, virtual_qty: 5, volume_m3: 0.025, status: 'Active' },
  { id: 20, customer: '4e Gruppe Anlage', name: 'Electric Toothbrush', sku: 'BRSH-ELEC-PRO2', total_units: 220, available_qty: 200, reserved_units: 15, virtual_qty: 5, volume_m3: 0.002, status: 'Active' },

  // =======================================================
  // Cliente: Shopping Inc (20 SKUs)
  // =======================================================
  { id: 21, customer: 'Shopping Inc', name: 'Samsung Galaxy S23 Ultra', sku: 'SAM-S23U-512', total_units: 200, available_qty: 180, reserved_units: 10, virtual_qty: 5, volume_m3: 0.03, status: 'Active' },
  { id: 22, customer: 'Shopping Inc', name: 'Sony WH-1000XM5 Headphones', sku: 'SON-WHXM5-BLK', total_units: 120, available_qty: 110, reserved_units: 5, virtual_qty: 5, volume_m3: 0.01, status: 'Active' },
  { id: 23, customer: 'Shopping Inc', name: 'Nintendo Switch OLED', sku: 'NIN-SWOLED-W', total_units: 75, available_qty: 0, reserved_units: 0, virtual_qty: 5, volume_m3: 0.02, status: 'Inactive' },
  { id: 24, customer: 'Shopping Inc', name: 'Kindle Paperwhite', sku: 'AMZ-KPW-16GB', total_units: 90, available_qty: 85, reserved_units: 2, virtual_qty: 5, volume_m3: 0.01, status: 'Active' },
  { id: 25, customer: 'Shopping Inc', name: 'GoPro HERO11 Black', sku: 'GPRO-H11-BLK', total_units: 60, available_qty: 55, reserved_units: 5, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 26, customer: 'Shopping Inc', name: 'Amazon Echo Dot 5th Gen', sku: 'AMZ-ECHO5-CHAR', total_units: 400, available_qty: 350, reserved_units: 30, virtual_qty: 5, volume_m3: 0.002, status: 'Active' },
  { id: 27, customer: 'Shopping Inc', name: 'Philips Hue Starter Kit', sku: 'PHI-HUE-KIT-E27', total_units: 150, available_qty: 140, reserved_units: 0, virtual_qty: 5, volume_m3: 0.008, status: 'Active' },
  { id: 28, customer: 'Shopping Inc', name: 'Instant Pot Duo 7-in-1', sku: 'INST-DUO-6QT', total_units: 100, available_qty: 90, reserved_units: 8, virtual_qty: 5, volume_m3: 0.03, status: 'Active' },
  { id: 29, customer: 'Shopping Inc', name: 'Fitbit Charge 5', sku: 'FIT-CHG5-BLK', total_units: 300, available_qty: 280, reserved_units: 15, virtual_qty: 5, volume_m3: 0.0004, status: 'Active' },
  { id: 30, customer: 'Shopping Inc', name: 'DJI Mini 3 Pro Drone', sku: 'DJI-MINI3-PRO', total_units: 50, available_qty: 48, reserved_units: 2, virtual_qty: 5, volume_m3: 0.01, status: 'Active' },
  { id: 31, customer: 'Shopping Inc', name: 'Chromecast with Google TV', sku: 'GOOG-CTV-4K', total_units: 500, available_qty: 450, reserved_units: 25, virtual_qty: 5, volume_m3: 0.0005, status: 'Active' },
  { id: 32, customer: 'Shopping Inc', name: 'Apple AirTag 4 Pack', sku: 'APP-ATAG-4PK', total_units: 600, available_qty: 550, reserved_units: 40, virtual_qty: 5, volume_m3: 0.0001, status: 'Active' },
  { id: 33, customer: 'Shopping Inc', name: 'Anker Nebula Capsule Projector', sku: 'ANK-NEB-CAP', total_units: 70, available_qty: 65, reserved_units: 0, virtual_qty: 5, volume_m3: 0.003, status: 'Active' },
  { id: 34, customer: 'Shopping Inc', name: 'Board Game - Catan', sku: 'GAME-CATAN-BASE', total_units: 120, available_qty: 110, reserved_units: 10, virtual_qty: 5, volume_m3: 0.006, status: 'Active' },
  { id: 35, customer: 'Shopping Inc', name: 'Nespresso Vertuo Coffee Maker', sku: 'NES-VERT-CHR', total_units: 90, available_qty: 88, reserved_units: 1, virtual_qty: 5, volume_m3: 0.035, status: 'Active' },
  { id: 36, customer: 'Shopping Inc', name: 'Fleece Blanket Queen Size', sku: 'BLNK-FLC-Q-NAVY', total_units: 400, available_qty: 380, reserved_units: 20, virtual_qty: 5, volume_m3: 0.02, status: 'Active' },
  { id: 37, customer: 'Shopping Inc', name: 'Hydro Flask 32oz', sku: 'HYD-FLSK-32-BLK', total_units: 250, available_qty: 250, reserved_units: 0, virtual_qty: 5, volume_m3: 0.003, status: 'Active' },
  { id: 38, customer: 'Shopping Inc', name: 'Memory Foam Pillow', sku: 'PIL-MEM-FOAM-STD', total_units: 300, available_qty: 290, reserved_units: 5, virtual_qty: 5, volume_m3: 0.018, status: 'Active' },
  { id: 39, customer: 'Shopping Inc', name: 'Samsung T7 Shield SSD 1TB', sku: 'SAM-T7S-1TB-BLU', total_units: 150, available_qty: 145, reserved_units: 3, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 40, customer: 'Shopping Inc', name: 'Ray-Ban Aviator Sunglasses', sku: 'RAY-AVTR-GLD', total_units: 180, available_qty: 170, reserved_units: 10, virtual_qty: 5, volume_m3: 0.0003, status: 'Active' },

  // =======================================================
  // Cliente: Technology Corp (20 SKUs)
  // =======================================================
  { id: 41, customer: 'Technology Corp', name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-GR', total_units: 80, available_qty: 5, reserved_units: 0, virtual_qty: 5, volume_m3: 0.01, status: 'Inactive' },
  { id: 42, customer: 'Technology Corp', name: 'Anker PowerCore 24K', sku: 'ANK-PC24K-BLK', total_units: 300, available_qty: 250, reserved_units: 20, virtual_qty: 5, volume_m3: 0.01, status: 'Active' },
  { id: 43, customer: 'Technology Corp', name: 'Raspberry Pi 4 Model B', sku: 'RPI-4B-8GB', total_units: 110, available_qty: 30, reserved_units: 5, virtual_qty: 5, volume_m3: 0.005, status: 'Active' },
  { id: 44, customer: 'Technology Corp', name: 'Intel Core i9-13900K CPU', sku: 'INT-I9-13900K', total_units: 25, available_qty: 20, reserved_units: 2, virtual_qty: 5, volume_m3: 0.0001, status: 'Active' },
  { id: 45, customer: 'Technology Corp', name: 'NVIDIA GeForce RTX 4090 GPU', sku: 'NV-RTX-4090-FE', total_units: 15, available_qty: 10, reserved_units: 3, virtual_qty: 5, volume_m3: 0.012, status: 'Active' },
  { id: 46, customer: 'Technology Corp', name: 'Corsair Vengeance DDR5 32GB', sku: 'COR-VEN-DDR5-32', total_units: 200, available_qty: 180, reserved_units: 10, virtual_qty: 5, volume_m3: 0.0002, status: 'Active' },
  { id: 47, customer: 'Technology Corp', name: 'Samsung 980 Pro SSD 2TB', sku: 'SAM-980P-2TB-NVME', total_units: 90, available_qty: 85, reserved_units: 0, virtual_qty: 5, volume_m3: 0.0001, status: 'Active' },
  { id: 48, customer: 'Technology Corp', name: 'Noctua NH-D15 CPU Cooler', sku: 'NOC-NHD15-CHR', total_units: 100, available_qty: 95, reserved_units: 5, virtual_qty: 5, volume_m3: 0.005, status: 'Active' },
  { id: 49, customer: 'Technology Corp', name: 'CableMod Pro ModMesh Cable Kit', sku: 'CMOD-PRO-KIT-WHT', total_units: 150, available_qty: 140, reserved_units: 0, virtual_qty: 5, volume_m3: 0.003, status: 'Active' },
  { id: 50, customer: 'Technology Corp', name: 'Elgato Stream Deck MK.2', sku: 'ELG-SD-MK2', total_units: 80, available_qty: 70, reserved_units: 5, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 51, customer: 'Technology Corp', name: 'Shure SM7B Microphone', sku: 'SHR-SM7B-MIC', total_units: 50, available_qty: 45, reserved_units: 3, virtual_qty: 5, volume_m3: 0.008, status: 'Active' },
  { id: 52, customer: 'Technology Corp', name: 'Focusrite Scarlett 2i2 Audio Interface', sku: 'FOC-SCAR-2I2-3G', total_units: 120, available_qty: 110, reserved_units: 10, virtual_qty: 5, volume_m3: 0.002, status: 'Active' },
  { id: 53, customer: 'Technology Corp', name: '3D Printer Creality Ender 3', sku: 'CRE-END3-V2', total_units: 40, available_qty: 35, reserved_units: 1, virtual_qty: 5, volume_m3: 0.1, status: 'Active' },
  { id: 54, customer: 'Technology Corp', name: 'Arduino Uno R3', sku: 'ARD-UNO-R3', total_units: 1000, available_qty: 950, reserved_units: 50, virtual_qty: 5, volume_m3: 0.0001, status: 'Active' },
  { id: 55, customer: 'Technology Corp', name: 'Synology DS923+ NAS', sku: 'SYN-DS923-PLUS', total_units: 30, available_qty: 28, reserved_units: 2, virtual_qty: 5, volume_m3: 0.02, status: 'Active' },
  { id: 56, customer: 'Technology Corp', name: 'Ubiquiti UniFi Dream Machine', sku: 'UBI-UDM-PRO', total_units: 60, available_qty: 50, reserved_units: 5, virtual_qty: 5, volume_m3: 0.015, status: 'Active' },
  { id: 57, customer: 'Technology Corp', name: 'Logitech C920 Webcam', sku: 'LOG-C920-HD', total_units: 400, available_qty: 380, reserved_units: 0, virtual_qty: 5, volume_m3: 0.001, status: 'Active' },
  { id: 58, customer: 'Technology Corp', name: 'TP-Link Archer AXE75 Router', sku: 'TPL-ARCH-AXE75', total_units: 110, available_qty: 100, reserved_units: 10, virtual_qty: 5, volume_m3: 0.009, status: 'Active' },
  { id: 59, customer: 'Technology Corp', name: 'Seagate IronWolf 8TB NAS HDD', sku: 'SGT-IW-8TB-NAS', total_units: 200, available_qty: 190, reserved_units: 5, virtual_qty: 5, volume_m3: 0.002, status: 'Active' },
  { id: 60, customer: 'Technology Corp', name: 'APC UPS 1500VA', sku: 'APC-UPS-1500', total_units: 75, available_qty: 70, reserved_units: 3, virtual_qty: 5, virtual_qty: 10, volume_m3: 0.03, status: 'Active' },
];