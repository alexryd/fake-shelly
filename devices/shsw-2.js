const Device = require('./base')

class Shelly2 extends Device {
  constructor(id) {
    super('SHSW-21', id)

    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('relay1', 122, false, Boolean)
    this._defineProperty('powerMeter0', 111, 0, Number)

    this._currentState = 'stop'
    this.currentPosition = 0
    this._positionInterval = null

    this
      .on('change:relay0', newValue => {
        this.powerMeter0 += newValue ? 8.43 : -8.43
      })
      .on('change:relay1', newValue => {
        this.powerMeter0 += newValue ? 12.05 : -12.05
      })
  }

  get currentState() {
    return this._currentState
  }

  set currentState(newState) {
    if (newState === this._currentState) {
      return
    }
    if (newState !== 'stop' && newState !== 'open' && newState !== 'close') {
      throw new Error(`Invalid roller shutter state "${newState}"`)
    }

    let relay0 = false
    let relay1 = false

    if (newState === 'open') {
      relay0 = true
    } else if (newState === 'close') {
      relay1 = true
    }

    if (relay0 !== this.relay0) {
      this._relay0 = relay0
      this.emit('change:relay0', relay0, !relay0, this)
    }
    if (relay1 !== this.relay1) {
      this._relay1 = relay1
      this.emit('change:relay1', relay1, !relay1, this)
    }

    const oldState = this._currentState
    this._currentState = newState
    this.emit('change', 'currentState', newState, oldState, this)
  }

  setRollerPosition(newPosition) {
    const cp = this.currentPosition
    const np = Math.max(Math.min(Math.round(newPosition), 100), 0)
    let offset = 0

    if (np === cp) {
      return
    } else if (np > cp) {
      this.currentState = 'open'
      offset = 1
    } else if (np < cp) {
      this.currentState = 'close'
      offset = -1
    }

    if (this._positionInterval !== null) {
      clearInterval(this._positionInterval)
    }

    this._positionInterval = setInterval(() => {
      this.currentPosition += offset
      console.log('currentPosition:', this.currentPosition)

      if ((offset > 0 && this.currentPosition >= np) ||
          (offset < 0 && this.currentPosition <= np)) {
        clearInterval(this._positionInterval)
        this._positionInterval = null
        this.currentState = 'stop'
      }
    }, 100)
  }

  setupHttpRoutes(server) {
    super.setupHttpRoutes(server)
    server.get('/roller/0', this._handleRollerRequest.bind(this))
  }

  _getHttpSettings() {
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
          swap: false,
          state: this.currentState,
        },
      ],
      meters: [
        {
          power: this.powerMeter0,
        },
      ],
    }
  }

  _getHttpStatus() {
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
        this._getHttpRollerStatus(),
      ],
      meters: [
        {
          power: this.powerMeter0,
        },
      ],
    }
  }

  _handleRollerRequest(req, res, next) {
    if (req.query && req.query.go === 'to_pos') {
      if (isNaN(Number(req.query.roller_pos))) {
        throw new Error(`Invalid position "${req.query.roller_pos}"`)
      }

      this.setRollerPosition(Number(req.query.roller_pos))
    }

    res.send(this._getHttpRollerStatus())
    next()
  }

  _getHttpRollerStatus() {
    return {
      state: this.currentState,
      current_pos: this.currentPosition,
    }
  }
}

module.exports = Shelly2
