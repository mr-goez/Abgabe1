import { NextFunction, Request, Response } from 'express'

import { log, logger } from '../../shared'
import {
    AuthorizationInvalidError,
    AuthService,
    TokenExpiredError,
    TokenInvalidError,
} from '../service'

class AuthRequestHandler {
    private readonly authService = new AuthService()

    @log
    async login(req: Request, res: Response) {
        const loginResult = await this.authService.login(req)
        if (loginResult === undefined) {
            logger.debug('401')
            res.sendStatus(401)
            return
        }
        res.json(loginResult)
    }

    @log
    validateJwt(req: Request, res: Response, next: NextFunction) {
        try {
            this.authService.validateJwt(req)
        } catch (err) {
            if (
                err instanceof TokenInvalidError ||
                err instanceof AuthorizationInvalidError
            ) {
                logger.debug(`401: ${err.name}, ${err.message}`)
                res.sendStatus(401)
                return
            }
            if (err instanceof TokenExpiredError) {
                logger.debug('401')
                res.header(
                    'WWW-Authenticate',
                    'Bearer realm="hska.de", error="invalid_token", error_description="The access token expired"',
                )
                res.status(401).send('The access token expired')
                return
            }
            res.sendStatus(500)
            return
        }

        next()
    }

    @log
    isLoggedIn(req: Request, res: Response, next: NextFunction) {
        if (!this.authService.isLoggedIn(req)) {
            logger.debug('401')
            res.sendStatus(401)
            return
        }

        // Verarbeitung fortsetzen
        next()
    }

    @log
    isAdmin(req: Request, res: Response, next: NextFunction) {
        if (!this.hasRolle(req, res, 'admin')) {
            return
        }

        // Verarbeitung fortsetzen
        next()
    }

    @log
    isMitarbeiter(req: Request, res: Response, next: NextFunction) {
        if (!this.hasRolle(req, res, 'mitarbeiter')) {
            return
        }

        // Verarbeitung fortsetzen
        next()
    }

    @log
    isAdminMitarbeiter(req: Request, res: Response, next: NextFunction) {
        if (!this.hasRolle(req, res, 'admin', 'mitarbeiter')) {
            return
        }

        // Verarbeitung fortsetzen
        next()
    }

    toString() {
        return 'AuthRequestHandler'
    }

    // Spread-Parameter
    @log
    private hasRolle(req: Request, res: Response, ...roles: Array<string>) {
        logger.debug(`Rollen = ${JSON.stringify(roles)}`)

        if (!this.authService.isLoggedIn(req)) {
            logger.debug('401')
            res.sendStatus(401)
            return false
        }

        if (!this.authService.hasAnyRole(req, roles)) {
            logger.debug('403')
            res.sendStatus(403)
            return false
        }

        return true
    }
}
const handler = new AuthRequestHandler()

// -----------------------------------------------------------------------
// E x p o r t i e r t e   F u n c t i o n s
// -----------------------------------------------------------------------
export const login = (req: Request, res: Response) => handler.login(req, res)

export const validateJwt = (req: Request, res: Response, next: NextFunction) =>
    handler.validateJwt(req, res, next)

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) =>
    handler.isLoggedIn(req, res, next)

export const isAdmin = (req: Request, res: Response, next: NextFunction) =>
    handler.isAdmin(req, res, next)

export const isMitarbeiter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.isMitarbeiter(req, res, next)

export const isAdminMitarbeiter = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.isAdminMitarbeiter(req, res, next)
