const { User, Community } = require('../models')
const { UserInputError } = require('apollo-server')

module.exports = () => {
    const queries = {
        allUsers: async () => {
            const users = await User.findAll({ attributes: { exclude: ['password'] }, include: { all: true } })
            console.log('users'.yellow, JSON.stringify(users))
            return users
        },

        findUser: async (root, args) => {
            const { userId } = args
            const user = await User.findByPk(userId, { include: { all: true } })
            
            if (!user) throw new UserInputError('Usuário não encontrado', {
                invalidArgs: userId
            })

            console.log('user', JSON.stringify(user))
            return user
        },

        allCommunities: async () => {
            const communities = await Community.findAll({ include: { all: true } })
            console.log('communities'.yellow, JSON.stringify(communities))
            return communities
        }
    }
    return queries
}