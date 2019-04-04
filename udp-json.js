'use strict';

const dgram = require('dgram');

let Service, Characteristic;

module.exports = (homebridge) => {
   Service = homebridge.hap.Service;
   Characteristic = homebridge.hap.Characteristic;

   homebridge.registerAccessory('homebridge-udp-temphum', 'UDP-TempHum', UDPTempHumPlugin);
};

class UDPTempHumPlugin {
   constructor(log, config) {
      this.log = log;
      this.humidityService = false;

      this.name = config.name;
      this.name_temperature = config.name_temperature || this.name;
      this.name_humidity = config.name_humidity || this.name;
      this.humidity = config.humidity || "true";
      this.listen_port = config.listen_port || 2323;

      this.informationService = new Service.AccessoryInformation();

      this.informationService
         .setCharacteristic(Characteristic.Manufacturer, "Hoefnix")
         .setCharacteristic(Characteristic.Model, "UDP-TempHum")
         .setCharacteristic(Characteristic.SerialNumber, this.device);

      this.temperatureService = new Service.TemperatureSensor(this.name_temperature);
      this.temperatureService
         .getCharacteristic(Characteristic.CurrentTemperature)
         .setProps({
            minValue: -100,
            maxValue: 100
         });

      if (this.humidity == "true") {
         this.humidityService = new Service.HumiditySensor(this.name_humidity);
      }
      //  this.server = dgram.createSocket('udp4');
      this.server = dgram.createSocket({
         type: 'udp4',
         reuseAddr: true
      });

      this.server.on('error', (err) => {
         this.log(`udp server error:\n${err.stack}`);
         this.server.close();
      });

      this.server.on('message', (msg, rinfo) => {
         let json;
         try {
            json = JSON.parse(msg);
         } catch (e) {
            console.log(`failed to decode JSON: ${e}`);
            return;
         }

         // check if the json is meant for this instance
         if (typeof json.name === "undefined") return;
         if (json.name.toLowerCase() != this.name.toLowerCase()) return;

         this.log(`Received UDP: ${msg} from ${rinfo.address}`);

         const temperature_c = json.temperature;
         this.temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setValue(temperature_c);

         if (this.humidity == "true") {
            const humidity_percent = json.humidity;
            this.humidityService
               .getCharacteristic(Characteristic.CurrentRelativeHumidity)
               .setValue(humidity_percent);
         }
      });

      this.server.bind({
         port: this.listen_port,
         exclusive: false
      });
   }

   getServices() {
      if (this.humidity == "true") {
         return [this.informationService, this.temperatureService, this.humidityService]
      }
      return [this.informationService, this.temperatureService]
   }
}
