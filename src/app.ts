import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'

import { json, urlencoded } from 'body-parser'

import { create, find, helloWorld } from './article/rest'
import { isAdminMitarbeiter, login, validateJwt } from './auth/rest'
import { validateContentType } from './shared/request-handler'

export const PATHS = {
    articles: '/articles',
    login: '/login',
}

class App {
    readonly app = express()

    constructor() {
        this.routes()
    }

    private routes() {
        this.articleRoutes()
        this.loginRoutes()

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
            .post(
                validateContentType,
                validateJwt,
                isAdminMitarbeiter,
                json(),
                create,
                )

        this.app.use(PATHS.articles, router)
    }

    private loginRoutes() {
        const router = Router()
        router.route('/').post(
            urlencoded({
                extended: false,
                type: 'application/x-www-form-urlencoded',
            }),
            login,
        )
        this.app.use(PATHS.login, router)
    }
}

export const app = new App().app
