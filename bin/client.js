const {Client} = require('../')
const os = require('os')

let client = new Client({
  host: 'http://localhost:8180'
})

let iface = os.networkInterfaces().wlp2s0 || os.networkInterfaces().eth0

// register a device
client.register({
  name: 'MyDevice',
  address: iface[0].address, // lan ip
  port: 1234, // optional
  ttl: null // optional
}).then(console.log).catch(console.error)

// get devices
client.getDevices().then(console.log).catch(console.error)
