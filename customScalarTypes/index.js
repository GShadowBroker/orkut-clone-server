const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

const isGender = (value) => {
    const genderList = ['masculino', 'feminino']
    if (!genderList.find(i => i === value)) {
        return null
    }
    return value
}

const GenderType = new GraphQLScalarType({
    name: 'Gender',
    description: 'Gender custom scalar type',
    serialize: (value) => {
        return value.toString().toLowerCase()
    },
    parseValue: (value) => {
        return value
    },
    parseLiteral: (ast) => {
        if (ast.kind === Kind.STRING) {
            return isGender(ast)
        }
        return null
    }
})

module.exports = {
    GenderType
}