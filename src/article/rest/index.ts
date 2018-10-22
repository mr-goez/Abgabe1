import { Request, Response } from 'express'

import { log, logger } from '../../shared'

import { MIME_CONFIG } from '../../shared/config/mime'

class ArticelRequestHandler {
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

    @log
    create(req: Request, res: Response) {
        const contentType = req.header(MIME_CONFIG.contentType)
        if (
            contentType === undefined ||
            contentType.toLowerCase() !== MIME_CONFIG.json
        ) {
            logger.debug('ArtikelRequestHandler.create status = 406')
            res.sendStatus(406)
            return
        }

        const artikel = new Artikel(req.body)
        logger.debug(
            `ArtikelRequestHandler.create post body: ${JSON.stringify(artikel)}`,
        )

        let artikelSaved: mongoose.Document
        try {
            buchSaved = await this.buchService.create(buch)
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(400).send(JSON.parse(err.message))
                return
            }
            if (err instanceof TitelExistsError) {
                res.status(400).send(err.message)
                return
            }

            logger.error(`Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        const location = `${getBaseUri(req)}/${buchSaved._id}`
        logger.debug(`BuchRequestHandler.create: location = ${location}`)
        res.location(location)
        res.sendStatus(201)
    }
}
const handler = new ArtikelRequestHandler()

// hier exportierte Functions:
export const helloWorld = (req: Request, res: Response) =>
    handler.helloWorld(req, res)
