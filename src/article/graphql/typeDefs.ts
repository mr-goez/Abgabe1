export const typeDefs = `

    type Article {
        _id: ID!
        ean: Int!
        description: String
        price: Float
        availability: Boolean!
        manufacturer: String
    }

    type Query {
        articles(manufacturer: String): [Article]
        article(id: ID!): Article
    }

    type Mutation {
        createArticle(ean: Int!, description: String, price: Float, availability: Boolean!
            manufacturer: String): Article
        deleteArticle(id: ID!): Boolean
     }
`
