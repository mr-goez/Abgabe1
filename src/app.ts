import { Router } from 'express'
// tslint:disable-next-line:no-duplicate-imports            // Probiert es aus diese Zeile zu löschen!
import * as express from 'express'

import { helloWorld } from './article/rest'

class App {
    readonly app = express()

    constructor() {
        this.routes()
    }

    private routes() {
        const router = Router()
        router
            .route('/')
            .get(helloWorld) // Nachverfolgen...
        this.app.use(router)
        // extrem wichtig sonst bringt der router nichts!!! Schaut in sein Beispiel wie er das routing aufteilt
    }
}
export const app = new App().app
