var myCharacteristic;


var log = console.log;

function onStartButtonClick() {
  let serviceUuid = "0x180F";
  let characteristicUuid = "00002a3d-0000-1000-8000-00805f9b34fb"; //"0x2A19";
  
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
    {filters: [{services: ['battery_service']}]})
  .then(device => {
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Getting Battery Service...');
    return server.getPrimaryService('battery_service');
  })
  .then(service => {
    log('Getting Battery Level Characteristic...');
    return service.getCharacteristic(characteristicUuid);
  })
  .then(characteristic => {
    log('Reading Battery Level...');
    mycharacteristic = characteristic;
    return characteristic.readValue();
  })
  .then(value => {
    var decoder = new TextDecoder("utf-8");
    var decodedString = decoder.decode(value);

    var wlist = document.getElementById("wifis");
    for (var i; i<wlist.options.length;i++){
      wlist.options.remove(i);
    }

    var remoteWifis = JSON.parse(decodedString);

    remoteWifis.map( ssid=>{
      var option = document.createElement("option"); 
      option.text = ssid;
      wlist.options.add(option);
    })



    log('> Wifis:', decodedString );
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

function onStopButtonClick() {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
    .then(_ => {
      console.log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));
}


function onConnect(){
  var psk = document.getElementById("psk");
  var wlist = document.getElementById("wifis");
  var selectedSSID = wlist.selectedOptions.length >0 ? wlist.selectedOptions.item(0).value:"";
  var password = psk.value;

  var payload =  JSON.stringify( { "ssid": selectedSSID, "psk": password} );

  let encoder = new TextEncoder('utf-8');
  log('Setting Characteristic User Description...');
  mycharacteristic.writeValue(encoder.encode(payload));

}