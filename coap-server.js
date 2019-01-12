const coap = require('coap')
const EventEmitter = require('eventemitter3')

const COAP_MULTICAST_ADDRESS = '224.0.1.187'

class CoapServer extends EventEmitter {
  constructor(device) {
    super()

    this.device = device
    this.multicastServer = null

    this._boundMulticastRequestHandler =
      this._multicastRequestHandler.bind(this)
  }

  start() {
    if (this.multicastServer !== null) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.multicastServer = coap.createServer({
        multicastAddress: COAP_MULTICAST_ADDRESS,
      })
        .on('request', this._boundMulticastRequestHandler)
        .listen(error => {
          if (!error) {
            resolve()
          } else {
            reject(error)
          }
        })
    })
  }

  stop() {
    if (this.multicastServer !== null) {
      this.multicastServer.close()
      this.multicastServer.removeListener(
        'request',
        this._boundMulticastRequestHandler
      )
      this.multicastServer = null
    }
  }

  _multicastRequestHandler(req, res) {
    console.log('Request received')
    console.log(req.code)
    console.log(req.method)
    console.log(req.url)
  }
}

module.exports = CoapServer
