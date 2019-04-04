# homebridge-udp-temphum

UDP server for receiving JSON messages from remote sensors on your network,
plugin for [Homebridge](https://github.com/nfarina/homebridge)

## Installation
1.      Install Homebridge using `npm install -g homebridge`
2.      Install this plugin `npm install -g homebridge-udp-temphum`
3.      Update your configuration file - see below for an example

## Configuration
* `accessory`: "UDP-TempHum"
* `name`: descriptive name
* `name_temperature` (optional): descriptive name for the temperature sensor
* `name_humidity` (optional): descriptive name for the humidity sensor
* `humidity` (optional) ["true"|"false"]: descriptive name for the humidity sensor
* `listen_port` (8268): UDP port to listen for packets on

This currently plugin creates two services: TemperatureSensor and HumiditySensor,
but other sensor types could easily be added in the future.

UDP packets are expected to be sent from a remote sensor in JSON, for example:

```json
{"name":"device", "temperature": 24.35, "humidity": 38.20}
```

This is a custom structure, but is simple enough to send from cheap Wi-Fi enabled microcontrollers such as the ESP8266.

## License

MIT
