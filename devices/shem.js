const Device = require('./base')
const mixins = require('./mixins')

class ShellyEM extends Device {
  constructor(id) {
    super('SHEM', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112)
    mixins.powerMeter(this, 1, 121)

    this.on('change:relay0', newValue => {
      this.powerMeter0 = newValue ? 33.91 : 0
      this.powerMeter1 = newValue ? 167.43 : 0
    })
  }

  _getHttpSettings() {
    return {
      relays: [
        this._getRelay0HttpSettings(),
      ],
      meters: [
        this._getPowerMeter0HttpSettings(),
        this._getPowerMeter1HttpSettings(),
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
        this._getPowerMeter1HttpStatus(),
      ],
    }
  }
}

module.exports = ShellyEM
