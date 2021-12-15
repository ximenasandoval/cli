// @ts-check
const { mkdtemp, rmdir } = require('fs').promises
const { appendFileSync, readFileSync, writeFileSync } = require('fs')
const { tmpdir } = require('os')
const { sep } = require('path')
const process = require('process')

const backoff = require('backoff')
const execa = require('execa')
const getPort = require('get-port')
const ora = require('ora')
const startVerdaccio = require('verdaccio').default

const { name, version } = require('../package.json')
// Timeout of 1 minute
// eslint-disable-next-line no-magic-numbers
const VERDACCIO_TIMEOUT_MILLISECONDS = 60 * 1_000
const START_PORT_RANGE = 5000
const END_PORT_RANGE = 5000

/**
 * Gets the verdaccio configuration
 * @param {string} storage The location where the artifacts are stored
 */
const getVerdaccioConfig = (storage) => ({
  storage,
  web: { title: 'Integration Test Registry' },
  max_body_size: '128mb',
  // Disable creation of users this is only meant for integration testing
  // where it should not be necessary to authenticate. Therefore no user is needed
  max_users: -1,
  logs: { level: 'fatal' },
  uplinks: {
    npmjs: {
      url: 'https://registry.npmjs.org/',
    },
  },
  packages: {
    '**': {
      access: '$all',
      publish: '$anonymous',
      unpublish: '$anonymous',
    },
  },
})

// define a global state for publishing to avoid collision
globalThis.global.e2eSuiteState = {
  published: false,
  inProgress: false,
}

/**
 * Creates a test suite
 * @param {string} suiteName Test name or title
 */
const createSuite = async (suiteName) => {

  if (!global.e2eSuiteState.published) {
    if (global.e2eSuiteState.inProgress) {
      // create a back-off to wait for the publish to be finished
      await new Promise((resolve, reject) => {
        const back = backoff.fibonacci()
        const check = () => (global.e2eSuiteState.published ? resolve() : back.backoff())
        // eslint-disable-next-line no-magic-numbers
        back.failAfter(10)
        back.on('ready', check)
        back.on('fail', reject)
        check()
      })
    } else {
      global.e2eSuiteState.inProgress = true
      console.log('inProgress')

      const { storage, url } = await startRegistry()
      await publishCli(url)
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 5000)
      })
      global.e2eSuiteState.published = true
      global.e2eSuiteState.inProgress = false
      console.log('published')
    }
  }
  // const spinner = ora()

  // spinner.start('Start Npm Registry:')
  // const { storage, url } = await startRegistry()
  // spinner.info(`Started Verdaccio on: ${url}`)
  // spinner.info(`Artifacts are stored in: ${storage}`)
  // spinner.text = `Publish npm package ${name}@${version}`

  // const npmRcBackup = readFileSync('.npmrc', 'utf-8')
  // // NPM 7+ requires a token on publishing even though verdaccio is not checking for it
  // // so temporary add a fake token and restore it afterwards
  // appendFileSync(`.npmrc`, `${url.replace('http:', '')}:_authToken=fake`)

  // try {
  //   await publishCli(url)
  //   spinner.succeed(`Successfully published ${name}@${version}`)
  // } finally {
  //   // TODO: once we drop node support below v14.14.0 we can switch to `rm`
  //   rmdir(storage, { recursive: true })
  //   writeFileSync('.npmrc', npmRcBackup)
  // }

  // console.log('finished')
}

/**
 * Publishes the cli in the provided registry url
 * @param {string} registry
 */
const publishCli = async (registry) => {
  await execa('npm', ['publish', `--registry=${registry}`, process.cwd()])
}

/**
 * Start verdaccio registry and store artifacts in a new temporary folder on the os
 * @returns {Promise<{ url: string; storage: string; }>}
 */
const startRegistry = async () => {
  // generate a random starting port to avoid race condition inside the promise when running a large
  // number in parallel
  const startPort = Math.floor(Math.random() * END_PORT_RANGE) + START_PORT_RANGE
  const port = await getPort({ host: 'localhost', port: startPort })
  const storage = await mkdtemp(`${tmpdir()}${sep}verdaccio-`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Starting Verdaccio Timed out'))
    }, VERDACCIO_TIMEOUT_MILLISECONDS)

    startVerdaccio(getVerdaccioConfig(storage), port, storage, '1.0.0', 'verdaccio', (webServer, { port }) => {
      webServer.listen(port, 'localhost', () => {
        resolve({ url: `http://localhost:${port}/`, storage })
      })
    })
  })
}

module.exports = { createSuite }
