import { Request, Response } from 'express'
import * as mongoose from 'mongoose'
import { inspect } from 'util'

import { log, logger } from '../../shared'

import { MIME_CONFIG } from '../../shared/config/mime'

import { Article } from '../model/article'

import { ArticleService } from '../service/article.service'
import { EanExistsError, ValidationError } from '../service/exceptions'

import { getBaseUri } from '../../shared/base-uri'

class ArticleRequestHandler {
    private readonly articleService = new ArticleService()

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
    async find(req: Request, res: Response) {
        // z.B. https://.../buch?titel=Alpha
        const query = req.query
        logger.debug(
            `ArticleRequestHandler.find queryParams = ${JSON.stringify(query)}`,
        )

        let articles: Array<mongoose.Document> = []
        try {
            articles = await this.articleService.find(query)
        } catch (err) {
            logger.error(`ArticleRequestHandler.find Error: ${inspect(err)}`)
            res.sendStatus(500)
        }

        logger.debug(
            `ArticleRequestHandler.find: buecher = ${JSON.stringify(articles)}`,
        )
        if (articles.length === 0) {
            // Alternative: https://www.npmjs.com/package/http-errors
            // Damit wird aber auch der Stacktrace zum Client
            // uebertragen, weil das resultierende Fehlerobjekt
            // von Error abgeleitet ist.
            logger.debug('status = 404')
            res.sendStatus(404)
            return
        }

        const baseUri = getBaseUri(req)

        // asynchrone for-of Schleife statt synchrones buecher.map()
        const payload = []
        for await (const article of articles) {
            const articleResource = this.toJsonPayload(article)
            // HATEOAS: Atom Links je Buch
            articleResource.links = [
                { rel: 'self' },
                { href: `${baseUri}/${article._id}` },
            ]
            payload.push(articleResource)
        }

        res.json(payload)
    }

    @log
    async create(req: Request, res: Response) {
        const contentType = req.header(MIME_CONFIG.contentType)
        if (
            contentType === undefined ||
            contentType.toLowerCase() !== MIME_CONFIG.json
        ) {
            logger.debug('ArticleRequestHandler.create status = 406')
            res.sendStatus(406)
            return
        }

        const article = new Article(req.body)
        logger.debug(
            `ArticleRequestHandler.create post body: ${JSON.stringify(
                article,
            )}`,
        )

        let articleSaved: mongoose.Document
        try {
            articleSaved = await this.articleService.create(article)
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(400).send(JSON.parse(err.message))
                return
            }
            if (err instanceof EanExistsError) {
                res.status(400).send(err.message)
                return
            }

            logger.error(`Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        const location = `${getBaseUri(req)}/${articleSaved._id}`
        logger.debug(`ArticleRequestHandler.create: location = ${location}`)
        res.location(location)
        res.sendStatus(201)
    }

    private toJsonPayload(article: mongoose.Document): any {
        const {
            ean,
            description,
            price,
            availability,
            manufacturer,
        } = article as any
        return {
            ean,
            description,
            price,
            availability,
            manufacturer,
        }
    }
}
const handler = new ArticleRequestHandler()

// hier exportierte Functions:
export const helloWorld = (req: Request, res: Response) =>
    handler.helloWorld(req, res)
export const find = (req: Request, res: Response) => handler.find(req, res)
export const create = (req: Request, res: Response) => handler.create(req, res)
