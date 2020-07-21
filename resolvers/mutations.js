const { sequelize, User, Community, Scrap, Testimonial } = require('../models')
const { UserInputError, ApolloError } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = () => {
    const mutation = {
        register: async (root, args) => {
            const { email, password, repeatPassword, born, name, gender, city, country } = args

            if (password !== repeatPassword) throw new UserInputError('Senhas não corresponde à repetição de senha', {
                invalidArgs: repeatPassword
            })

            // Validation

            // Is Email unique?
            const nonUniqueEmailUser = await User.findOne({
                where: {
                    email
                }
            })
            if (nonUniqueEmailUser) throw new UserInputError('Este e-mail já existe', {
                invalidArgs: email
            })
            
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const user = await User.create({
                name,
                password: hashedPassword,
                email,
                gender,
                born: new Date(born),
                city,
                country
            });
            if (!user) throw new ApolloError('Erro ao salvar usuário no banco de dados')

            return user
        },

        login: async (root, args) => {
            const { email, password } = args

            const user = await User.findOne({
                where: {
                    email
                }
            })
            if (!user) throw new UserInputError('Usuário ou senha inválidos', {
                invalidArgs: args
            })

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) throw new UserInputError('Usuário ou senha inválidos', {
                invalidArgs: args
            })

            const payload = {
                id: user.id,
                email: user.email
            }

            const token = await jwt.sign(payload, process.env.TOKEN_SECRET)
            if (!token) throw ApolloError('Houve um erro ao criar o token da sessão')

            return {
                id: user.id,
                value: token
            }
        },

        sendFriendRequest: async (root, args) => {
            const { requesterId, requesteeId } = args

            if (requesterId === requesteeId) throw new UserInputError('Impossível adicionar si mesmo como amigo', {
                invalidArgs: args
            })

            const requester = await User.findByPk(requesterId)
            const requestee = await User.findByPk(requesteeId, {
                include: {
                    model: User,
                    as: "Friends",
                    attributes: ["id"]
                }
            })

            if (!requester) throw new UserInputError('Solicitante não encontrado ou inválido', { invalidArgs: args.requesterId })
            if (!requestee) throw new UserInputError('Solicitado não encontrado ou inválido', { invalidArgs: args.requesteeId })

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

            const requester = await User.findByPk(requesterId, {
                include: {
                    model: User,
                    as: "Requesters",
                    attributes: ["id"]
                }
            })
            const requestee = await User.findByPk(requesteeId, {
                include: {
                    model: User,
                    as: "Requesters",
                    attributes: ["id"]
                }
            })

            if (!requester) throw new UserInputError('Solicitante não encontrado ou inválido', { invalidArgs: args.requesterId })
            if (!requestee) throw new UserInputError('Solicitado não encontrado ou inválido', { invalidArgs: args.requesteeId })
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

            const user = await User.findByPk(userId, {
                include: {
                    model: User,
                    as: "Friends",
                    attributes: ["id"]
                }
            })
            const friend = await User.findByPk(friendId, {
                include: {
                    model: User,
                    as: "Friends",
                    attributes: ["id"]
                }
            })

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!friend) throw new UserInputError('Amigo não encontrado ou inválido', { invalidArgs: args.friendId })

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

        sendScrap: async (root, args) => {
            const { senderId, userId, body } = args

            const sender = await User.findByPk(senderId)
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!sender) throw new UserInputError('Remetente não encontrado ou inválido', { invalidArgs: args.senderId })

            const scrap = await Scrap.create({
                body,
                senderId: sender.id,
                receiverId: user.id,
            })
            if (!scrap) throw new ApolloError('Falha do servidor ao criar novo scrap')

            return scrap
        },

        deleteScrap: async (root, args) => {
            const { userId, scrapId } = args

            const scrap = await Scrap.findByPk(scrapId)
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!scrap) throw new UserInputError('Scrap não encontrado ou inválido', { invalidArgs: args.scrapId })

            await Scrap.destroy({ where: { id: scrap.id } })

            return null
        },

        sendTestimonial: async (root, args) => {
            const { senderId, userId, body } = args

            const testimonial = await Testimonial.create({
                body,
                senderId: senderId,
                receiverId: userId,
            })
            if (!testimonial) throw new ApolloError('Falha do servidor ao criar novo depoimento')

            return testimonial
        },

        deleteTestimonial: async (root, args) => {
            const { userId, testimonialId } = args

            const testimonial = await Testimonial.findByPk(testimonialId)
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!testimonial) throw new UserInputError('Depoimento não encontrado ou inválido', { invalidArgs: args.testimonialId })

            await Testimonial.destroy({ where: { id: testimonial.id } })

            return null
        },

        joinCommunity: async (root, args) => {
            const { userId, communityId } = args

            const user = await User.findByPk(userId)
            const community = await Community.findByPk(communityId, {
                include: {
                    model: User,
                    as: 'Members',
                    attributes: ["id"]
                }
            })

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!community) throw new UserInputError('Comunidade não encontrada ou inválida', { invalidArgs: args.communityId })

            if (community.Members.find(m => m.id.toString() === user.id.toString())) {
                throw new UserInputError('Usuário já é membro desta comunidade', { invalidArgs: args })
            }

            await community.addMembers(user.id)

            return community
        },

        leaveCommunity: async (root, args) => {
            const { userId, communityId } = args

            const user = await User.findByPk(userId)
            const community = await Community.findByPk(communityId, {
                include: {
                    model: User,
                    as: 'Members',
                    attributes: ["id"]
                }
            })

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!community) throw new UserInputError('Comunidade não encontrada ou inválida', { invalidArgs: args.communityId })
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