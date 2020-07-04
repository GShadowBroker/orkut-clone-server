const { ApolloServer } = require('apollo-server')
const colors = require('colors')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen()
    .then(({ url }) => {
        console.log(`Server ready at ${url}`.blue)
    })