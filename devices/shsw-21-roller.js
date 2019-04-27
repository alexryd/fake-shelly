const Device = require('./base')
const mixins = require('./mixins')

class Shelly2Roller extends Device {
  constructor(id) {
    super('SHSW-21', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112, true)
    mixins.roller(this, 113)
    mixins.relay(this, 1, 122, true)

    this
      .on('change:relay0', newValue => {
        this.powerMeter0 += newValue ? 18.23 : -18.23
      })
      .on('change:relay1', newValue => {
        this.powerMeter0 += newValue ? 104.66 : -104.66
      })
  }

  _getHttpSettings() {
    return {
      mode: 'roller',
      relays: [
        this._getRelay0HttpSettings(),
        this._getRelay1HttpSettings(),
      ],
      rollers: [
        this._getRollerHttpSettings(),
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
        this._getRelay1HttpStatus(),
      ],
      rollers: [
        this._getRollerHttpStatus(),
      ],
      meters: [
        this._getPowerMeter0HttpStatus(),
      ],
    }
  }
}

module.exports = Shelly2Roller
