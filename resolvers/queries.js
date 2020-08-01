const {
    User, 
    Community, 
    Category, 
    Scrap, 
    sequelize, 
    Photo, 
    PhotoComment, 
    Testimonial, 
    Update, 
    Topic, 
    TopicComment 
} = require('../models')
const { Sequelize, Op } = require('sequelize')

const { UserInputError, ApolloError } = require('apollo-server')

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
                        as: 'Posts',
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
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            let user
            if (userId === currentUser.id.toString()) {
                user = currentUser
            } else {
                user = await User.findByPk(userId)
            }

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', {
                invalidArgs: args
            })

            const updates = await user.getPosts({
                limit,
                offset
            });

            return updates
        },

        getFeed: async (root, args, context) => {
            const { limit, offset } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const feed = await Update.findAndCountAll({
                where: {
                    [Op.or]: [
                        ...currentUser.Friends.map(friend => ({ userId: friend.id })),
                        { userId: currentUser.id }
                    ]
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

        getFriendSuggestions: async (root, args, context) => {
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const requesteesRaw = await currentUser.getRequestees({
                attributes: ["id"]
            })
            const requestees = requesteesRaw.map(r => r.id.toString())

            if (currentUser.Friends.length === 0) {
                const suggestions = await User.findAll({
                    attributes: ["id", "name", "profile_picture"],
                    where: {
                        id: {
                            [Op.not]: [
                                ...requestees,
                                currentUser.id
                            ]
                        }
                    },
                    order: [
                        [Sequelize.fn('RANDOM')]
                    ],
                    limit: 4
                })
                return suggestions
            }

            const friends = await sequelize.models.friends.findAll({
                where: {
                    userId: {
                        [Op.or]: currentUser.Friends.map(f => f.id)
                    }
                }
            })

            const friendsIds = friends.map(f => f.userId.toString())
            const friendsOfFriendsIds = friends
                .map(f => f.FriendId.toString())
                .filter(f => (f.toString() !== currentUser.id.toString()) && !friendsIds.includes(f.toString()))

            if (friendsOfFriendsIds.length === 0) {
                const suggestions = await User.findAll({
                    attributes: ["id", "name", "profile_picture"],
                    where: {
                        id: {
                            [Op.not]: [
                                ...requestees,
                                ...currentUser.Friends.map(friend => friend.id),
                                currentUser.id
                            ]
                        }
                    },
                    order: [
                        [Sequelize.fn('RANDOM')]
                    ],
                    limit: 4
                })
                return suggestions
            }

            let nonDuplicates = []
            let duplicates = []

            for (let id of friendsOfFriendsIds) {
                if (nonDuplicates.includes(id)
                    && !duplicates.includes(id)
                    && !currentUser.Friends.map(f => f.id.toString()).includes(id)
                    && !requestees.includes(id)
                ) {
                    duplicates.push(id)
                } else {
                    nonDuplicates.push(id)
                }
            }

            if (duplicates.length === 0) {
                const suggestions = await User.findAll({
                    attributes: ["id", "name", "profile_picture"],
                    where: {
                        id: {
                            [Op.not]: [
                                ...requestees,
                                ...currentUser.Friends.map(friend => friend.id),
                                currentUser.id
                            ]
                        }
                    },
                    order: [
                        [Sequelize.fn('RANDOM')]
                    ],
                    limit: 4
                })
                return suggestions
            }

            const suggestions = await User.findAll({
                attributes: ["id", "name", "profile_picture"],
                where: {
                    id: {
                        [Op.or]: duplicates
                    }
                },
                order: [
                    [Sequelize.fn('RANDOM')]
                ],
                limit: 4
            })

            return suggestions
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
                    // {
                    //     model: User,
                    //     as: 'Members',
                    //     attributes: ["id", "name", "profile_picture"]
                    // },
                    // {
                    //     model: Topic,
                    //     as: "Topics",
                    //     include: [
                    //         {
                    //             model: User,
                    //             as: "TopicCreator",
                    //             attributes: ["id", "name", "profile_picture"]
                    //         }
                    //     ]
                    // }
                ]
            })

            if (!community) throw new ApolloError('Comunidade não encontrada ou inválida', {
                invalidArgs: args
            })

            return community
        },

        findTopic: async (root, args) => {
            let { topicId, limit, offset } = args

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
                        limit,
                        offset
                    }
                ]
            })

            return topic
        },

        findCommunityTopics: async (root, args) => {
            const { communityId, limit, offset } = args

            const topics = await Topic.findAndCountAll({
                where: {
                    communityId
                },
                include: [
                    {
                        model: TopicComment,
                        as: 'Comments',
                        attributes: ["id", "createdAt", "body"],
                        order: [
                            ["createdAt", "DESC"]
                        ]
                    },
                    {
                        model: User,
                        as: 'TopicCreator',
                        attributes: ["id", "name", "profile_picture"]
                    }
                ],
                order: [
                    ["createdAt", "DESC"]
                ],
                limit,
                offset
            })

            console.log('topics'.red, JSON.stringify(topics))
            return topics
        },

        findTopicComments: async (root, args) => {
            const { topicId, limit, offset, order } = args

            const comments = await TopicComment.findAndCountAll({
                where: {
                    topicId
                },
                include: {
                    model: User,
                    as: "Sender",
                    attributes: ["id", "name", "profile_picture"]
                },
                order: [
                    ["createdAt", order]
                ],
                limit,
                offset
            })

            console.log('topiccomments'.red, JSON.stringify(comments))
            return comments
        },

        findCommunityMembers: async (root, args) => {
            const { communityId, limit, offset } = args

            const community = await Community.findByPk(communityId, {
                attributes: ["id"]
            })
            if (!community) throw new UserInputError('Comunidade não encontrada ou inválida')

            const members = await community.getMembers({
                attributes: ["id", "name", "profile_picture"],
                order: [
                    [Sequelize.fn('RANDOM')]
                ],
                limit,
                offset
            })

            const memberCount = await sequelize.models.user_communities.count({
                where: {
                    communityId
                }
            })

            return {
                count: memberCount,
                rows: members
            }
        },
    }
    return queries
}