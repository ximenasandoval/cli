const { createSuite } = require('./test-suite')

createSuite().catch((error) => {
  console.log(error)
  process.exit(1)
}).then(() => process.exit(0))
