const test = require('ava')

const { createSuite } = require('./test-suite')

test.beforeEach(async (t) => {
  await createSuite(t.title)
})

test('other 1', () => {
  console.log(global.e2eSuiteState)
})

test('other 2', () => {
  console.log(global.e2eSuiteState)
})

test('other 3', () => {
  console.log(global.e2eSuiteState)
})

test('other 4', () => {
  console.log(global.e2eSuiteState)
})

test('other 5', () => {
  console.log(global.e2eSuiteState)
})
