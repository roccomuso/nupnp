const {Server} = require('../')
const PORT = process.env.PORT || 8180
const ENABLE_PROXY = process.env.ENABLE_PROXY || false
const VERBOSE = process.env.VERBOSE || true

new Server({
  port: PORT,
  verbose: VERBOSE,
  enableProxy: ENABLE_PROXY
}).listen().then(() => console.log(`Server listening on port ${PORT} - Trust proxy: ${ENABLE_PROXY}`)).catch(console.error)
