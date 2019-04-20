const EventEmitter = require('eventemitter3')
const os = require('os')

class Device extends EventEmitter {
  constructor(type, id) {
    super()

    this.type = type
    this.id = id
    this.macAddress = '1A2B3C' + id
    this._props = new Map()
    this._httpRoutes = new Map()

    this._httpRoutes.set('/shelly', this._handleShellyRequest)
    this._httpRoutes.set('/settings', this._handleSettingsRequest)
    this._httpRoutes.set('/status', this._handleStatusRequest)
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
          console.log(name, 'changed from', oldValue, 'to', nv)
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

  setupHttpRoutes(server) {
    for (const [path, handler] of this._httpRoutes.entries()) {
      server.get(path, handler.bind(this))
    }
  }

  _handleShellyRequest(req, res, next) {
    res.send({
      type: this.type,
      mac: this.macAddress,
      auth: false,
    })
    next()
  }

  _handleSettingsRequest(req, res, next) {
    res.send(Object.assign(
      {
        device: {
          type: this.type,
          mac: this.macAddress,
        },
        login: {
          enabled: false,
        },
        name: 'fake-shelly',
        time: new Date().toTimeString().substr(0, 5),
      },
      this._getHttpSettings()
    ))
    next()
  }

  _getHttpSettings() {
    return {}
  }

  _handleStatusRequest(req, res, next) {
    res.send(Object.assign(
      {
        time: new Date().toTimeString().substr(0, 5),
        has_update: false,
        ram_total: os.totalmem(),
        ram_free: os.freemem(),
        uptime: Math.floor(process.uptime()),
      },
      this._getHttpStatus()
    ))
    next()
  }

  _getHttpStatus() {
    return {}
  }
}

module.exports = Device
