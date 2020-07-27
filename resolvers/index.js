const setMutations = require('./mutations')
const setQueries = require('./queries')
const { 
    DateResolver, 
    EmailAddressResolver, 
    URLResolver, 
    DateTimeResolver, 
    JSONResolver
} = require('graphql-scalars')

module.exports = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    EmailAddress: EmailAddressResolver,
    JSON: JSONResolver,
    
    Query: setQueries(),
    Mutation: setMutations()
}
