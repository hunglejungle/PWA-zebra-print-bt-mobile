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
        discoverServicesAndCharacteristics(printerServer);
    } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
        alert(`Failed to connect to the printer. Error: ${error.message}`);
    }
});

async function discoverServicesAndCharacteristics(server) {
    try {
        const services = await server.getPrimaryServices();
        
        for (const service of services) {
            console.log(`Service: ${service.uuid}`);
            
            const characteristics = await service.getCharacteristics();
            
            for (const characteristic of characteristics) {
                console.log(`Characteristic: ${characteristic.uuid}`);
                // You can now interact with the characteristic if it's writable
                // Example: Write data to a characteristic
                // if (characteristic.properties.write) {
                //     await characteristic.writeValue(new TextEncoder().encode('Hello World'));
                // }
            }
        }

        alert('Services and characteristics discovered. Check console for details.');
    } catch (error) {
        console.error('Error discovering services and characteristics:', error);
        alert('Failed to discover services and characteristics.');
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
                    alert('Label sent to printer!');
                    return;  // Exit after sending data
                }
            }
        }

        alert('No writable characteristic found.');
    } catch (error) {
        console.error('Error printing label:', error);
        alert('Failed to print label. Please check the console for details.');
    }
});
