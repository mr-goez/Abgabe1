import { NextFunction, Request, Response } from 'express'
import * as validator from 'validator'

import { log } from './log'
import { logger } from './logger'

class SharedRequestHandler {
    @log
    logRequestHeader(req: Request, _: Response, next: NextFunction) {
        logger.debug(
            `Request: headers=${JSON.stringify(req.headers, undefined, 2)}`,
        )
        logger.debug(
            `Request: protocol=${JSON.stringify(req.protocol, undefined, 2)}`,
        )
        logger.debug(
            `Request: hostname=${JSON.stringify(req.hostname, undefined, 2)}`,
        )
        if (req.body !== undefined) {
            logger.debug(
                `Request: body=${JSON.stringify(req.body, undefined, 2)}`,
            )
        }
        Object.keys(req).forEach(key => {
            if (req.hasOwnProperty(key)) {
                logger.log('silly', `Request-Key: ${key}`)
            }
        })

        // Request-Verarbeitung fortsetzen
        next()
    }

    @log
    validateUUID(_: Request, res: Response, next: NextFunction, id: any) {
        if (validator.isUUID(id)) {
            next()
            return
        }

        logger.debug('status = 400')
        res.status(400).send(`${id} ist keine gueltige Buch-ID`)
    }

    @log
    validateContentType(req: Request, res: Response, next: NextFunction) {
        const contentType = req.header('Content-Type')
        if (contentType === undefined || validator.isMimeType(contentType)) {
            next()
            return
        }

        logger.debug('status = 400')
        res.status(400).send(`${contentType} ist kein gueltiger MIME-Typ`)
    }

    @log
    notFound(_: Request, res: Response) {
        res.sendStatus(404)
    }

    @log
    internalError(err: any, _: Request, res: Response) {
        // tslint:disable-next-line:no-null-keyword
        logger.error(JSON.stringify(err, null, 2))
        res.sendStatus(500)
    }

    @log
    notYetImplemented(_: Request, res: Response) {
        logger.error('NOT YET IMPLEMENTED')
        res.sendStatus(501)
    }

    toString() {
        return 'SharedRequestHandler'
    }
}
const handler = new SharedRequestHandler()

// -----------------------------------------------------------------------
// E x p o r t i e r t e   F u n c t i o n s
// -----------------------------------------------------------------------
export const logRequestHeader = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.logRequestHeader(req, res, next)

export const validateContentType = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.validateContentType(req, res, next)

export const validateUUID = (
    req: Request,
    res: Response,
    next: NextFunction,
    id: any,
) => handler.validateUUID(req, res, next, id)

export const notFound = (req: Request, res: Response) =>
    handler.notFound(req, res)

export const internalError = (err: any, req: Request, res: Response) =>
    handler.internalError(err, req, res)

export const notYetImplemented = (req: Request, res: Response) =>
    handler.notYetImplemented(req, res)

// https://github.com/expressjs/express/issues/2259
// https://github.com/expressjs/express/pull/2431
// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators
export const wrap = (fn: any) => (...args: Array<any>) =>
    fn(...args).catch(args[2])
