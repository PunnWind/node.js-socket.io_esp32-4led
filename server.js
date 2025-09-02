const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws'); // raw WebSocket for ESP32

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the public folder (contains index.html)
app.use(express.static(__dirname + '/public'));

// Keep LED states
let ledState = { 1: false, 2: false, 3: false, 4: false };

// WebSocket server for ESP32
const wss = new WebSocket.Server({ port: 8081 }); // ESP32 will connect here
let esp32Socket = null;

wss.on('connection', (ws) => {
  console.log('ESP32 connected');
  esp32Socket = ws;

  ws.on('message', (msg) => {
    const text = msg.toString();
    console.log("[ESP32]", text);
    io.emit('serial-data', text); // send logs to browser
  });

  ws.on('close', () => {
    console.log("ESP32 disconnected");
    esp32Socket = null;
  });
});

// Socket.IO for browser
io.on('connection', (socket) => {
  console.log("Browser connected");
  socket.emit('state-update', ledState);

  socket.on('toggle-led', ({ id, state }) => {
    ledState[id] = state;
    io.emit('state-update', ledState);

    // forward to ESP32
    if (esp32Socket) {
      esp32Socket.send(JSON.stringify({ id, state }));
    } else {
      socket.emit('error-msg', "ESP32 not connected!");
    }
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
