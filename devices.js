const EventEmitter = require('eventemitter3')

class Device extends EventEmitter {
  constructor(type, id, host) {
    super()

    this.type = type
    this.id = id
    this.host = host
  }
}

class Shelly2 extends Device {
  constructor(id, host) {
    super('SHSW-21', id, host)

    this._relay0 = false
    this._relay1 = false
    this._powerMeter0 = 0
  }

  get relay0() {
    return this._relay0
  }

  set relay0(newValue) {
    if (!!newValue === this._relay0) {
      return
    }

    this._relay0 = !!newValue
    this.emit('change:relay0', this._relay0, !this._relay0, this)

    if (this._relay0) {
      this.powerMeter0 = 8.43
    }
  }

  get relay1() {
    return this._relay1
  }

  set relay1(newValue) {
    if (!!newValue === this._relay1) {
      return
    }

    this._relay1 = !!newValue
    this.emit('change:relay1', this._relay1, !this._relay1, this)

    if (this._relay1) {
      this.powerMeter0 = 12.05
    }
  }

  get powerMeter0() {
    return this._powerMeter0
  }

  set powerMeter0(newValue) {
    if (newValue === this._powerMeter0) {
      return
    }

    const oldValue = this._powerMeter0

    this._powerMeter0 = newValue
    this.emit('change:powerMeter0', newValue, oldValue, this)
  }

  getCoapStatusPayload() {
    return {
      G: [
        [ 0, 112, Number(this._relay0) ],
        [ 0, 122, Number(this._relay1) ],
        [ 0, 111, this._powerMeter0 ],
      ],
    }
  }
}

module.exports = {
  Shelly2,
}
