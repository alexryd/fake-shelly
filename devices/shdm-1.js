const Device = require('./base')
const mixins = require('./mixins')

class ShellyDimmer extends Device {
  constructor(id) {
    super('SHDM-1', id)

    mixins.whiteLight(this, 0, 111, 121)
  }

  _getHttpSettings() {
    return {
      mode: 'white',
    }
  }
}

module.exports = ShellyDimmer
