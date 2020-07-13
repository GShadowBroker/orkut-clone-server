const { User, Community, Scrap, sequelize } = require('../models')
const { UserInputError } = require('apollo-server')

module.exports = () => {
    const queries = {
        allUsers: async () => {

            // Remove includes later
            const users = await User.findAll({ attributes: { exclude: ['password'] }, include: { all: true } })
            console.log('users'.yellow, JSON.stringify(users))
            return users
        },

        findUser: async (root, args) => {
            const { userId } = args
            const user = await User.findByPk(userId, { include: { all: true } })
            
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: userId
            })

            console.log('user'.yellow, JSON.stringify(user))
            return user
        },

        findFriends: async (root, args) => {
            const { userId } = args

            const user = await User.findByPk(userId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            const friends = await user.getFriends();

            console.log('friends'.yellow, JSON.stringify(friends))
            return friends
        },

        findScraps: async (root, args) => {
            const { receiverId } = args

            const user = await User.findByPk(receiverId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            const scraps = await user.getScraps({
                include: {
                    model: User, as: 'Sender'
                }
            });

            console.log('scraps'.yellow, JSON.stringify(scraps))
            return scraps
        },

        findTestimonials: async (root, args) => {
            const { receiverId } = args

            const user = await User.findByPk(receiverId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            const testimonials = await user.getTestimonials({
                include: {
                    model: User, as: 'Sender'
                }
            });

            console.log('testimonials'.yellow, JSON.stringify(testimonials))
            return testimonials
        },

        findUpdates: async (root, args) => {
            const { userId } = args

            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const updates = await user.getUpdates({
                include: { all: true }
            });

            console.log('updates'.yellow, JSON.stringify(updates))
            return updates
        },

        findPhotos: async (root, args) => {
            const { userId } = args

            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const photos = await user.getPhotos({
                include: { all: true }
            });

            console.log('photos'.yellow, JSON.stringify(photos))
            return photos
        },

        allCommunities: async () => {
            const communities = await Community.findAll({ include: { all: true } })
            console.log('communities'.yellow, JSON.stringify(communities))
            return communities
        }
    }
    return queries
}