const Device = require('./base')
const mixins = require('./mixins')

class ShellyBulb extends Device {
  constructor(id) {
    super('SHBLB-1', id)

    mixins.rgbw(this, 111, 121, 131, 141, -10, 151)
  }

  _getHttpSettings() {
    return {
      mode: 'color',
    }
  }
}

module.exports = ShellyBulb
