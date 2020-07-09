const { sequelize, User, Community } = require('../models')
const { UserInputError } = require('apollo-server')

module.exports = () => {
    const mutation = {
        sendFriendRequest: async (root, args) => {
            const { requesterId, requesteeId } = args

            if (requesterId === requesteeId) throw new UserInputError('Impossível adicionar si mesmo como amigo', {
                invalidArgs: args
            })

            const requester = await User.findByPk(requesterId, { include: { all: true } })
            const requestee = await User.findByPk(requesteeId, { include: { all: true } })

            if (!requester) throw new UserInputError('Solicitante não encontrado', { invalidArgs: args.requesterId })
            if (!requestee) throw new UserInputError('Solicitado não encontrado', { invalidArgs: args.requesteeId })

            if (requestee.Friends.find(r => r.id.toString() === requester.id.toString())) throw new UserInputError('Usuário já está na lista de amigos', {
                invalidArgs: args
            })

            const result = await requester.addRequestee(requestee.id)
            return result
        },

        respondFriendRequest: async (root, args) => {
            const { requesterId, requesteeId, accept } = args

            if (requesterId === requesteeId) throw new UserInputError('Impossível adicionar si mesmo como amigo', {
                invalidArgs: args
            })

            const requester = await User.findByPk(requesterId, { include: { all: true } })
            const requestee = await User.findByPk(requesteeId, { include: { all: true } })

            if (!requester) throw new UserInputError('Solicitante não encontrado', { invalidArgs: args.requesterId })
            if (!requestee) throw new UserInputError('Solicitado não encontrado', { invalidArgs: args.requesteeId })
            /***
                requestee: {
                    "id":3,
                    "name":"Eve",
                    "email":"eve@gmail.com",
                    "profile_picture":"https://i.imgur.com/BoHH3Pb.png",
                    "born":null,
                    "city":"Hokkaido",
                    "country":"Japan",
                    "gender":null,
                    "about":null,
                    "videos":[],
                    "createdAt":"2020-07-06T19:26:18.944Z",
                    "updatedAt":"2020-07-06T19:26:18.944Z",
                    "photos":[],
                    "Subscriptions":[],
                    "Friends":[],
                    "Requestees":[],
                    "Requesters":[
                        {"id":1,"name":"Gledyson","email":"gledysonferreira@gmail.com","profile_picture":"https://i.imgur.com/BoHH3Pb.png","born":null,"city":"Dourados","country":"Brazil","gender":null,"about":null,"videos":[],"createdAt":"2020-07-06T19:26:18.920Z","updatedAt":"2020-07-06T19:26:18.920Z","friendRequests":{"createdAt":"2020-07-06T19:26:26.827Z","updatedAt":"2020-07-06T19:26:26.827Z","requesterId":1,"requesteeId":3}}
                    ]
                }
            ***/

            if (!requestee.Requesters.find(r => r.id.toString() === requester.id.toString())) throw new UserInputError('Solicitação de amizade não encontrada', {
                invalidArgs: args
            })

            if (!accept) { // If request is rejected
                await sequelize.models.friendRequests.destroy({
                    where: {
                        requesterId: requester.id,
                        requesteeId: requestee.id
                    }
                })

                return requestee
            }

            await requestee.addFriends(requester.id)
            await requester.addFriends(requestee.id)
            await sequelize.models.friendRequests.destroy({
                where: {
                    requesterId: requester.id,
                    requesteeId: requestee.id
                }
            })

            return requestee
        },

        unfriend: async (root, args) => {
            const { userId, friendId } = args

            if (userId === friendId) throw new UserInputError('IDs solicitante e solicitado são os mesmos', {
                invalidArgs: args
            })

            const user = await User.findByPk(userId, { include: { all: true } })
            const friend = await User.findByPk(friendId, { include: { all: true } })

            if (!user) throw new UserInputError('Usuário não encontrado', { invalidArgs: args.userId })
            if (!friend) throw new UserInputError('Amigo não encontrado', { invalidArgs: args.friend })

            if (!user.Friends.find(r => r.id.toString() === friend.id.toString())
                || !friend.Friends.find(r => r.id.toString() === user.id.toString())) {

                throw new UserInputError('Amizade não encontrada', { invalidArgs: args })
            }
                
            await sequelize.models.friends.destroy({
                where: {
                    userId: user.id,
                    FriendId: friend.id
                }
            })
            await sequelize.models.friends.destroy({
                where: {
                    userId: friend.id,
                    FriendId: user.id
                }
            })

            return null
        },

        joinCommunity: async (root, args) => {
            const { userId, communityId } = args

            const user = await User.findByPk(userId, { include: { all: true } })
            const community = await Community.findByPk(communityId, { include: { all: true } })

            if (!user) throw new UserInputError('Usuário não encontrado', { invalidArgs: args.userId })
            if (!community) throw new UserInputError('Comunidade não encontrada', { invalidArgs: args.communityId })

            if (community.Members.find(m => m.id.toString() === user.id.toString())) {
                throw new UserInputError('Usuário já é membro desta comunidade', { invalidArgs: args })
            }

            await community.addMembers(user.id)

            return community
        },

        leaveCommunity: async (root, args) => {
            const { userId, communityId } = args

            const user = await User.findByPk(userId, { include: { all: true } })
            const community = await Community.findByPk(communityId, { include: { all: true } })

            if (!user) throw new UserInputError('Usuário não encontrado', { invalidArgs: args.userId })
            if (!community) throw new UserInputError('Comunidade não encontrada', { invalidArgs: args.communityId })
            if (!community.Members.find(m => m.id.toString() === user.id.toString())) {
                throw new UserInputError('Usuário não é membro desta comunidade', { invalidArgs: args })
            }

            await sequelize.models.user_communities.destroy({
                where: {
                    userId: user.id,
                    communityId: communityId
                }
            })
            return null
        }
    }
    return mutation
}