#!/usr/bin/env node

const commandLineArgs = require('command-line-args')

const CoapServer = require('./coap-server')
const HttpServer = require('./http-server')
const { createDevice } = require('./devices')

const opts = commandLineArgs([
  { name: 'device', type: String, defaultValue: 'SHHT-1', defaultOption: true },
  { name: 'id', type: String, defaultValue: 'ABC123' },
])

let device = null

try {
  device = createDevice(
    opts.device.toUpperCase(),
    opts.id.toUpperCase()
  )
} catch (e) {
  console.error('Failed to create device:', e.message)
  return
}

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
