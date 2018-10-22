import { readFileSync } from 'fs'
import { resolve } from 'path'

export const SERVER_CONFIG = {
    host: 'localhost',
    port: 8443,
    key: readFileSync(resolve(__dirname, 'key.pem')),
    cert: readFileSync(resolve(__dirname, 'certificate.cer')),
}
