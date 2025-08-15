const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const packageRoutes = require('./routes/packages');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Exponer io a los controladores
app.set('io', io);

// Socket.io para recibir y emitir ubicaciones
io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id);

  socket.on('location-update', (data) => {
    io.emit('location-update', data); // reenviar a todos
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/packages', packageRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
