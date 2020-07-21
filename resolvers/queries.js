const { User, Community, Scrap, sequelize, Photo, PhotoComment, Testimonial, Update } = require('../models')
const { UserInputError } = require('apollo-server')

module.exports = () => {
    const queries = {
        allUsers: async (root, args) => {
            const { limit, offset } = args

            // Remove includes later
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: User,
                        as: "Friends",
                        attributes: ["id", "name"]
                    },
                    {
                        model: User,
                        as: "Requesters",
                        attributes: ["id", "name"]
                    },
                    {
                        model: Community,
                        as: "Subscriptions",
                        attributes: ["id", "title", "picture"]
                    },
                    
                ],
                limit: limit || 10,
                offset: offset || 0
            })
            return users
        },

        findUser: async (root, args, context) => {
            const { userId } = args
            if (!userId) return context.currentUser

            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Scrap,
                        as: 'Scraps',
                        attributes: ['id'],
                        separate: true
                    },
                    {
                        model: User,
                        as: 'Friends',
                        attributes: ['id', 'name', 'profile_picture']
                    },
                    {
                        model: Community,
                        as: 'Subscriptions',
                        attributes: ['id', 'title', 'picture']
                    },
                    {
                        model: Photo,
                        as: 'Photos',
                        attributes: ['id', 'url', 'description'],
                        separate: true
                    },
                    {
                        model: User,
                        as: 'Requesters',
                        attributes: ['id', 'name', 'profile_picture']
                    },
                    {
                        model: Testimonial,
                        as: 'Testimonials',
                        attributes: ['id'],
                        separate: true
                    },
                    {
                        model: Update,
                        as: 'Updates',
                        attributes: ['id', 'body'],
                        separate: true
                    },
                ]
            })
            
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: userId
            })

            return user
        },

        findFriends: async (root, args) => {
            const { userId, limit, offset } = args

            const user = await User.findByPk(userId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            const friends = await user.getFriends({limit, offset});

            return friends
        },

        findScraps: async (root, args) => {
            const { receiverId, limit, offset } = args

            const user = await User.findByPk(receiverId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            // const scraps = await user.getScraps({
            //     include: {
            //         model: User, as: 'Sender'
            //     },
            //     limit,
            //     offset,
            //     order: [
            //         ["createdAt", "DESC"]
            //     ]
            // });

            const scraps = await Scrap.findAndCountAll({
                where: {
                    receiverId
                },
                include: {
                    model: User,
                    as: 'Sender',
                    attributes: ["id", "name", "profile_picture"]
                },
                limit,
                offset,
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            return scraps
        },

        findTestimonials: async (root, args) => {
            const { receiverId, limit, offset } = args

            const user = await User.findByPk(receiverId)
            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })
            const testimonials = await user.getTestimonials({
                include: {
                    model: User,
                    as: 'Sender',
                    attributes: ["id", "name", "profile_picture"]
                },
                limit,
                offset
            });
            return testimonials
        },

        findUpdates: async (root, args) => {
            const { userId, limit, offset } = args

            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const updates = await user.getUpdates({
                limit,
                offset
            });

            return updates
        },

        findPhotos: async (root, args) => {
            const { userId, limit, offset } = args

            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const photos = await Photo.findAndCountAll({
                where: { userId },
                limit, 
                offset,
                order: [
                    ["createdAt", "DESC"]
                ],
                include: [
                    {
                        model: PhotoComment,
                        as: 'Comments'
                    }
                ]
            })

            console.log('photos'.yellow, JSON.stringify(photos))

            return photos
        },

        findPhoto: async (root, args) => {
            let { photoId, userId } = args

            const photo = await Photo.findOne({
                where: {
                    id: photoId,
                    userId
                }
            })

            if (!photo) throw new UserInputError('Foto não encontrada ou inválida', {
                invalidArgs: args
            })

            console.log('photo'.yellow, JSON.stringify(photo))
            return photo
        },

        findPhotoComments: async (root, args) => {
            let { photoId, limit, offset } = args

            const comments = await PhotoComment.findAndCountAll({
                where: {
                    photoId
                },
                limit,
                offset,
                include: [
                    {
                        model: User,
                        as: "Sender",
                        attributes: ["id", "name", "profile_picture"]
                    }
                ]
            })

            console.log('photocomments'.yellow, JSON.stringify(comments))
            return comments
        },

        allCommunities: async (root, args) => {
            let { limit, offset } = args

            const communities = await Community.findAll({
                include: [
                    {
                        model: User,
                        as: 'Members',
                        attributes: ["id"]
                    }
                ],
                limit,
                offset
            })
            return communities
        }
    }
    return queries
}