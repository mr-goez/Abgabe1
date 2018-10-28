// Einzulesende oder zu schreibende Dateien im Format UTF-8
import { readFileSync } from 'fs'
import { join } from 'path'

import { log, logger } from '../../shared'

export class RolesService {
    private static ROLES: Array<string> = JSON.parse(
        readFileSync(join(__dirname, 'json', 'roles.json'), 'utf-8'),
    )

    @log
    findAllRoles() {
        return RolesService.ROLES
    }

    @log
    getNormalizedRoles(roles: Array<string>) {
        if (roles === undefined || roles.length === 0) {
            logger.silly('roles: undefined || []')
            return undefined
        }

        const normalizedRoles = roles.filter(
            r => this.getNormalizedRole(r) !== undefined,
        )
        return normalizedRoles.length === 0 ? undefined : normalizedRoles
    }

    toString() {
        return 'RolesService'
    }

    @log
    private getNormalizedRole(role: string) {
        if (role === undefined) {
            return undefined
        }

        // Falls der Rollenname in Grossbuchstaben geschrieben ist, wird er
        // trotzdem gefunden
        return this.findAllRoles().find(
            r => r.toLowerCase() === role.toLowerCase(),
        )
    }
}
