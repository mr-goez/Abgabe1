import * as shell from 'shelljs'

import { beep, dir } from './shared'

const tslint = 'npx --no-install tslint'

const force = ''

const project = '--project tsconfig.json'

const { code } = shell.exec(`${tslint} ${force} ${project} ${dir.src}/**/*.ts`)

if (code !== 0) {
    beep()
}
