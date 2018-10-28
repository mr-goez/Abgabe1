import { readFile } from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import { promisify } from 'util'

import { logger } from './logger'

/**
 * Abfrage, ob ein Objekt ein String ist.
 */
export const isString = (obj: unknown) => typeof obj === 'string'

/**
 * Asynchrone Function readFile von Node.js erfordert ein Callback und wird
 * in ein Promise gekapselt, damit spaeter async/await verwendet werden kann.
 */
export const readFileAsync = promisify(readFile)

export const responseTimeFn: (
    req: IncomingMessage,
    res: ServerResponse,
    time: number,
) => void = (_, __, time) => logger.debug(`Response time: ${time} ms`)
