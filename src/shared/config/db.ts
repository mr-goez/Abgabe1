import * as mongoose from 'mongoose'
import { inspect } from 'util'

import { ArticleDocument } from '../../article/model/article'
import { logger } from '../logger'

const host = 'localhost'
const port = '27017'
const url = `mongodb://${host}:${port}`
const dbName = 'hska'
const user = 'admin'
const pass = 'p'
const authSource = 'admin'
const replicaSet = 'replicaSet'
const ssl = false

mongoose.pluralize(undefined)

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

export const connectDB: () => void = async () => {
    const { connection } = mongoose
    try {
        await mongoose.connect(
            url,
            {
                user,
                pass,
                authSource,
                dbName,
                replicaSet,
                ssl,
                useNewUrlParser: true,
            },
        )
    } catch (err) {
        logger.error(`${inspect(err)}`)
        logger.error(`FEHLER beim Aufbau der DB-Verbindung: ${err.message}\n`)
        process.exit(0)
    }
    logger.info(`DB-Verbindung zu ${connection.db.databaseName} ist aufgebaut`)

    connection.on('disconnecting', () =>
        logger.warn('DB-Verbindung wird geschlossen...'),
    )
    connection.on('disconnected', () =>
        logger.warn('DB-Verbindung ist geschlossen.'),
    )
    connection.on('error', () => logger.error('Fehlerhafte DB-Verbindung'))
}

export const autoIndex = true

export const optimistic = (schema: mongoose.Schema) => {
    schema.pre('findOneAndUpdate', function(next) {
        this.update({}, { $inc: { __v: 1 } }, next)

        next()
    })
}

export const audit = (schema: mongoose.Schema) => {
    schema.pre<ArticleDocument>('save', function(
        next: mongoose.HookNextFunction,
    ) {
        const now = Date.now()
        this.aktualisiert = now

        if (this.erzeugt === undefined) {
            this.erzeugt = now
        }
        next()
    })

    schema.pre('findOneAndUpdate', function(next: mongoose.HookNextFunction) {
        this.update({}, { aktualisiert: Date.now() }, next)
        next()
    })
}
