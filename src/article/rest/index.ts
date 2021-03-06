import { Request, Response } from 'express'
import * as mongoose from 'mongoose'
import { inspect } from 'util'

import { getBaseUri, log, logger } from '../../shared'
import { MIME_CONFIG } from '../../shared/config/mime'
import { SERVER_CONFIG } from '../../shared/config/server'
import { Article } from '../model/article'
import { ArticleService } from '../service/article.service'
import { EanExistsError, ValidationError } from '../service/exceptions'

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
        const { host, port } = SERVER_CONFIG
        res.json([
            // tslint:disable-next-line:max-line-length
            { rel: 'list all articles', method: 'GET', href: `https://${host}:${port}/articles`},
            { rel: 'GraphQL', method: 'POST', href: `https://${host}:${port}/graphql`},
        ])
    }

    @log
    async findById(req: Request, res: Response) {
        const versionHeader = req.header('If-None-Match')
        const id: string = req.params.id
        logger.debug(`ArticleRequestHandler.findById id = ${id}`)

        let article: mongoose.Document | null
        try {
            article = await this.articleService.findById(id)
        } catch (err) {
            logger.error(
                `ArticleRequestHandler.findById Error: ${inspect(err)}`,
            )
            res.sendStatus(500)
            return
        }

        if (article === null) {
            logger.debug('ArticleRequestHandler.findById status = 404')
            res.sendStatus(404)
            return
        }

        logger.debug(
            `ArticleRequestHandler.findById (): article = ${JSON.stringify(
                article,
            )}`,
        )
        const versionDb = article.__v
        if (versionHeader === `${versionDb}`) {
            res.sendStatus(304)
            return
        }
        logger.debug(`ArticleRequestHandler.findById VersionDb = ${versionDb}`)
        res.header('ETag', `"${versionDb}"`)

        const baseUri = getBaseUri(req)
        const payload = this.toJsonPayload(article)
        // HATEOAS: Atom Links
        payload._links = {
            self: { href: `${baseUri}/${id}` },
            list: { href: `${baseUri}` },
            // add: { href: `${baseUri}` },
            // update: { href: `${baseUri}/${id}` },
            // remove: { href: `${baseUri}/${id}` },
        }
        res.json(payload)
    }

    @log
    async find(req: Request, res: Response) {
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
            `ArticleRequestHandler.find: article = ${JSON.stringify(articles)}`,
        )
        if (articles.length === 0) {
            logger.debug('status = 404')
            res.sendStatus(404)
            return
        }

        const baseUri = getBaseUri(req)

        const payload = []
        for await (const article of articles) {
            const articleResource = this.toJsonPayload(article)
            // HATEOAS: Atom Links je Artikel
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

    @log
    async delete(req: Request, res: Response) {
        const id: string = req.params.id
        logger.debug(`ArticleRequestHandler.delete id = ${id}`)

        try {
            await this.articleService.remove(id)
        } catch (err) {
            // Inspect muss wieder dazu
            logger.error(`ArticleRequestHandler.delete Error: ${err}`)
            res.sendStatus(500)
            return
        }

        res.sendStatus(204)
    }

    toString() {
        return 'ArticlehRequestHandler'
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
export const findById = (req: Request, res: Response) =>
    handler.findById(req, res)
export const find = (req: Request, res: Response) => handler.find(req, res)
export const create = (req: Request, res: Response) => handler.create(req, res)
export const deleteFn = (req: Request, res: Response) =>
    handler.delete(req, res)
