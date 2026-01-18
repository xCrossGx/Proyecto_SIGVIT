const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    setInterval(() => {
        const payload = {
            temperatura_contacto: 36.7,
            temperatura_infrarrojo: 36.4,
            electrocardiograma: 512.5
        };
        client.publish('esp32/sensores', JSON.stringify(payload));
        console.log('🚀 Datos de sensores enviados');
    }, 5000);
});