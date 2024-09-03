let printerDevice;
let printerServer;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        console.log("Requesting Bluetooth Device...");
        updateStatus("Requesting Bluetooth Device...");

        printerDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,  // This will show all available Bluetooth devices
            optionalServices: []     // Empty array to allow discovering all services
        });

        updateStatus(`Selected Device: ${printerDevice.name}`);

        printerServer = await printerDevice.gatt.connect();
        console.log("Connected to GATT Server");
        updateStatus("Connected to GATT Server. Discovering services...");

        setTimeout(() => discoverServicesAndCharacteristics(printerServer), 1000); // Adding a timeout before discovery
    } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
        updateStatus(`Failed to connect to the printer. Error: ${error.message}`);
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
            updateStatus(`Discovered Service: ${service.uuid}`);
            
            const characteristics = await service.getCharacteristics();
            
            if (characteristics.length === 0) {
                throw new Error(`No characteristics found for service ${service.uuid}`);
            }

            for (const characteristic of characteristics) {
                console.log(`Characteristic: ${characteristic.uuid}`);
                updateStatus(`Discovered Characteristic: ${characteristic.uuid}`);
                // Example: Check if it's writable
                if (characteristic.properties.write) {
                    console.log('Writable characteristic found:', characteristic.uuid);
                    updateStatus('Writable characteristic found. Ready to print.');
                    // You can now prepare to use this characteristic for printing
                }
            }
        }

        alert('Services and characteristics discovered. Check console for details.');
    } catch (error) {
        console.error('Error discovering services and characteristics:', error);
        updateStatus(`Failed to discover services and characteristics. ${error.message}`);
    }
}

document.getElementById('print').addEventListener('click', async () => {
    if (!printerServer) {
        alert('Please connect to the printer first.');
        return;
    }

    try {
        const services = await printerServer.getPrimaryServices();
        
        // Iterate through services and characteristics to find the right one
        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const characteristic of characteristics) {
                if (characteristic.properties.write) {
                    // Generate ZPL command
                    const zpl = '^XA^FO50,50^A0N,50,50^FD123456789^FS^FO50,150^BY2^BCN,100,Y,N,N^FD123456789^FS^XZ';
                    const encoder = new TextEncoder();
                    const zplData = encoder.encode(zpl);

                    await characteristic.writeValue(zplData);
                    updateStatus('Label sent to printer!');
                    return;  // Exit after sending data
                }
            }
        }

        updateStatus('No writable characteristic found.');
    } catch (error) {
        console.error('Error printing label:', error);
        updateStatus('Failed to print label. Please check the console for details.');
    }
});

function updateStatus(message) {
    // Update a status element on the page
    const statusElement = document.getElementById('status');
    if (!statusElement) {
        const newStatusElement = document.createElement('div');
        newStatusElement.id = 'status';
        newStatusElement.style.marginTop = '20px';
        document.body.appendChild(newStatusElement);
        newStatusElement.textContent = message;
    } else {
        statusElement.textContent = message;
    }
}
