const CoapServer = require('./coap-server')
const HttpServer = require('./http-server')
const { Shelly2 } = require('./devices')

const device = new Shelly2('ABC123', '192.168.1.100')

const coapServer = new CoapServer(device)
const httpServer = new HttpServer(device)

coapServer.start()
  .then(() => {
    console.log('CoAP server started')
  })
  .catch(error => {
    console.error('Failed to start CoAP server:', error)
  })

httpServer.start()
  .then(() => {
    console.log('HTTP server started')
  })
  .catch(error => {
    console.error('Failed to start HTTP server:', error)
  })
