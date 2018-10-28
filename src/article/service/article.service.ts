import { Document } from 'mongoose'
import * as uuid from 'uuid/v4'

import { log, logger } from '../../shared'
import { Article, validateArticle } from '../model/article'

import { EanExistsError, ValidationError } from './exceptions'

export class ArticleService {
    @log
    async findById(id: string) {
        return Article.findById(id)
    }

    @log
    async find(query?: any) {
        const tmpQuery = Article.find()

        // alle Buecher asynchron suchen u. aufsteigend nach titel sortieren
        // nach _id sortieren: Timestamp des INSERTs (Basis: Sek)
        // https://docs.mongodb.org/manual/reference/object-id
        if (Object.keys(query).length === 0) {
            return tmpQuery.sort('ean')
        }

        return Article.find(tmpQuery)
        // Article.findOne(query), falls das Suchkriterium eindeutig ist
        // bei findOne(query) wird null zurueckgeliefert, falls nichts gefunden
    }
    @log
    async create(article: Document) {
        const ean: number = (article as any).ean

        const err = validateArticle(article)
        if (err !== undefined) {
            const message = JSON.stringify(err)
            logger.debug(`Validation Message: ${message}`)
            // Promise<void> als Rueckgabewert
            return Promise.reject(new ValidationError(message))
        }

        // @ts-ignore
        const session = await Article.startSession()
        session.startTransaction()

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        const tmp = await Article.findOne({ ean })
        if (tmp !== null) {
            // Promise<void> als Rueckgabewert
            return Promise.reject(
                new EanExistsError(
                    `Die europäische eindeutige Artikelnummer "${ean}" existiert bereits.`,
                ),
            )
        }

        article._id = uuid()
        const articleSaved = await article.save()

        await session.commitTransaction()
        session.endSession()

        logger.debug(
            `Der Artikel ist abgespeichert: ${JSON.stringify(articleSaved)}`,
        )

        return articleSaved
    }
}
