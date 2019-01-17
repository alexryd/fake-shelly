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

      server.use(restify.plugins.queryParser())
      server.on('pre', req => {
        console.log(req.method, req.url)
      })

      this.device.setupHttpRoutes(server)

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
}

module.exports = HttpServer
