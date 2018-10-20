import { app } from './app'
import { connectDB, logger, SERVER_CONFIG } from './shared'

const { host, port } = SERVER_CONFIG

const startServer = async () => {
    await connectDB()
    app.listen(port, host, () =>
        logger.info(
            `http://${host}:${port} ist gestartet: Herunterfahren durch <Strg> C`,
        ),
    )
}
startServer()
