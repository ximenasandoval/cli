import process from 'process'

import test from 'ava'

import callCli from './utils/call-cli.js'
import { withSiteBuilder } from './utils/site-builder.js'

test('should pass .env variables to exec command', async (t) => {
  await withSiteBuilder('site-env-file', async (builder) => {
    builder.withEnvFile({ env: { TEST: 'ENV_VAR' } })
    await builder.buildAsync()

    const cmd = process.platform === 'win32' ? 'set' : 'printenv'
    const output = await callCli(['dev:exec', cmd], {
      cwd: builder.directory,
    })

    t.is(output.includes('Injected .env file env var: TEST'), true)
    t.is(output.includes('TEST=ENV_VAR'), true)
  })
})
