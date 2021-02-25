const { join } = require('path')

const build = require('@netlify/build')
const cpy = require('cpy')
const { v1: uuidv1 } = require('uuid')

const { getPathInProject } = require('./settings')

// We have already resolved the configuration using `@netlify/config`
// This is stored as `netlify.cachedConfig` and can be passed to
// `@netlify/build --cachedConfig`.
const getBuildOptions = async ({ context, flags }) => {
  const [token] = await context.getConfigToken()
  const { cachedConfig } = context.netlify
  const serializedConfig = JSON.stringify(cachedConfig)

  const { dry, debug } = flags
  // buffer = true will not stream output
  const buffer = flags.json || flags.silent

  return {
    cachedConfig: serializedConfig,
    token,
    dry,
    debug,
    mode: 'cli',
    telemetry: false,
    buffer,
  }
}

const BUILDS_DIR = 'builds'

const getBuildPath = (buildId) => getPathInProject([BUILDS_DIR, buildId])

const prepareBuild = async (siteRoot) => {
  const buildId = uuidv1()
  const buildCwd = getBuildPath(buildId)
  await cpy(['.', `!./node_modules/**/*`], buildCwd, { parents: true, cwd: siteRoot })
  return { cwd: `${siteRoot}/${buildCwd}` }
}

const runBuild = async (options) => {
  const { severityCode: exitCode } = await build(options)
  return { exitCode }
}

const runCleanBuild = async ({ context, siteRoot, options }) => {
  const {
    netlify: { state },
  } = context

  const { cwd } = await prepareBuild(siteRoot)
  const { cachedConfig } = await context.initConfig({ cwd, state, token: options.token })
  const { severityCode: exitCode } = await build({
    ...options,
    cachedConfig: JSON.stringify(cachedConfig),
    cwd,
    repositoryRoot: cwd,
  })
  const { configPath, config: newConfig, buildDir } = cachedConfig
  const newFunctionsDir = newConfig.build.functions ? join(cwd, '.netlify', 'functions') : newConfig.build.functions
  return {
    exitCode,
    newConfig: { ...newConfig, build: { ...newConfig.build, functions: newFunctionsDir } },
    newSite: context.getSite({ buildDir, configPath, state }),
  }
}

module.exports = { getBuildOptions, runBuild, runCleanBuild }
