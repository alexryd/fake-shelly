const coap = require('coap')
const EventEmitter = require('eventemitter3')

const COAP_MULTICAST_ADDRESS = '224.0.1.187'
const GLOBAL_DEVID = '3332'
const STATUS_VALIDITY = '3412'
const STATUS_SERIAL = '3420'

const setUriPath = (res, uri) => {
  const parts = uri.split('/')
  const buffers = []

  for (const p of parts) {
    if (p) {
      buffers.push(Buffer.from(p))
    }
  }

  if (buffers.length > 0) {
    res.setOption('Uri-Path', buffers)
  }
}

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
      str => {
        const buf = Buffer.alloc(2)
        buf.writeUInt16BE(parseInt(str), 0)
        return buf
      },
      buf => buf.readUInt16BE(0)
    )

    coap.registerOption(
      STATUS_SERIAL,
      str => {
        const buf = Buffer.alloc(2)
        buf.writeUInt16BE(parseInt(str), 0)
        return buf
      },
      buf => buf.readUInt16BE(0)
    )

    CoapServer._optionsRegistered = true
  }

  constructor(device) {
    super()

    this.device = device
    this.server = null
    this.multicastServer = null
    this._serial = 1

    this._boundRequestHandler = this._requestHandler.bind(this)

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

  stop() {
    if (this.server !== null) {
      this.server.close()
      this.server.removeListener('request', this._boundRequestHandler)
      this.server = null
    }

    if (this.multicastServer !== null) {
      this.multicastServer.close()
      this.multicastServer.removeListener('request', this._boundRequestHandler)
      this.multicastServer = null
    }
  }

  _requestHandler(req, res) {
    try {
      if (req.method === 'GET' && req.url === '/cit/s') {
        this._handleStatusRequest(req, res)
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  _handleStatusRequest(req, res) {
    console.log('GET /cit/s')

    const d = this.device
    const deviceId = `${d.type}#${d.id}#1`
    const payload = JSON.stringify(this.device.getCoapStatusPayload())

    setUriPath(res, '/cit/s')
    res.setOption(GLOBAL_DEVID, deviceId)
    res.setOption(STATUS_VALIDITY, 38400)
    res.setOption(STATUS_SERIAL, this.serial++)
    res.end(payload)
  }
}

module.exports = CoapServer
