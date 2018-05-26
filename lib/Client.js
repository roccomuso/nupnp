const fetch = require('node-fetch')

class Client {
  constructor (opts = {}) {
    let {host} = opts
    if (!host) { throw Error('Host is mandatory') }
    this.host = host
  }

  getDevices () {
    return fetch(`${this.host}/api/devices`).then(res => res.json())
  }

  register (opts = {}) {
    let {name, address, port, ttl} = opts
    console.log(name, address, port)
    return fetch(`${this.host}/api/register`, {
      method: 'POST',
      body: JSON.stringify({name, address, port, ttl}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
  }
}

module.exports = Client
