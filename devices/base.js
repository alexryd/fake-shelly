const EventEmitter = require('eventemitter3')

class Device extends EventEmitter {
  constructor(type, id) {
    super()

    this.type = type
    this.id = id
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
    server.get('/settings', this._handleSettingsRequest.bind(this))
    server.get('/status', this._handleStatusRequest.bind(this))
  }

  _handleSettingsRequest(req, res, next) {
    res.send(this._getHttpSettings())
    next()
  }

  _getHttpSettings() {
    return {}
  }

  _handleStatusRequest(req, res, next) {
    res.send(this._getHttpStatus())
    next()
  }

  _getHttpStatus() {
    return {}
  }
}

module.exports = {
  Device,
}
