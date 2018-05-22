const ipaddr = require('ipaddr.js')
const express = require('express')
const bodyParser = require('body-parser')
const Keyv = require('keyv')
const noop = function(){}

const DEFAULT_PORT = 8180
const DEFAULT_TTL = 86400000 // 24h

class Server {
  constructor (opts = {}) {
    this.app = express()
    this.port = opts.port || DEFAULT_PORT
    this.enableProxy = opts.enableProxy || false
    this.verbose = opts.verbose || false
    this.log = this.verbose ? console.log : noop
    this.keyv = new Keyv(opts.connectionString)
    return this
  }

  listen () {
    return new Promise((resolve, reject) => {
      this._attachMiddlewares()
      this.app.listen(this.port, () => {
        resolve(this.app)
      })
    })
  }

  _attachMiddlewares () {
    let app = this.app
    if (this.enableProxy) {
      app.enable('trust proxy')
    }
    // parse application/json
    app.use(bodyParser.json())
    app.get('/api/devices', (req, res) => {
     if (req.ip) {
       // get it from the store
       let ip = ipaddr.process(req.ip)
       this.log(`Request from ${req.ip}, mapped to ${ip}`)
       this.keyv.get(ip).then((records) => {
         res.json(records || [])
       })
       // output example: [{"internaladdress":"192.168.1.111","name":"Devicename","added":"2018-04-18T16:01:21.851331927+02:00"}]
     } else {
       res.json([])
     }
    })
    app.post('/api/register', (req, res) => {
      if (!req.body) return res.sendStatus(400)
      let {name, address, port, ttl} = req.body
      let record = {added: new Date(), name, address, port, ttl}
      // validate: ip, name, address, port (opt)
      validateParams(req.ip, record).then(() => {
        let ip = ipaddr.process(req.ip)
        // add to the keyv store.
        this.keyv.get(ip).then((devices) => {
          devices = devices || []
          devices.push(record)
          this.keyv.set(ip, devices, ttl || DEFAULT_TTL).then(() => {
            this.log(`New record ${JSON.stringify(record)} added for ${ip}`)
            res.json({added: true})
          }).catch((err) => {
            this.log(`insert error: ${err.message}`)
            res.status(503).json({error: err.message || `Error: cannot add it to the store`, added: false})
          })
        })
      }).catch((err) => {
        return res.status(400).json(err)
      })
    })
    return this
  }

}

function validateParams (ip, params) {
  return new Promise((resolve, reject) => {
    let {name, address, port, ttl} = params
    if (typeof name !== 'string' || name.length < 1) return reject({error: 'Invalid name'})
    if (!ipaddr.isValid(ip)) return reject({error: 'IP invalid format'})
    if (!ipaddr.isValid(address)) return reject({error: 'Address has invalid IPv4 format'})
    if (port && (!Number.isInteger(port) || port < 0 || port > 65535)) return reject({error: 'Invalid port. It must be an integer between 0 and 65535'})
    if (ttl && (!Number.isInteger(ttl) || ttl < 0)) return reject({error: 'Invalid TTL'})
    resolve()
  })
}

module.exports = Server
