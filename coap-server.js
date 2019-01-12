const coap = require('coap')
const EventEmitter = require('eventemitter3')

const COAP_MULTICAST_ADDRESS = '224.0.1.187'
const GLOBAL_DEVID = '3332'
const STATUS_VALIDITY = '3412'
const STATUS_SERIAL = '3420'

class CoapServer extends EventEmitter {
  static registerOptions() {
    if (CoapServer._optionsRegistered) {
      return
    }

    coap.registerOption(
      GLOBAL_DEVID,
      str => Buffer.from(str),
      buf => buf.toString()
    )

    coap.registerOption(
      STATUS_VALIDITY,
      str => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
      buf => buf.readUInt16BE(0)
    )

    coap.registerOption(
      STATUS_SERIAL,
      str => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
      buf => buf.readUInt16BE(0)
    )

    CoapServer._optionsRegistered = true
  }

  constructor(device) {
    super()

    this.device = device
    this.server = null
    this.multicastServer = null

    this._boundRequestHandler = this._requestHandler.bind(this)
    this._boundMulticastRequestHandler =
      this._multicastRequestHandler.bind(this)

    CoapServer.registerOptions()
  }

  start() {
    return Promise.all([
      this._startServer(),
      this._startMulticastServer(),
    ])
      .catch(error => {
        this.stop()
        throw error
      })
  }

  _startServer() {
    if (this.server !== null) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.server = coap.createServer()
        .on('request', this._boundRequestHandler)
        .listen(error => {
          if (!error) {
            resolve()
          } else {
            reject(error)
          }
        })
    })
  }

  _startMulticastServer() {
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
    if (this.server !== null) {
      this.server.close()
      this.server.removeListener('request', this._boundRequestHandler)
      this.server = null
    }

    if (this.multicastServer !== null) {
      this.multicastServer.close()
      this.multicastServer.removeListener(
        'request',
        this._boundMulticastRequestHandler
      )
      this.multicastServer = null
    }
  }

  _requestHandler(req, res) {
    console.log('Request received')
    console.log(req.code)
    console.log(req.method)
    console.log(req.url)
  }

  _multicastRequestHandler(req, res) {
    console.log('Multicast request received')
    console.log(req.code)
    console.log(req.method)
    console.log(req.url)
  }
}

module.exports = CoapServer
