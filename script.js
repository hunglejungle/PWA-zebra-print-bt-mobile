let printerDevice;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        console.log("Requesting Bluetooth Device...");
        printerDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['printer_service'] }] // Replace 'printer_service' with the correct UUID for your Zebra printer
        });

        const server = await printerDevice.gatt.connect();
        console.log("Connected to GATT Server");

        // Save the connection details for later use
        window.printerServer = server;

        alert('Connected to Zebra Printer!');
    } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
        alert('Failed to connect to Zebra Printer.');
    }
});

document.getElementById('print').addEventListener('click', async () => {
    if (!printerDevice) {
        alert('Please connect to the printer first.');
        return;
    }

    try {
        const service = await window.printerServer.getPrimaryService('printer_service'); // Replace with the correct service UUID
        const characteristic = await service.getCharacteristic('printer_characteristic'); // Replace with the correct characteristic UUID

        // Generate ZPL command
        const zpl = '^XA^FO50,50^A0N,50,50^FD123456789^FS^FO50,150^BY2^BCN,100,Y,N,N^FD123456789^FS^XZ';
        const encoder = new TextEncoder();
        const zplData = encoder.encode(zpl);

        await characteristic.writeValue(zplData);
        alert('Label sent to printer!');
    } catch (error) {
        console.error('Error printing label:', error);
        alert('Failed to print label.');
    }
});
