const { Device } = require('./base')

class Shelly1 extends Device {
  constructor(id) {
    super('SHSW-1', id)

    this._relay0Timeout = null

    this._defineProperty('relay0', 112, false, Boolean)
  }

  setupHttpRoutes(server) {
    super.setupHttpRoutes(server)
    server.get('/relay/0', this._handleRelay0Request.bind(this))
  }

  _handleRelay0Request(req, res, next) {
    if (req.query && req.query.turn) {
      const turn = req.query.turn
      if (turn !== 'on' && turn !== 'off') {
        throw new Error('turn must be "on" or "off"')
      }

      this.relay0 = turn === 'on'

      if (req.query.timer && !isNaN(parseInt(req.query.timer))) {
        this._relay0Timeout = setTimeout(() => {
          this.relay0 = !this.relay0
          this._relay0Timeout = null
        }, parseInt(req.query.timer) * 1000)
      }
    }

    res.send({
      ison: this.relay0,
      has_timer: this._relay0Timeout !== null,
    })
    next()
  }
}

module.exports = Shelly1
