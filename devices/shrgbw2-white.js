const Device = require('./base')
const mixins = require('./mixins')

class ShellyRGBW2White extends Device {
  constructor(id) {
    super('SHRGBW2', id)

    mixins.whiteLight(this, 0, 111, 151)
    mixins.whiteLight(this, 1, 121, 161)
    mixins.whiteLight(this, 2, 131, 171)
    mixins.whiteLight(this, 3, 141, 181)
  }

  _getHttpSettings() {
    return {
      mode: 'white',
    }
  }
}

module.exports = ShellyRGBW2White
