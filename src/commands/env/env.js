// @ts-check
import { createEnvGetCommand } from './env-get.js'
import { createEnvImportCommand } from './env-import.js'
import { createEnvListCommand } from './env-list.js'
import { createEnvSetCommand } from './env-set.js'
import { createEnvUnsetCommand } from './env-unset.js'

/**
 * The env command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command').BaseCommand} command
 */
const env = (options, command) => {
  command.help()
}

/**
 * Creates the `netlify env` command
 * @param {import('../base-command').BaseCommand} program
 * @returns
 */
export const createEnvCommand = (program) => {
  createEnvGetCommand(program)
  createEnvImportCommand(program)
  createEnvListCommand(program)
  createEnvSetCommand(program)
  createEnvUnsetCommand(program)

  return program
    .command('env')
    .description('(Beta) Control environment variables for the current site')
    .addExamples([
      'netlify env:list',
      'netlify env:get VAR_NAME',
      'netlify env:set VAR_NAME value',
      'netlify env:unset VAR_NAME',
      'netlify env:import fileName',
    ])
    .action(env)
}
