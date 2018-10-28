import { log, logger } from '../../shared'

export class AuthService {

    private readonly usersService = new UsersService()
    
    @log
    async login(req: Request) {
        logger.silly(`body: ${JSON.stringify(req.body)}`)
        const username: string = req.body.username
        logger.silly(`username: ${username}`)
        if (username === undefined) {
            return undefined
        }
        const user = this.usersService.findByUsername(username)
        logger.silly(`user: ${JSON.stringify(user)}`)

        const password: string = req.body.password
        logger.silly(`password: ${password}`)
        const passwordCheck = await this.checkPassword(user, password)
        if (!passwordCheck) {
            return undefined
        }

        const header: Header = { alg }
        // akt. Datum in Sek. seit 1.1.1970 UTC
        const nowSeconds = this.nowSeconds()
        const payload = {
            // issued at (in Sek. seit 1.1.1970 UTC)
            iat: nowSeconds,
            // issuer
            iss: JWT_CONFIG.issuer,
            // subject (ID aus LDAP oder Active Directory, NICHT username o.ae.)
            sub: user._id,
            // JWT ID (hier: als generierte UUIDv4)
            jti: uuidv4(),
            // expiration time
            exp: nowSeconds + JWT_CONFIG.expiration,
            // nbf = not before
        }
        logger.silly(`payload: ${JSON.stringify(payload)}`)

        let secretOrPrivateKey: string | Buffer | undefined
        if (this.isHMAC()) {
            secretOrPrivateKey = JWT_CONFIG.secret
        } else if (this.isRSA()) {
            secretOrPrivateKey = AuthService.RSA_PRIVATE_KEY
        } else if (this.isECDSA()) {
            secretOrPrivateKey = AuthService.ECDSA_PRIVATE_KEY
        }
        const signOptions: SignOptions = {
            header,
            payload,
            secret: secretOrPrivateKey as string | Buffer,
            encoding: JWT_CONFIG.encoding,
        }
        const token = sign(signOptions)

        return {
            token,
            token_type: JWT_CONFIG.bearer,
            expires_in: JWT_CONFIG.expiration,
            roles: user.roles,
        } as LoginResult
    }

}