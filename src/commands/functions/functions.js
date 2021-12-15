// @ts-check
import { chalk } from '../../utils/index.js'

import { createFunctionsBuildCommand } from './functions-build.js'
import { createFunctionsCreateCommand } from './functions-create.js'
import { createFunctionsInvokeCommand } from './functions-invoke.js'
import { createFunctionsListCommand } from './functions-list.js'
import { createFunctionsServeCommand } from './functions-serve.js'

/**
 * The functions command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command').BaseCommand} command
 */
const functions = (options, command) => {
  command.help()
}

/**
 * Creates the `netlify functions` command
 * @param {import('../base-command').BaseCommand} program
 * @returns
 */
export const createFunctionsCommand = (program) => {
  createFunctionsBuildCommand(program)
  createFunctionsCreateCommand(program)
  createFunctionsInvokeCommand(program)
  createFunctionsListCommand(program)
  createFunctionsServeCommand(program)

  const name = chalk.greenBright('`functions`')

  return program
    .command('functions')
    .alias('function')
    .description(
      `Manage netlify functions
The ${name} command will help you manage the functions in this site`,
    )
    .addExamples([
      'netlify functions:create --name function-xyz',
      'netlify functions:build --name function-abc --timeout 30s',
    ])
    .action(functions)
}
