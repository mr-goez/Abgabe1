




class AuthRequestHandler {

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

}

const handler = new AuthRequestHandler()

// exportierte Funktionnen
export const login = (req: Request, res: Response) => handler.login(req, res)
