const Shelly1 = require('./shsw-1')
const Shelly2 = require('./shsw-2')
const ShellyHT = require('./shht')

const createDevice = (type, id) => {
  switch (type) {
    case 'SHHT-1':
      return new ShellyHT(id)
    case 'SHSW-1':
      return new Shelly1(id)
    case 'SHSW-21':
      return new Shelly2(id)
    default:
      throw new Error(`Unknown device type "${type}"`)
  }
}

module.exports = {
  createDevice,
  Shelly1,
  Shelly2,
  ShellyHT,
}