const {test} = require('ava')

const { createSuite } = require('./test-suite')

test.beforeEach(async (t) => {
  await createSuite(t.title)
})

test('test1', () => {
  console.log(global.e2eSuiteState)
})

test('test2', () => {
  console.log(global.e2eSuiteState)
})

test('test3', () => {
  console.log(global.e2eSuiteState)
})

test('test4', () => {
  console.log(global.e2eSuiteState)
})

test('test5', () => {
  console.log(global.e2eSuiteState)
})
