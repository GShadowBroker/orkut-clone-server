const { User, Community, Category, Scrap, sequelize, Photo, PhotoComment, Testimonial, Update, Topic, TopicComment } = require('../models')
const { UserInputError, ApolloError } = require('apollo-server')
const { Op } = require('sequelize')

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
            const { currentUser } = context
            if (!userId || (currentUser && userId === currentUser.id.toString())) return currentUser

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

        findScraps: async (root, args, context) => {
            const { receiverId, limit, offset } = args

            let user
            if (receiverId === context.currentUser.id.toString()) {
                user = context.currentUser
            } else {
                user = await User.findByPk(receiverId)
            }

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

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

        findTestimonials: async (root, args, context) => {
            const { receiverId, limit, offset } = args

            let user
            if (receiverId === context.currentUser.id.toString()) {
                user = context.currentUser
            } else {
                user = await User.findByPk(receiverId)
            }
            
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

        findUpdates: async (root, args, context) => {
            const { userId, limit, offset } = args

            let user
            if (receiverId === context.currentUser.id.toString()) {
                user = context.currentUser
            } else {
                user = await User.findByPk(receiverId)
            }

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const updates = await user.getUpdates({
                limit,
                offset
            });

            return updates
        },

        getFeed: async (root, args, context) => {
            const { limit, offset } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const feed = await Update.findAll({
                where: {
                    [Op.or]: currentUser.Friends.map(friend => ({ userId: friend.id }))
                },
                include: {
                    model: User,
                    as: 'User',
                    attributes: ["id", "name", "profile_picture"]
                },
                limit,
                offset,
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            return feed
        },

        findPhotos: async (root, args, context) => {
            const { userId, limit, offset } = args

            let user
            if (userId === context.currentUser.id.toString()) {
                user = context.currentUser
            } else {
                user = await User.findByPk(userId)
            }

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

            return comments
        },

        allCommunities: async (root, args) => {
            let { limit, offset } = args

            const communities = await Community.findAll({ // REMOVE MOST ASSOCIATIONS AFTER TESTING! They should reside in findCommunity
                include: [
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ["id", "name"]
                    },
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ["id", "title"]
                    },
                    {
                        model: Topic,
                        as: "Topics",
                        include: [
                            {
                                model: User,
                                as: "TopicCreator",
                                attributes: ["id", "name", "profile_picture"]
                            },
                            {
                                model: TopicComment,
                                as: 'Comments',
                                include: {
                                    model: User,
                                    as: 'Sender',
                                    attributes: ["id", "name", "profile_picture"]
                                }
                            }
                        ]
                    },
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
        },

        findCommunity: async (root, args) => {
            let { communityId } = args

            const community = await Community.findByPk(communityId, {
                include: [
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ["id", "name"]
                    },
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ["id", "title"]
                    },
                    {
                        model: User,
                        as: 'Members',
                        attributes: ["id", "name", "profile_picture"]
                    },
                    {
                        model: Topic,
                        as: "Topics",
                        include: [
                            {
                                model: User,
                                as: "TopicCreator",
                                attributes: ["id", "name", "profile_picture"]
                            }
                        ]
                    }
                ]
            })

            if (!community) throw new ApolloError('Comunidade não encontrada ou inválida', {
                invalidArgs: args
            })

            return community
        },

        findTopic: async (root, args) => {
            let { topicId, commentLimit, commentOffset } = args

            const topic = await Topic.findByPk(topicId, {
                include: [
                    {
                        model: User,
                        as: "TopicCreator",
                        attributes: ["id", "name", "profile_picture"]
                    },
                    {
                        model: TopicComment,
                        as: 'Comments',
                        include: {
                            model: User,
                            as: 'Sender',
                            attributes: ["id", "name", "profile_picture"]
                        },
                        limit: commentLimit,
                        offset: commentOffset
                    }
                ]
            })

            return topic
        }
    }
    return queries
}