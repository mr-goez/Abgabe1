import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'
import * as morgan from 'morgan'
import * as responseTime from 'response-time'

import { find, findById } from './article/rest'
import {
    internalError,
    logRequestHeader,
    notFound,
    responseTimeFn,
    validateUUID,
} from './shared'

export const PATHS = {
    articles: '/articles',
}

class App {
    readonly app = express()

    constructor() {
        this.config()
        this.routes()
    }

    private config() {
        if (process.env.NODE_ENV === 'development') {
            // Logging der eingehenden Requests in der Console
            this.app.use(
                morgan('dev'),
                // Protokollierung der Response Time
                responseTime(responseTimeFn),
                // Protokollierung des eingehenden Request-Headers
                logRequestHeader,
            )
        }
    }
    private routes() {
        this.articlesRoutes()

        this.app.get('*', notFound)
        this.app.use(internalError)
    }

    private articlesRoutes() {
        const router = Router()
        router.route('/').get(find)
        const idParam = 'id'
        router.param(idParam, validateUUID).get(`/:${idParam}`, findById)
        this.app.use(PATHS.articles, router)
    }
}
export const app = new App().app
