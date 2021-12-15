import path from 'path'
import process from 'process'

const cliPath = path.resolve(__dirname, '..', '..', 'bin', process.platform === 'win32' ? 'run.cmd' : 'run')

export default cliPath
