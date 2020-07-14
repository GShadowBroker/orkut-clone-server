const setMutations = require('./mutations')
const setQueries = require('./queries')
const { DateResolver, EmailAddressResolver, URLResolver, DateTimeResolver } = require('graphql-scalars')

module.exports = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    EmailAddress: EmailAddressResolver,
    URL: URLResolver,
    
    Query: setQueries(),
    Mutation: setMutations()
}
