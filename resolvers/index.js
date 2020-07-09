const setMutations = require('./mutations')
const setQueries = require('./queries')

module.exports = {
    Query: setQueries(),
    Mutation: setMutations()
}
