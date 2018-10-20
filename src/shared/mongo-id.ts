import { ObjectID } from 'mongodb'
import { isHexadecimal } from 'validator'

import { logger } from './logger'

export const isMongoId = (id: string) => {
    if (id === undefined) {
        return false
    }
    return (
        id !== undefined && id !== null && id.length === 24 && isHexadecimal(id)
    )
}
export const generateMongoId = () => {
    const id = new ObjectID()
    logger.debug(`id = ${JSON.stringify(id)}`)
    return id
}
