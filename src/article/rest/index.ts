import { Request, Response } from 'express'
import * as mongoose from 'mongoose'
import { inspect } from 'util'

import { getBaseUri, log, logger } from '../../shared'
import { MIME_CONFIG } from '../../shared/config/mime'
import { Article } from '../model/article'
import { ArticleService } from '../service/article.service'
import { EanExistsError, ValidationError } from '../service/exceptions'

class ArticleRequestHandler {
    private readonly articleService = new ArticleService()

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
export const findById = (req: Request, res: Response) =>
    handler.findById(req, res)
export const find = (req: Request, res: Response) => handler.find(req, res)
export const create = (req: Request, res: Response) => handler.create(req, res)
