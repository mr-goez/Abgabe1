// import { Document } from 'mongoose'
// import * as uuid from 'uuid/v4'

// import { logger } from '../../../shared'
import { ArticleDocument } from '../../model/article'

import { article, articles } from './article'

export class ArticleServiceMock {
    async findById(id: string) {
        article._id = id
        return this.toBuchDocument(article)
    }

    async find(_?: any) {
        return articles.map(b => this.toBuchDocument(b))
    }

    private toBuchDocument = (buchJSON: any): ArticleDocument =>
        new Promise((resolve, _) => resolve(buchJSON)) as any
}
