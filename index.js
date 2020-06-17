const express  = require('express');
const http     = require('http');
const minimist = require('minimist');
const WS       = require('ws');
const { text } = require('express');

const DEFAULT_PORT = 8080;

const app    = express();
const server = http.createServer(app);
const wss    = new WS.Server({ server });

function main() {
  let args = minimist(process.argv.slice(2));
  let port = args.port || DEFAULT_PORT;

  app.use('/', express.static('./web'));

  wss.on('connection', onWebSocketConnect);

  server.listen(port, () => {
    console.log('Listening: port=' + server.address().port);
  });
}

function onWebSocketConnect(ws, req) {
  console.log('WebSocket Connected');

  ws.on('message', onWebSocketMessage);

  flash();
  beep();
}

function onWebSocketMessage(message) {
  let msg = JSON.parse(message);

  if (msg.sensor === 'angle') {
    console.log('Angle: ' + msg.value);
    angle(msg.value);
  }
  else if (msg.sensor === 'proximity') {
    console.log('Proximity: ' + msg.value);
    proximity(msg.value);
  }
}

function flash() {
  console.log('Flash');

  red(1);
  setTimeout(() => { red(0); }, 1000);
}

function beep() {
  console.log('Beep');

  buzzer(1);
  setTimeout(() => { buzzer(0); }, 1000);
}

function red(value) {
  send({ command: 'red', value: value });
}

function blue(value) {
  send({ command: 'blue', value: value });
}

function angle(value) {
  send({ command: 'angle', value: value });
}

function proximity(value) {
  send({ command: 'proximity', value: value });
}

function buzzer(value) {
  send({ command: 'buzzer', value: value });
}

function display(state, proximity, filled, color, duration) {
  let text = 'Filled: ' + filled + '<br>' + state + '[' + proximity + ']';

  if (duration) {
    text += ': ' + duration + 's';
  }

  send({ command: 'display', text: text, color: color });
}

function send(command) {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WS.OPEN) {
      ws.send(JSON.stringify(command));
    }
  });
}

main();
