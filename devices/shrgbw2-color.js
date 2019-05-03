const Device = require('./base')
const mixins = require('./mixins')

class ShellyRGBW2Color extends Device {
  constructor(id) {
    super('SHRGBW2', id)

    mixins.rgbw(this, 111, 121, 131, 141, 151, 161)
  }

  _getHttpSettings() {
    return {
      mode: 'color',
    }
  }
}

module.exports = ShellyRGBW2Color
