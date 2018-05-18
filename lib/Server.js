const IP = require('ip')
const express = require('express')
const bodyParser = require('body-parser')
const Keyv = require('keyv')

const DEFAULT_PORT = 8180
const DEFAULT_TTL = 86400000 // 24h

class Server {
  constructor (opts = {}) {
    this.app = express()
    this.port = opts.port || DEFAULT_PORT
    this.enableProxy = opts.enableProxy || false
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
       // TODO: get it from the store
       console.log('request from:', req.ip)
       this.keyv.get(req.ip).then((records)=>{
         res.json(records)
       })
       // output example: [{"internaladdress":"192.168.1.111","name":"Devicename","added":"2018-04-18T16:01:21.851331927+02:00"}]
     } else {
       res.json([])
     }
    })
    app.post('/api/register', (req, res) => {
      if (!req.body) return res.sendStatus(400)
      let {name, address, port, ttl} = req.body
      let ip = req.ip
      // TODO: validate: name, address, port (opt)
      if (typeof name !== 'string' || name.length < 1) return res.status(400).json({error: 'Invalid name'})
      if (!IP.isV4Format(ip)) return res.status(400).json({error: 'IP invalid format'})
      let record = {added: new Date(), ...req.body}
      // TODO: add to the keyv store.
      console.log('Adding:', record)
      this.keyv.set(ip, record, ttl || DEFAULT_TTL).then(()=>{
        res.json({added: true})
      }).catch((err) => {
        res.status(503).json({error: err.message || `Error: cannot add it to the store`, added: false})
      })

    })
    return this
  }

}

module.exports = Server
