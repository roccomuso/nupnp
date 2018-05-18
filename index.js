const express = require('express')

const Server = require('./lib/Server')
const Client = require('./lib/Client')


//module.exports = apis

if (!module.parent) {
  // TODO: move to bin

  const PORT = process.env.PORT || 8180
  const ENABLE_PROXY = process.env.ENABLE_PROXY || false

  new Server().listen(PORT, ENABLE_PROXY).then(()=>console.log('ok')).catch(console.error)


}
