const Shelly1 = require('./shsw-1')
const Shelly1PM = require('./shsw-pm')
const Shelly2 = require('./shsw-2')
const Shelly4Pro = require('./shsw-44')
const ShellyHT = require('./shht')
const ShellyPlug = require('./shplg-1')
const ShellyPlugS = require('./shplg2-1')

const createDevice = (type, id) => {
  switch (type) {
    case 'SHHT-1':
      return new ShellyHT(id)
    case 'SHPLG-1':
      return new ShellyPlug(id)
    case 'SHPLG2-1':
      return new ShellyPlugS(id)
    case 'SHSW-1':
      return new Shelly1(id)
    case 'SHSW-PM':
      return new Shelly1PM(id)
    case 'SHSW-21':
      return new Shelly2(id)
    case 'SHSW-44':
      return new Shelly4Pro(id)
    default:
      throw new Error(`Unknown device type "${type}"`)
  }
}

module.exports = {
  createDevice,
  Shelly1,
  Shelly1PM,
  Shelly2,
  Shelly4Pro,
  ShellyHT,
  ShellyPlug,
  ShellyPlugS,
}
