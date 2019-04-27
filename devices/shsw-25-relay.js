const Device = require('./base')
const mixins = require('./mixins')

class Shelly25Relay extends Device {
  constructor(id) {
    super('SHSW-25', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112)
    mixins.powerMeter(this, 1, 121)
    mixins.relay(this, 1, 122)

    this
      .on('change:relay0', newValue => {
        this.powerMeter0 = newValue ? 23.09 : 0
      })
      .on('change:relay1', newValue => {
        this.powerMeter1 = newValue ? 4.37 : 0
      })
  }

  _getHttpSettings() {
    return {
      mode: 'relay',
      relays: [
        this._getRelay0HttpSettings(),
        this._getRelay1HttpSettings(),
      ],
      rollers: [],
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
        this._getRelay1HttpStatus(),
      ],
      rollers: [],
      meters: [
        this._getPowerMeter0HttpStatus(),
        this._getPowerMeter1HttpStatus(),
      ],
    }
  }
}

module.exports = Shelly25Relay
