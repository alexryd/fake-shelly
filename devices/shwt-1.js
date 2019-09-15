const Device = require('./base')

class ShellyFlood extends Device {
  constructor(id) {
    super('SHWT-1', id)

    this._defineProperty('flood', 23, false, Boolean)
    this._defineProperty('temperature', 33, 21.2, Number)
    this._defineProperty('battery', 77, 64, Number)
  }

  _getHttpSettings() {
    return {
      sensors: {
        temperature_threshold: 1,
        temperature_unit: 'C',
      },
      sleep_mode: {
        period: 3,
        unit: 'h',
      },
    }
  }

  _getHttpStatus() {
    return {
      flood: this.flood,
      tmp: {
        value: this.temperature,
        units: 'C',
        tC: this.temperature,
        tF: this.temperature * 9 / 5 + 32,
        is_valid: true,
      },
      bat: {
        value: this.battery,
      },
    }
  }
}

module.exports = ShellyFlood
