import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import * as RateLimit from 'express-rate-limit'
import * as helmet from 'helmet'
import * as morgan from 'morgan'
import * as responseTime from 'response-time'

import { json, urlencoded } from 'body-parser'
import * as compression from 'compression'

import { create, deleteFn, find, findById, helloWorld } from './article/rest'
import { isAdminMitarbeiter, login, validateJwt } from './auth/rest'
import { helmetHandlers } from './helmetHandlers'
// tslint:disable-next-line:max-line-length
import {
    DELAY_UNTIL_MAX,
    logRequestHeader,
    MAX_REQUESTS_PER_WINDOW,
    responseTimeFn,
    validateUUID,
    WINDOW_SIZE,
} from './shared'

import { graphqlSchema } from './article/graphql/graphqlSchema'
import { validateContentType } from './shared/request-handler'

export const PATHS = {
    articles: '/articles',
    login: '/login',
    graphql: '/graphql',
}

const limiter = new RateLimit({
    // z.B. 15 Minuten als Zeitfenster (Ms = Millisekunden)
    windowMs: WINDOW_SIZE,
    // z.B. max 100 requests/IP in einem Zeitfenster
    max: MAX_REQUESTS_PER_WINDOW,
    // z.B. keine Verzoegerung bis das max. Limit erreicht ist
    delayMs: DELAY_UNTIL_MAX,
})

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
        } else {
            this.app.use(helmet.hidePoweredBy())
        }

        this.app.use(
            // Spread Operator ab ES 2015
            ...helmetHandlers,

            // falls CORS fuer die Webanwendung notwendig ist:
            // corsHandler,

            // GZIP-Komprimierung implizit unterstuetzt durch Chrome, FF, ...
            //   Accept-Encoding: gzip
            // Alternative: z.B. nginx als Proxy-Server und dort komprimieren
            compression(),
            limiter,
        )
    }

    private routes() {
        this.articleRoutes()
        this.loginRoutes()

        // index
        const router = Router()
        router.route('/').get(helloWorld)

        this.app.use(router)
        this.articleGraphQLRoutes()
    }

    private articleRoutes() {
        // post
        const router = Router()
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
        // delete
        const idParam = 'id'
        router
            .param(idParam, validateUUID)
            .get(`/:${idParam}`, findById)
            .delete(`/:${idParam}`, deleteFn)

        this.app.use(PATHS.articles, router)
    }

    // login
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

    // graphQL
    private articleGraphQLRoutes() {
        const middleware = graphqlHTTP({
            schema: graphqlSchema,
            graphiql: true,
        })
        this.app.use(PATHS.graphql, middleware)
    }
}

export const app = new App().app
