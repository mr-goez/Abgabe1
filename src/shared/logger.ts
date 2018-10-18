// angelehnt an das Beispielprojekt

import { createLogger, format, transports } from 'winston'

// Winston: seit 2010 bei GoDaddy (Registrierung von Domains)
// Log-Levels: error, warn, info, debug, verbose, silly, ...
// Medien (= Transports): Console, File, ...
// https://github.com/winstonjs/winston/blob/master/docs/transports.md
// Alternative: Bunyan, Pino

const { Console, File } = transports
const { combine, simple, timestamp } = format

const commonFormat = combine(
    timestamp(),
    // colorize(),
    // https://github.com/winstonjs/logform
    simple(),
)

const fileOptions = {
    filename: 'server.log',
    level: 'debug',
    // 250 KB
    maxsize: 250000,
    maxFiles: 3,
}

export const logger = createLogger({
    format: commonFormat,
    transports: [new Console(), new File(fileOptions)],
})

logger.info({ message: 'Logging durch Winston ist konfiguriert' })
