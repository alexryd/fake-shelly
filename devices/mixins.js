
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

module.exports = {
  powerMeter,
  relay,
}
