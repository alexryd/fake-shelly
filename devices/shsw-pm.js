const Device = require('./base')
const mixins = require('./mixins')

class Shelly1PM extends Device {
  constructor(id) {
    super('SHSW-PM', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112)

    this.on('change:relay0', newValue => {
      this.powerMeter0 = newValue ? 23.05 : 0
    })
  }

  _getHttpSettings() {
    return {
      relays: [
        this._getRelay0HttpSettings(),
      ],
      meters: [
        this._getPowerMeter0HttpSettings(),
      ],
    }
  }

  _getHttpStatus() {
    return {
      relays: [
        this._getRelay0HttpStatus(),
      ],
      meters: [
        this._getPowerMeter0HttpStatus(),
      ],
    }
  }
}

module.exports = Shelly1PM
