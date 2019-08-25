var util = require('util');
var bleno = require('@abandonware/bleno');
var wpa = require('wpa_supplicant');
var wifi = wpa("wlan0");

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var WifiCharacteristic = function() {
  WifiCharacteristic.super_.call(this, {
    uuid: '2A3D', //org.bluetooth.characteristic.string // 00002a3d-0000-1000-8000-00805f9b34fb
    properties: ['read', "write"],
    descriptors: [
      new Descriptor({
        uuid: '2901',
        value: 'List of availabled Wifi Networks'
      }),
      new Descriptor({
        uuid: '2904',
        //value: new Buffer([0x04, 0x01, 0x27, 0xAD, 0x01, 0x00, 0x00 ]) // 4
        value: new Buffer([0x19, 0x01, 0x27, 0xAD, 0x01, 0x00, 0x00 ]) // 25
        // buffer.readUInt8() => 4
        // https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.descriptor.gatt.characteristic_presentation_format.xml
        // 4 => unsigned 8-bit integer
        // <Enumeration key="25" value="UTF-8 string"/>
      })
    ]
  });
};

util.inherits(WifiCharacteristic, Characteristic);

// WifiCharacteristic.prototype.onReadRequest = function(offset, callback) {
//     // return hardcoded value
//     console.log("read request offset:", offset);
//     callback(this.RESULT_SUCCESS, new Buffer("Das ist ein Test😄"));
  
// };
WifiCharacteristic.prototype.onReadRequest = getSSIDs;

WifiCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  // return hardcoded value

  var { psk, ssid} = JSON.parse( data.toString() );
  console.log("SSID Password:", { psk, ssid}, "offset:", offset );
  callback(this.RESULT_SUCCESS);

  wifi.networks.map( network => {
    if (network.ssid == ssid){
      network.connect({psk}, (err)=>{
        console.log("connected to", ssid, err);
      });
    }
  })
};



wifi.on('ready', () => {
  wifi.scan();    
})

var scanData = false;

function getSSIDs(offset, callback){

  var me = this;

  console.log("read request offset:", offset);

  //if offset > 0 sent old data and dont scan again
  if (offset>0){
    callback(me.RESULT_SUCCESS, Buffer.from(scanData).slice(offset) );
    return;
  }

  wifi.scan();
  wifi.once('update', function () {
    var cur = wifi.currentNetwork
    console.log('Current network:', cur && cur.ssid)
    
    let unique = [...new Set(wifi.networks.map(n=>n.ssid))];
    console.log(unique);

    //if offset > 0 sent old data and dont scan again
    scanData = JSON.stringify(unique);
    callback(me.RESULT_SUCCESS, Buffer.from(scanData) );

  });


  


  


}

module.exports = WifiCharacteristic;