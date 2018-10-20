import { Request } from 'express'

import { SERVER_CONFIG } from './config'

export const getBaseUri = (req: Request) =>
    // tslint:disable-next-line:prefer-template
    `${req.protocol}://${req.hostname}:${SERVER_CONFIG.port}` + req.baseUrl
