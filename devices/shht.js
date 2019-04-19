const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(id, host) {
    super('SHHT-1', id, host)

    this._defineProperty('temperature', 33, 25.8, Number)
    this._defineProperty('humidity', 44, 151, Number)
    this._defineProperty('battery', 77, 97, Number)
  }
}

module.exports = ShellyHT
