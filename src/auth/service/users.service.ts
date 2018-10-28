import * as Ajv from 'ajv'
// https://nodejs.org/api/fs.html
// https://github.com/nodejs/node/blob/master/lib/buffer.js#L191
// Einzulesende oder zu schreibende Dateien im Format UTF-8
import { readFileSync } from 'fs'
import { join } from 'path'

import { log, logger } from '../../shared'

export class UsersService {
    private users = JSON.parse(
        readFileSync(join(__dirname, 'json', 'users.json'), 'utf-8'),
    )

    constructor() {
        const ajv = new Ajv({ allErrors: true, verbose: true })
        const schema = JSON.parse(
            readFileSync(join(__dirname, 'json', 'users.schema.json'), 'utf-8'),
        )
        const valid = ajv.validate(schema, this.users)
        if (!valid) {
            logger.error(`${JSON.stringify(ajv.errors)}`)
        }
        logger.info(
            `Die Benutzerkennungen sind eingelesen: ${JSON.stringify(
                this.users,
            )}`,
        )
    }

    @log
    findByUsername(username: string) {
        return this.users.find((u: any) => u.username === username)
    }

    @log
    findById(id: string) {
        return this.users.find((u: any) => u._id === id)
    }

    @log
    findByEmail(email: string) {
        return this.users.find((u: any) => u.email === email)
    }

    toString() {
        return 'UsersService'
    }
}
