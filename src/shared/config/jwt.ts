export const alg = 'RS256'

export const JWT_CONFIG = {
    encoding: 'utf8',
    // ggf. als DN (= distinguished name) gemaess LDAP
    issuer: 'https://hska.de/shop/JuergenZimmermann',
    secret: 'p',
    expiration: 24 * 60 * 60, // 1 Tag in Sek.
    bearer: 'Bearer',
}
