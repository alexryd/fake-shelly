const Device = require('./base')
const mixins = require('./mixins')

class Shelly4Pro extends Device {
  constructor(id) {
    super('SHSW-44', id)

    mixins.powerMeter(this, 0, 111)
    mixins.relay(this, 0, 112)
    mixins.powerMeter(this, 1, 121)
    mixins.relay(this, 1, 122)
    mixins.powerMeter(this, 2, 131)
    mixins.relay(this, 2, 132)
    mixins.powerMeter(this, 3, 141)
    mixins.relay(this, 3, 142)

    this.on('change:relay0', newValue => {
      this.powerMeter0 = newValue ? 5.32 : 0
    })
    this.on('change:relay1', newValue => {
      this.powerMeter1 = newValue ? 56.81 : 0
    })
    this.on('change:relay2', newValue => {
      this.powerMeter2 = newValue ? 33.95 : 0
    })
    this.on('change:relay3', newValue => {
      this.powerMeter3 = newValue ? 141.01 : 0
    })
  }

  _getHttpSettings() {
    return {
      relays: [
        this._getRelay0HttpSettings(),
        this._getRelay1HttpSettings(),
        this._getRelay2HttpSettings(),
        this._getRelay3HttpSettings(),
      ],
      meters: [
        this._getPowerMeter0HttpSettings(),
        this._getPowerMeter1HttpSettings(),
        this._getPowerMeter2HttpSettings(),
        this._getPowerMeter3HttpSettings(),
      ],
    }
  }

  _getHttpStatus() {
    return {
      relays: [
        this._getRelay0HttpStatus(),
        this._getRelay1HttpStatus(),
        this._getRelay2HttpStatus(),
        this._getRelay3HttpStatus(),
      ],
      meters: [
        this._getPowerMeter0HttpStatus(),
        this._getPowerMeter1HttpStatus(),
        this._getPowerMeter2HttpStatus(),
        this._getPowerMeter3HttpStatus(),
      ],
    }
  }
}

module.exports = Shelly4Pro
