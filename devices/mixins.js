
const powerMeter = (device, index, id) => {
  device._defineProperty(`powerMeter${index}`, id, 0, Number)

  const getHttpSettings = () => {
    return getHttpStatus()
  }
  device[`_getPowerMeter${index}HttpSettings`] = getHttpSettings

  const getHttpStatus = () => {
    return {
      power: device[`powerMeter${index}`],
      is_valid: true,
    }
  }
  device[`_getPowerMeter${index}HttpStatus`] = getHttpStatus
}

const relay = (device, index, id, disableHttpRoute = false) => {
  device[`_relay${index}Timeout`] = null

  device._defineProperty(`relay${index}`, id, false, Boolean)

  const getHttpSettings = () => {
    return Object.assign(
      {
        default_state: 'off',
        btn_type: 'toggle',
        auto_on: 0,
        auto_off: 0,
      },
      getHttpStatus()
    )
  }
  device[`_getRelay${index}HttpSettings`] = getHttpSettings

  const getHttpStatus = () => {
    return {
      ison: device[`relay${index}`],
      has_timer: device[`_relay${index}Timeout`] !== null,
    }
  }
  device[`_getRelay${index}HttpStatus`] = getHttpStatus

  device._httpRoutes.set(`/relay/${index}`, (req, res, next) => {
    if (disableHttpRoute) {
      res.send('Device mode is not relay!')
      next()
      return
    }

    if (req.query && req.query.turn) {
      const turn = req.query.turn
      if (turn !== 'on' && turn !== 'off') {
        throw new Error('turn must be "on" or "off"')
      }

      device[`relay${index}`] = turn === 'on'

      if (req.query.timer && !isNaN(parseInt(req.query.timer))) {
        if (device[`_relay${index}Timeout`] !== null) {
          clearTimeout(device[`_relay${index}Timeout`])
        }

        device[`_relay${index}Timeout`] = setTimeout(() => {
          device[`relay${index}`] = turn !== 'on'
          device[`_relay${index}Timeout`] = null
        }, parseInt(req.query.timer) * 1000)
      }
    }

    res.send(getHttpStatus())
    next()
  })
}

const rgbw = (device, redId, greenId, blueId, whiteId, gainId, switchId) => {
  device._defineProperty('red', redId, 0, Number)
  device._defineProperty('green', greenId, 0, Number)
  device._defineProperty('blue', blueId, 0, Number)
  device._defineProperty('white', whiteId, 0, Number)
  device._defineProperty('gain', gainId, 0, Number)
  device._defineProperty('switch', switchId, false, Boolean)

  const getHttpStatus = () => {
    return {
      ison: device.switch,
      red: device.red,
      green: device.green,
      blue: device.blue,
      white: device.white,
      gain: device.gain,
    }
  }
  device[`_getRgbHttpStatus`] = getHttpStatus

  device._httpRoutes.set('/color/0', (req, res, next) => {
    if (req.query) {
      const turn = req.query.turn
      const red = req.query.red
      const green = req.query.green
      const blue = req.query.blue
      const white = req.query.white
      const gain = req.query.gain

      if (turn !== undefined) {
        if (turn !== 'on' && turn !== 'off') {
          throw new Error('turn must be "on" or "off"')
        }
        device.switch = turn === 'on'
      }

      if (red !== undefined) {
        if (isNaN(Number(red))) {
          throw new Error('red must be a number')
        }
        device.red = Math.max(Math.min(Math.round(red), 255), 0)
      }
      if (green !== undefined) {
        if (isNaN(Number(green))) {
          throw new Error('green must be a number')
        }
        device.green = Math.max(Math.min(Math.round(green), 255), 0)
      }
      if (blue !== undefined) {
        if (isNaN(Number(blue))) {
          throw new Error('blue must be a number')
        }
        device.blue = Math.max(Math.min(Math.round(blue), 255), 0)
      }
      if (white !== undefined) {
        if (isNaN(Number(white))) {
          throw new Error('white must be a number')
        }
        device.white = Math.max(Math.min(Math.round(white), 255), 0)
      }
      if (gain !== undefined) {
        if (isNaN(Number(gain))) {
          throw new Error('gain must be a number')
        }
        device.gain = Math.max(Math.min(Math.round(gain), 100), 0)
      }
    }

    res.send(getHttpStatus())
    next()
  })
}

const roller = (device, id) => {
  device._rollerState = 'stop'
  device._rollerPositionInterval = null

  device._defineProperty('rollerPosition', id, 0, Number)

  const setState = newState => {
    if (newState === device._rollerState) {
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

    if (relay0 !== device.relay0) {
      // change the private property here to avoid triggering a
      // status update broadcast
      device._relay0 = relay0
      device.emit('change:relay0', relay0, !relay0, device)
    }
    if (relay1 !== device.relay1) {
      // change the private property here to avoid triggering a
      // status update broadcast
      device._relay1 = relay1
      device.emit('change:relay1', relay1, !relay1, device)
    }

    const oldState = device._rollerState
    device._rollerState = newState
    device.emit('change', 'rollerState', newState, oldState, device)
    device.emit('change:rollerState', newState, oldState, device)
  }

  const setPosition = newPosition => {
    const cp = device.rollerPosition
    const np = Math.max(Math.min(Math.round(newPosition), 100), 0)
    let offset = 0

    if (np === cp) {
      return
    } else if (np > cp) {
      setState('open')
      offset = 10
    } else if (np < cp) {
      setState('close')
      offset = -10
    }

    if (device._rollerPositionInterval !== null) {
      clearInterval(device._rollerPositionInterval)
    }

    device._rollerPositionInterval = setInterval(() => {
      if (offset > 0) {
        device.rollerPosition = Math.min(device.rollerPosition + offset, np)
      } else {
        device.rollerPosition = Math.max(device.rollerPosition + offset, np)
      }
      console.log('rollerPosition:', device.rollerPosition)

      if ((offset > 0 && device.rollerPosition >= np) ||
          (offset < 0 && device.rollerPosition <= np)) {
        clearInterval(device._rollerPositionInterval)
        device._rollerPositionInterval = null
        setState('stop')
      }
    }, 1000)
  }
  device.setRollerPosition = setPosition

  const getHttpSettings = () => {
    return Object.assign(
      {
        swap: false,
      },
      getHttpStatus(),
    )
  }
  device._getRollerHttpSettings = getHttpSettings

  const getHttpStatus = () => {
    return {
      state: device._rollerState,
      current_pos: device.rollerPosition,
    }
  }
  device._getRollerHttpStatus = getHttpStatus

  device._httpRoutes.set('/roller/0', (req, res, next) => {
    if (req.query && req.query.go === 'to_pos') {
      if (isNaN(parseInt(req.query.roller_pos))) {
        throw new Error(`Invalid position "${req.query.roller_pos}"`)
      }

      setPosition(Number(req.query.roller_pos))
    }

    res.send(getHttpStatus())
    next()
  })
}

const whiteLight = (device, index, brightnessId, switchId, uri = '/white/') => {
  device._defineProperty(`brightness${index}`, brightnessId, 0, Number)
  device._defineProperty(`switch${index}`, switchId, false, Boolean)

  const getHttpStatus = () => {
    return {
      ison: device[`switch${index}`],
      brightness: device[`brightness${index}`],
    }
  }
  device[`_getWhiteLight${index}HttpStatus`] = getHttpStatus

  device._httpRoutes.set(`${uri}${index}`, (req, res, next) => {
    if (req.query) {
      const turn = req.query.turn
      const brightness = req.query.brightness

      if (turn !== undefined) {
        if (turn !== 'on' && turn !== 'off') {
          throw new Error('turn must be "on" or "off"')
        }
        device[`switch${index}`] = turn === 'on'
      }

      if (brightness !== undefined) {
        if (isNaN(Number(brightness))) {
          throw new Error('brightness must be a number')
        }
        device[`brightness${index}`] =
          Math.max(Math.min(Math.round(brightness), 100), 0)
      }
    }

    res.send(getHttpStatus())
    next()
  })
}

module.exports = {
  powerMeter,
  relay,
  rgbw,
  roller,
  whiteLight,
}
