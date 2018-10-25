import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'

import { json } from 'body-parser'

import { create, find, helloWorld } from './article/rest'
import { validateContentType } from './shared/request-handler'

export const PATHS = {
    articles: '/articles',
}

class App {
    readonly app = express()

    constructor() {
        this.routes()
    }

    private routes() {
        this.articleRoutes()

        // index
        const router = Router()
        router.route('/').get(helloWorld)
        this.app.use(router)

    }

    private articleRoutes() {
        const router = Router()
        // get
        router.route('/').get(find)
        this.app.use(PATHS.articles, router)

        // post
        router
            .route('/')
            .get(find)
            .post(validateContentType, json(), create)

        this.app.use(PATHS.articles, router)
        }
    }

export const app = new App().app
