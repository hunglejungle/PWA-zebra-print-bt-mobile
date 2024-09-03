let printerDevice;
let printerServer;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        console.log("Requesting Bluetooth Device...");
        printerDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,  // This will show all available Bluetooth devices
            optionalServices: []     // Empty array to allow discovering all services
        });

        printerServer = await printerDevice.gatt.connect();
        console.log("Connected to GATT Server");

        alert('Connected to Zebra Printer! Now discovering services...');
        setTimeout(() => discoverServicesAndCharacteristics(printerServer), 1000); // Adding a timeout before discovery
    } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
        alert(`Failed to connect to the printer. Error: ${error.message}`);
    }
});

async function discoverServicesAndCharacteristics(server) {
    try {
        const services = await server.getPrimaryServices();
        
        if (services.length === 0) {
            throw new Error("No services found");
        }

        for (const service of services) {
            console.log(`Service: ${service.uuid}`);
            
            const characteristics = await service.getCharacteristics();
            
            if (characteristics.length === 0) {
                throw new Error("No characteristics found for service " + service.uuid);
            }

            for (const characteristic of characteristics) {
                console.log(`Characteristic: ${characteristic.uuid}`);
                // Example: Check if it's writable
                if (characteristic.properties.write) {
                    console.log('Writable characteristic found:', characteristic.uuid);
                    // You can now prepare to use this characteristic for printing
                }
            }
        }

        alert('Services and characteristics discovered. Check console for details.');
    } catch (error) {
        console.error('Error discovering services and characteristics:', error);
        alert(`Failed to discover services and characteristics. ${error.message}`);
    }
}
