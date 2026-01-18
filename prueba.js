const express = require('express'); // Importamos la librería
const app = express();              // Creamos la aplicación
const port = 3000;                  // Definimos el puerto

// Definimos una "ruta" (cuando alguien entre a la raíz '/')
app.get('/', (req, res) => {
    res.send('¡Hola! Servidor Express funcionando.');
});

// Ponemos al servidor a escuchar
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});