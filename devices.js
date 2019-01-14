const EventEmitter = require('eventemitter3')

class Device extends EventEmitter {
  constructor(type, id, host) {
    super()

    this.type = type
    this.id = id
    this.host = host
    this._props = new Map()
  }

  _defineProperty(name, id = null, defaultValue = null, validator = null) {
    const key = `_${name}`

    Object.defineProperty(this, key, {
      value: defaultValue,
      writable: true,
    })

    Object.defineProperty(this, name, {
      get() { return this[key] },
      set(newValue) {
        const nv = validator ? validator(newValue) : newValue
        if (this[key] !== nv) {
          const oldValue = this[key]
          this[key] = nv
          this.emit('change', name, nv, oldValue, this)
          this.emit(`change:${name}`, nv, oldValue, this)
        }
      },
      enumerable: true,
    })

    if (id !== null) {
      this._props.set(id, name)
    }
  }

  getCoapStatusPayload() {
    const updates = []

    for (const [id, name] of this._props.entries()) {
      let val = this[name]
      if (typeof val === 'boolean') {
        val = Number(val)
      }

      updates.push([ 0, id, val ])
    }

    return { G: updates }
  }
}

class Shelly2 extends Device {
  constructor(id, host) {
    super('SHSW-21', id, host)

    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('relay1', 122, false, Boolean)
    this._defineProperty('powerMeter0', 111, 0, Number)

    this
      .on('change:relay0', newValue => {
        this.powerMeter0 += newValue ? 8.43 : -8.43
      })
      .on('change:relay1', newValue => {
        this.powerMeter0 += newValue ? 12.05 : -12.05
      })
  }

  getHttpSettings() {
    return {
      device: {
        type: this.type,
        mac: '000000ABC123',
        hostname: 'shelly-ABC123',
        num_outputs: 2,
        num_meters: 1,
        num_rollers: 1,
      },
      name: 'fake-shelly',
      mode: 'roller',
      relays: [
        {
          ison: this.relay0,
        },
        {
          ison: this.relay1,
        },
      ],
      rollers: [
        {
          swap: false,
          state: 'stop',
        },
      ],
      meters: [
        {
          power: this.powerMeter0,
        },
      ],
    }
  }

  getHttpStatus() {
    return {
      relays: [
        {
          ison: this.relay0,
        },
        {
          ison: this.relay1,
        },
      ],
      rollers: [
        {
          state: 'stop',
          current_pos: 0,
        },
      ],
      meters: [
        {
          power: this.powerMeter0,
        },
      ],
    }
  }
}

module.exports = {
  Shelly2,
}
