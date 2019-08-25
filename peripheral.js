//sudo setcap cap_net_raw+eip $(eval readlink -f $(which node))
//        hci0    DC:A6:32:02:48:35
// apt install libdbus-1-dev
// python3 -m http.server 8888 --bind 127.0.0.1

var bleno = require('@abandonware/bleno');
var WifiSevice = require('./wifi-service');

var primaryService = new WifiSevice();

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Battery', [primaryService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([primaryService], function(error){
      console.log('setServices: '  + (error ? 'error ' + error : 'success'));
    });
  }
});




