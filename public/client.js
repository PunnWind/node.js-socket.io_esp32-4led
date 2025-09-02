const socket = io();
const ledContainer = document.getElementById('leds');
const log = document.getElementById('log');
const logContainer = document.getElementById('log-container');

// create buttons for 4 LEDs
for (let i = 1; i <= 4; i++) {
  const btn = document.createElement('div');
  btn.id = 'led' + i;
  btn.className = 'led-btn off';
  btn.innerText = 'LED ' + i + ' OFF';
  btn.onclick = () => {
    const state = btn.classList.contains('on') ? false : true;
    socket.emit('toggle-led', { id: i, state });
  };
  ledContainer.appendChild(btn);
}

// update LED states from server
socket.on('state-update', (state) => {
  Object.keys(state).forEach(id => {
    const btn = document.getElementById('led' + id);
    if (state[id]) {
      btn.className = 'led-btn on';
      btn.innerText = 'LED ' + id + ' ON';
      addLog(`LED${id} → ON`);
    } else {
      btn.className = 'led-btn off';
      btn.innerText = 'LED ' + id + ' OFF';
      addLog(`LED${id} → OFF`);
    }
  });
});

// display serial log from ESP32
socket.on('serial-data', (text) => {
  addLog("[ESP32] " + text);
});

// error from server
socket.on('error-msg', (msg) => alert(msg));

// helper: add log + scroll
function addLog(message) {
  log.textContent += message + "\n";
  logContainer.scrollTop = logContainer.scrollHeight;
}

// refresh button
document.getElementById('refresh-btn').onclick = () => {
  location.reload();
};
