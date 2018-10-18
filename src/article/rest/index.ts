import { Request, Response } from 'express'

import { log, logger } from '../../shared'

class ArtikelRequestHandler {
    @log
    // tslint:disable-next-line:max-line-length
    helloWorld(req: Request, res: Response) {
        // erfüllt keinen Zweck, aber Parameter req ist gefordert.
        const header = req.header
        // Noch nicht async+await da kein (asynchroner) DB-Zugriff
        logger.debug('Aufruf der Funktion: HelloWorld')

        res.header(header)
        res.json('Hello World!!!')
    }
}
const handler = new ArtikelRequestHandler()

// hier exportierte Functions:
export const helloWorld = (req: Request, res: Response) =>
    handler.helloWorld(req, res)
