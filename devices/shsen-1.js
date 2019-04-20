const Device = require('./base')

class ShellySense extends Device {
  constructor(id) {
    super('SHSEN-1', id)

    this._defineProperty('motion', 11, false, Boolean)
    this._defineProperty('charging', 22, false, Boolean)
    this._defineProperty('temperature', 33, 21.3, Number)
    this._defineProperty('humidity', 44, 23, Number)
    this._defineProperty('illuminance', 66, 49.51, Number)
    this._defineProperty('battery', 77, 92, Number)
  }

  _getHttpSettings() {
    return {
      sensors: {
        motion_duration: 20,
        motion_led: true,
      },
      tmp: {
        units: 'C',
      },
    }
  }

  _getHttpStatus() {
    return {
      motion: this.motion,
      charger: this.charging,
      tmp: {
        value: this.temperature,
      },
      hum: {
        value: this.humidity,
      },
      lux: {
        value: this.illuminance,
      },
      bat: {
        value: this.battery,
      },
    }
  }
}

module.exports = ShellySense
