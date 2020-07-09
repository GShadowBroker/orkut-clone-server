const { ApolloServer } = require('apollo-server')
const colors = require('colors')
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { sequelize, User } = require('./models')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen()
    .then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`.cyan)
    })