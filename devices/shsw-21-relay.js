const Device = require('./base')
const mixins = require('./mixins')

class Shelly2Relay extends Device {
  constructor(id) {
    super('SHSW-21', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112)
    mixins.relay(this, 1, 122)

    this
      .on('change:relay0', newValue => {
        this.powerMeter0 += newValue ? 14.38 : -14.38
      })
      .on('change:relay1', newValue => {
        this.powerMeter0 += newValue ? 14.66 : -14.66
      })
  }

  _getHttpSettings() {
    return {
      mode: 'relay',
      relays: [
        this._getRelay0HttpSettings(),
        this._getRelay1HttpSettings(),
      ],
      rollers:[],
      meters: [
        this._getPowerMeter0HttpSettings(),
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
      ],
    }
  }
}

module.exports = Shelly2Relay
