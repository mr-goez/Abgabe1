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

        if (Object.keys(query).length === 0) {
            return tmpQuery.sort('manufacturer')
        }

        return Article.find(query)
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

    @log
    async remove(id: string) {
        const articlePromise = Article.findByIdAndRemove(id)
        // entspricht: findOneAndRemove({_id: id})

        articlePromise.then(article =>
            logger.debug(`Geloescht: ${JSON.stringify(article)}`),
        )

        // Weitere Methoden von mongoose, um zu loeschen:
        //    Article.findOneAndRemove(bedingung)
        //    Article.remove(bedingung)
    }

    toString() {
        return 'ArticleService'
    }
}
