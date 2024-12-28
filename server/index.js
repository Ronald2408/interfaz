const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const WebSocket = require('ws');  // Importa WebSocket

const app = express();
app.use(cors());
app.use(express.json());

console.log('Servidor Express iniciado');

// Configuración de la conexión a la base de datos MySQL en Clever Cloud
const db = mysql.createConnection({
  host: 'b3o8kpsldinxfvdwpjk4-mysql.services.clever-cloud.com',
  user: 'uqopg17f5ojxexlm',
  password: 'VUNx8Jct4sqxkX3UEZJL',
  database: 'b3o8kpsldinxfvdwpjk4',
  port: 3306,
});

console.log('Intentando conectar a la base de datos en Clever Cloud...');

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos en Clever Cloud:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL en Clever Cloud.');
});

// Inicia el servidor HTTP en el puerto 5003
const port = process.env.PORT || 5003;
const server = app.listen(port, '0.0.0.0', () => {
  console.log('Servidor Express iniciado en http://0.0.0.0:5003');
});

// Inicia el servidor WebSocket
const wss = new WebSocket.Server({ server });

let esp32Socket = null;  // Para guardar la conexión WebSocket de la ESP32

wss.on('connection', (ws) => {
  console.log('Cliente conectado vía WebSocket.');

  ws.on('message', (message) => {
    const textMessage = message.toString(); // Convertimos el Buffer a texto
    console.log('Mensaje recibido del cliente:', message);

    // Verificamos si es la ESP32
    if (textMessage === 'ESP32') {
      esp32Socket = ws;  // Guardamos la referencia de la ESP32
      console.log('ESP32 conectada.');
    }
  });

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

// Ruta para recibir y actualizar el valor del slider en la base de datos y enviarlo a la ESP32
app.post('/actualizar-slider', (req, res) => {
  console.log('Solicitud POST recibida en /actualizar-slider');
  const { sliderValue } = req.body;
  console.log('Valor del slider recibido:', sliderValue);

  if (sliderValue === null || sliderValue === undefined) {
    console.log('Valor del slider no es válido');
    return res.status(400).send('Valor del slider no es válido');
  }

  const queryUpdate = 'UPDATE Medidas SET Ref_remota = ? ORDER BY id DESC LIMIT 1';
  db.query(queryUpdate, [sliderValue], (err, result) => {
    if (err) {
      console.error('Error en la actualización de Ref_remota:', err);
      return res.status(500).send(err);
    }
    console.log('Valor del slider actualizado correctamente en Ref_remota');

    // Si la ESP32 está conectada, enviamos el valor directamente
    if (esp32Socket) {
      esp32Socket.send(JSON.stringify({ ref_remota: sliderValue }));
      console.log('Valor de Ref_remota enviado a la ESP32:', sliderValue);
    }

    res.send('Valor del slider actualizado correctamente y enviado a la ESP32');
  });
});

// Ruta para obtener los datos más recientes para las gráficas
app.get('/datos', (req, res) => {
  console.log('Solicitud GET recibida en /datos');
  const query = 'SELECT Tiempo, Velocidad, Referencia, Senal_control, Kp, Ki, Kd, Kn, Ks FROM Medidas ORDER BY id DESC LIMIT 50';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return res.status(500).send(err);
    }
    res.json(result);
  });
});


