/* eslint-disable */
import { statSync } from 'fs'
import { readdir, readFile, writeFile } from 'fs/promises'
import { builtinModules } from 'module'
import { join } from 'path'
const getFiles = async (dir) => {
  const dirents = await readdir(dir)
  const files = []

  for (const dirOrFile of dirents) {
    const fullPath = join(dir, dirOrFile)
    if (statSync(fullPath).isDirectory()) {
      files.push(...(await getFiles(fullPath)))
    }

    if (statSync(fullPath).isFile() && dirOrFile.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

const files = (await getFiles(`tests`)).filter(file => !file.includes('src/functions-templates'))

for (const file of files) {
  const content = await readFile(file, 'utf-8')

  let replaced = content.replace(/const\s(.+?)\s=\srequire\('(.+?)'\)/gm, (match, first, second) => {
    // console.log(args)
    const file = second.startsWith('.') ? '.js' : ''

    if (builtinModules.includes(second)) {
      second = `node:${second}`
    }

    return `import ${first} from '${second}${file}'`
  })

  const regex = /module\.exports\s=\s\{([\s\S]+?)\}/gm

  const m = regex.exec(replaced)

  if (m && m.length >= 2 && m[1]) {
    replaced = replaced.replace(m[0], '');
    try {


    m[1]
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
      .forEach((sym) => {
        replaced = replaced.replace(new RegExp(`^(.+?)${sym}`, 'gm'), `export $1${sym}`)
      })
    } catch(error) {
      console.log(error)
    }
  }

  replaced = replaced.replace(/module\.exports \=/gm, 'export default')

  // console.log(replaced)
  await writeFile(file, replaced, 'utf-8')
}
