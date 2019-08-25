var util = require('util');
var bleno = require('@abandonware/bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var WifiCharacteristic = require('./wifi-characteristic');

function WifiSevice() {
    WifiSevice.super_.call(this, {
      uuid: '180F',
      characteristics: [
          new WifiCharacteristic()
      ]
  });
}

util.inherits(WifiSevice, BlenoPrimaryService);

module.exports = WifiSevice;