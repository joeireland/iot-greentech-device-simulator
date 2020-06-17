let socket = null;
let colors = { red: '#C96A6A', green: '#55DF33', blue: '#45A7E7' };

$(initialize);

function initialize() {
  $('#dialog').dialog({
    modal: true,
    width: 650,
    buttons: {
      OK: function() {
        $(this).dialog('close');
        setTimeout(connect, 2000);
      }
    }
  });

  let handleAngle = $('#slider-handle-angle');

  $('#angle').slider({
    step: 5,
    create: () => {
      handleAngle.text('0');
    },
    slide: (event, ui) => {
      console.log('Angle: ' + ui.value);
      handleAngle.text(ui.value);
      socket.send('{ "sensor": "angle", "value": ' + ui.value + ' }');
    }
  });

  let handleProximity = $('#slider-handle-proximity');

  $('#proximity').slider({
    step: 5,
    create: () => {
      handleProximity.text('0');
    },
    slide: (event, ui) => {
      console.log('Proximity: ' + ui.value);
      handleProximity.text(ui.value);
      socket.send('{ "sensor": "proximity", "value": ' + ui.value + ' }');
    }
  });
}

function connect() {
  socket = new WebSocket('ws://' + location.hostname + ':' + location.port);

  socket.onopen = function () {
    console.log('WebSocket Opened: ', socket.readyState);
  }

  socket.onmessage = function (message) {
    let msg = JSON.parse(message.data);

    console.log('WebSocket Message: ' + JSON.stringify(msg));

    if (msg.command === 'red') {
      red(msg.value);
    }
    else if (msg.command === 'blue') {
      blue(msg.value);
    }
    else if (msg.command === 'buzzer') {
      buzzer(msg.value);
    }
    else if (msg.command === 'angle') {
      angle(msg.value);
    }
    else if (msg.command === 'proximity') {
      proximity(msg.value);
    }
    else if (msg.command === 'display') {
      display(msg.text, msg.color);
    }
  }

  socket.onclose = function () {
    console.log('WebSocket Closed: ', socket.readyState);
    setTimeout(connect, 1000);
  }
}

function red(value) {
  console.log('Red: ' + value);
  $('#red').css('filter', 'grayscale(' + (value ? '0%' : '100%') + ')');
}

function blue(value) {
  console.log('Blue: ' + value);
  $('#blue').css('filter', 'grayscale(' + (value ? '0%' : '100%') + ')');
}

function angle(value) {
  console.log('Set Angle: ' + value);
  $('#angle').slider('option', 'value', value);
  $('#slider-handle-angle').text(value);
}

function proximity(value) {
  console.log('Set Proximity: ' + value);
  $('#proximity').slider('option', 'value', value);
  $('#slider-handle-proximity').text(value);
}

function buzzer(value) {
  console.log('Buzzer: ' + value);

  if (value) {
    $('#buzzer')[0].play();
  }
  else {
    $('#buzzer')[0].pause();
  }
}

function display(text, color) {
  console.log('Set Display: text=' + text + ', color=' + color);
  $('#lcd').html(text);
  $('#lcd').css('background-color', colors[color]);
}
