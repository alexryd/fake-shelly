const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(id) {
    super('SHHT-1', id)

    this._defineProperty('temperature', 33, 25.8, Number)
    this._defineProperty('humidity', 44, 151, Number)
    this._defineProperty('battery', 77, 97, Number)
  }

  _getHttpStatus() {
    return Object.assign(
      {
        tmp: {
          value: this.temperature,
          units: 'C',
          tC: this.temperature,
          tF: this.temperature * 9 / 5 + 32,
          is_valid: true,
        },
        hum: {
          value: this.humidity,
          is_valid: true,
        },
        bat: {
          value: this.battery,
        },
      },
      super._getHttpStatus()
    )
  }
}

module.exports = ShellyHT
