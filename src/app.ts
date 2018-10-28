import { json } from 'body-parser'
import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import * as morgan from 'morgan'
import * as responseTime from 'response-time'

import { create, deleteFn, find, findById } from './article/rest'
import { logRequestHeader, responseTimeFn, validateUUID } from './shared'

import { graphqlSchema } from './article/graphql/graphqlSchema'
import { validateContentType } from './shared/request-handler'

export const PATHS = {
    articles: '/articles',
    graphql: '/graphql',
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
        this.articleRoutes()
        this.articleGraphQLRoutes()
    }

    private articleRoutes() {
        const router = Router()
        router
            .route('/')
            .get(find)
            .post(validateContentType, json(), create)

        const idParam = 'id'
        router
            .param(idParam, validateUUID)
            .get(`/:${idParam}`, findById)
            .delete(`/:${idParam}`, deleteFn)

        this.app.use(PATHS.articles, router)
    }

    private articleGraphQLRoutes() {
        const middleware = graphqlHTTP({
            schema: graphqlSchema,
            graphiql: true,
        })
        this.app.use(PATHS.graphql, middleware)
    }
}

export const app = new App().app
