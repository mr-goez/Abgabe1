// import { Document } from 'mongoose'
// import * as uuid from 'uuid/v4'

import { log } from '../../shared'
import { mockDB } from '../../shared/config'
import { Article } from '../model/article'

import { ArticleServiceMock } from './mock/article.service.mock'

export class ArticleService {
    private readonly mock: ArticleServiceMock | undefined

    constructor() {
        if (mockDB()) {
            this.mock = new ArticleServiceMock()
        }
    }

    @log
    async findById(id: string) {
        if (this.mock !== undefined) {
            return this.mock.findById(id)
        }
        return Article.findById(id)
    }

    @log
    async find(query?: any) {
        if (this.mock !== undefined) {
            return this.mock.find(query)
        }
        const tmpQuery = Article.find()

        // alle Artikel asynchron suchen u. aufsteigend nach Hersteller sortieren
        // nach _id sortieren: Timestamp des INSERTs (Basis: Sek)
        // https://docs.mongodb.org/manual/reference/object-id
        if (Object.keys(query).length === 0) {
             return tmpQuery.sort('manufacturer')
        }

        // const { manufacturer, javascript, typescript, ...dbQuery } = query

        // // Artikel zur Query (= JSON-Objekt durch Express) asynchron suchen
        // if (manufacturer !== undefined) {
        //     // Hersteller in der Query: Teilstring des Herstellers,
        //     // d.h. "LIKE" als regulaerer Ausdruck
        //     // 'i': keine Unterscheidung zw. Gross- u. Kleinschreibung
        //     dbQuery.manufacturer = new RegExp(manufacturer, 'i')
        // }
        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // leeres Array, falls nichts gefunden wird
        return Article.find(tmpQuery)
    }

    toString() {
        return 'ArticleService'
    }
}
