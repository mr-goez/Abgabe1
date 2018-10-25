import { Document, model, Schema } from 'mongoose'
// @ts-ignore
import * as beautifyUnique from 'mongoose-beautiful-unique-validation'
// @ts-ignore
import * as errorTransform from 'mongoose-validation-error-transform'

import { isUUID } from 'validator'

import { autoIndex } from '../../shared'

// Hier ist das Schema und die Klasse Article zu implementieren

export interface ArticleDocument extends Document {
    erzeugt: number
    aktualisiert: number
}
export const schema = new Schema({
    _id: { type: String },
    ean: { type: Number, required: true },
    description: { type: String },
    price: Number,
    availability: { type: Boolean, required: true },
    manufacturer: { type: String },
})

schema.set('toJSON', { getters: true, virtuals: false })
// TODO:
schema.set('autoIndex', autoIndex)

schema.plugin(beautifyUnique)
schema.plugin(errorTransform)

// tslint:disable-next-line:variable-name
export const Article = model<ArticleDocument>('Article', schema)

// const isPresent = (obj: string | undefined) => obj !== undefined && obj !== null
const isEmpty = (obj: string | undefined) =>
    obj === undefined || obj === null || obj === ''

export const validateArticle = (article: any) => {
    const err: any = {}
    const { ean, availability } = article

    if (!article.isNew && !isUUID(article._id)) {
        err.id = 'Der Artikel hat eine ungueltige ID.'
    }
    if (isEmpty(ean)) {
        err.ean = 'Der Artikel muss eine EAN haben.'
        //  } else if (!ean.matchNumber(/^\d{6}/)) {
        //      err.ean =
        //          'Die EAN darf nur aus Ziffern bestehen und muss 6-stellig sein'
    }
    if (isEmpty(availability)) {
        err.ean = 'Die Verfügbarkeit des Artikels muss angegeben sein.'
    }

    return Object.keys(err).length === 0 ? undefined : err
}
