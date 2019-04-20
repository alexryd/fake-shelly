const Device = require('./base')
const mixins = require('./mixins')

class Shelly1 extends Device {
  constructor(id) {
    super('SHSW-1', id)

    mixins.relay(this, 0, 112)
  }

  _getHttpSettings() {
    return {
      relays: [
        this._getRelay0HttpSettings(),
      ],
    }
  }

  _getHttpStatus() {
    return {
      relays: [
        this._getRelay0HttpStatus(),
      ],
    }
  }
}

module.exports = Shelly1
