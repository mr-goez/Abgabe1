import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'

import { json } from 'body-parser'

import { create, find, helloWorld } from './article/rest'
import { validateContentType } from './shared/request-handler'

export const PATHS = {
    artikel: '/artikel',
}

class App {
    readonly app = express()

    constructor() {
        this.routes()
    }

    private routes() {
        this.articleRoutes()
        const router = Router()
        router.route('/').get(helloWorld)
        // Nachverfolgen...
        // extrem wichtig sonst bringt der router nichts!!! Schaut in sein Beispiel wie er das routing aufteilt
        this.app.use(router)

    }

    private articleRoutes() {
        const router = Router()
        // get
        router.route('/').get(find)
        this.app.use(PATHS.artikel, router)

        // post
        router
            .route('/')
            .get(find)
            .post(validateContentType, json(), create)

        this.app.use(PATHS.artikel, router)
        }
    }

export const app = new App().app
