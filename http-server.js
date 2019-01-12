const EventEmitter = require('eventemitter3')
const restify = require('restify')

const packageJson = require('./package.json')

class HttpServer extends EventEmitter {
  constructor(device) {
    super()

    this.device = device
    this.server = null
  }

  start() {
    if (this.server !== null) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const server = this.server = restify.createServer({
        name: 'Fake Shelly',
        version: packageJson.version,
      })

      this._setupRoutes(server)

      server.listen(80, error => {
        if (!error) {
          resolve()
        } else {
          reject(error)
        }
      })
    })
  }

  stop() {
    if (this.server === null) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this.server.close(() => {
        this.server = null
        resolve()
      })
    })
  }

  _setupRoutes(server) {
    server.get('/settings', this._handleSettingsRequest.bind(this))
    server.get('/status', this._handleStatusRequest.bind(this))
  }

  _handleSettingsRequest(req, res, next) {
    console.log('GET /settings')

    res.send(this.device.getHttpSettings())
    next()
  }

  _handleStatusRequest(req, res, next) {
    console.log('GET /status')

    res.send(this.device.getHttpStatus())
    next()
  }
}

module.exports = HttpServer
