import { app } from './app'
import { logger, SERVER_CONFIG } from './shared'

const { host, port } = SERVER_CONFIG

const startServer = () => {
    app.listen(port, host, () =>
        logger.info(
            `http://${host}:${port} ist gestartet: Herunterfahren durch <Strg> C`,
        ),
    )
}
startServer()
