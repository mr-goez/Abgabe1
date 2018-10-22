import { logger } from '../../shared'

// tslint:disable:max-classes-per-file

export class ValidationError implements Error {
    name = 'ValidationError'

    constructor(public message: string) {
        logger.debug(`ValidationError.constructor(): ${message}`)
    }
}

export class EanExistsError implements Error {
    name = 'EanExistsError'

    constructor(public message: string) {
        logger.debug(`EanExistsError.constructor(): ${message}`)
    }
}
