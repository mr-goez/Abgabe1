import { IResolverObject } from 'graphql-tools/dist/Interfaces'

import { Article } from '../model/article'
import { ArticleService } from '../service/article.service'

const articleService = new ArticleService()

const findArticles = (manufacturer: string) => {
    if (manufacturer === undefined) {
        // Kein Titel: alle Artikel suchen
        return articleService.find({})
    }
    return articleService.find({ manufacturer })
}

// Queries passend zu "type Query" in typeDefs.ts
const query: IResolverObject = {
    // Artikel suchen, ggf. mit Hersteller als Suchkriterium
    articles: (_: unknown, { manufacturer }: any) => findArticles(manufacturer),
    // Einen Artikel mit einer bestimmten ID suchen
    article: (_: unknown, { _id }: any) => articleService.findById(_id),
}

interface IArticle {
    _id?: string
    ean: number
    description: string
    price: number
    availability: boolean
    manufacturer: string
}

const createArticle = (article: IArticle) => {
    const articleDocument = new Article(article)
    return articleService.create(articleDocument)
}

const deleteArticle = async (id: string) => {
    await articleService.remove(id)
}

const mutation = {
    createArticle: (_: unknown, article: IArticle) => createArticle(article),
    deleteArticle: (_: unknown, { id }: any) => deleteArticle(id),
} as IResolverObject

export const resolvers = {
    Query: query,
    Mutation: mutation,
}
