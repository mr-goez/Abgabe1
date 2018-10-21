import { createServer, Server, ServerOptions } from 'spdy'

import { app } from './app'
import { connectDB, logger, SERVER_CONFIG } from './shared'

const { host, port, key, cert } = SERVER_CONFIG
const options: ServerOptions = {
    key,
    cert,
    spdy: {
        protocols: ['h2'],
        plain: false,
    },
}
let server: Server

const startServer = async () => {
    await connectDB()
    server = createServer(options, app as any)

    server.listen(port, host, () =>
        logger.info(
            `https://${host}:${port} ist gestartet: Herunterfahren durch <Strg> C`,
        ),
    )
}
startServer()
