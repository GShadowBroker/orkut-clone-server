const {
    sequelize,
    User,
    Community,
    Scrap, 
    Testimonial, 
    Topic, 
    TopicComment,
    Category,
    Update
 } = require('../models')
const { UserInputError, ApolloError } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sanitizeHtml = require('sanitize-html')
const cloudinary = require('../utils/cloudinary')

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
            if (!token) throw new ApolloError('Houve um erro ao criar o token da sessão')

            return {
                id: user.id,
                value: token
            }
        },

        sendFriendRequest: async (root, args, context) => {
            const { requesteeId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            if (currentUser.id.toString() === requesteeId.toString()) throw new UserInputError('Impossível adicionar si mesmo como amigo', {
                invalidArgs: args
            })

            const requester = currentUser
            const requestee = await User.findByPk(requesteeId, {
                include: {
                    model: User,
                    as: "Friends",
                    attributes: ["id"]
                }
            })

            if (!requestee) throw new UserInputError('Solicitado não encontrado ou inválido', { invalidArgs: args.requesteeId })

            if (requestee.Friends.find(r => r.id.toString() === requester.id.toString())) throw new UserInputError('Usuário já está na lista de amigos', {
                invalidArgs: args
            })

            const result = await requester.addRequestee(requestee.id)
            return result
        },

        respondFriendRequest: async (root, args, context) => {
            const { requesterId, accept } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            if (requesterId.toString() === currentUser.id.toString()) throw new UserInputError('Impossível adicionar si mesmo como amigo', {
                invalidArgs: args
            })

            const requester = await User.findByPk(requesterId, {
                include: {
                    model: User,
                    as: "Requesters",
                    attributes: ["id"]
                }
            })
            const requestee = currentUser

            if (!requester) throw new UserInputError('Solicitante não encontrado ou inválido', { invalidArgs: args.requesterId })
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

            await Update.create({
                body: `<p>adicionou ${requester.name} como amigo</p>`,
                action: "addFriend",
                object: JSON.stringify({
                    id: requester.id,
                    name: requester.name,
                    url: `/perfil/${requester.id}`,
                    picture: requester.profile_picture
                }),
                userId: requestee.id
            })
            await Update.create({
                body: `<p>adicionou ${requestee.name} como amigo</p>`,
                action: "addFriend",
                object: JSON.stringify({
                    id: requestee.id,
                    name: requestee.name,
                    url: `/perfil/${requestee.id}`,
                    picture: requestee.profile_picture
                }),
                userId: requester.id
            })

            return requestee
        },

        unfriend: async (root, args, context) => {
            const { friendId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            if (currentUser.id.toString() === friendId.toString()) throw new UserInputError('IDs solicitante e solicitado são os mesmos', {
                invalidArgs: args
            })

            const user = currentUser
            const friend = await User.findByPk(friendId, {
                include: {
                    model: User,
                    as: "Friends",
                    attributes: ["id"]
                }
            })

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

        updateProfilePicture: async (root, args, context) => {
            const { newPhoto } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            try {
                const uploadResponse = await cloudinary.uploader.upload(newPhoto, {
                    upload_preset: 'qe2wfvcw'
                })
                console.log('uploadResponse'.red, uploadResponse)

                await User.update({
                    profile_picture: uploadResponse.secure_url
                }, {
                    where: {
                        id: currentUser.id
                    }
                })

                await Update.create({
                    body: "<p>atualizou a foto de perfil</p>",
                    action: "addPhoto",
                    userId: currentUser.id,
                    picture: uploadResponse.secure_url
                })

                return currentUser

            } catch(error) {
                console.error(error)
                return null
            }
        },

        sendScrap: async (root, args, context) => {
            const { userId, body } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const sender = currentUser
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })

            const safeBody = sanitizeHtml(body, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
            })

            const scrap = await Scrap.create({
                body: safeBody,
                senderId: sender.id,
                receiverId: user.id,
            })
            if (!scrap) throw new ApolloError('Falha do servidor ao criar novo scrap')

            return scrap
        },

        deleteScrap: async (root, args, context) => {
            const { userId, scrapId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const scrap = await Scrap.findByPk(scrapId)
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!scrap) throw new UserInputError('Scrap não encontrado ou inválido', { invalidArgs: args.scrapId })

            await Scrap.destroy({ where: { id: scrap.id } })

            return null
        },

        sendTestimonial: async (root, args, context) => {
            const { userId, body } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const safeBody = sanitizeHtml(body, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
            })
            const testimonial = await Testimonial.create({
                body: safeBody,
                senderId: currentUser.id,
                receiverId: userId,
            })
            if (!testimonial) throw new ApolloError('Falha do servidor ao criar novo depoimento')

            return testimonial
        },

        deleteTestimonial: async (root, args, context) => {
            const { userId, testimonialId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const testimonial = await Testimonial.findByPk(testimonialId)
            const user = await User.findByPk(userId)

            if (!user) throw new UserInputError('Usuário não encontrado ou inválido', { invalidArgs: args.userId })
            if (!testimonial) throw new UserInputError('Depoimento não encontrado ou inválido', { invalidArgs: args.testimonialId })

            await Testimonial.destroy({ where: { id: testimonial.id } })

            return null
        },

        sendUpdate: async (root, args, context) => {
            const { body } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            // Body Validation

            const safeBody = sanitizeHtml(body)
            const post = await Update.create({
                body: safeBody,
                action: "addPost",
                userId: currentUser.id
            })

            return post
        },

        hideUpdate: async (root, args, context) => {
            const { updateId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const update = await Update.findByPk(updateId)
            if (!update) throw new UserInputError('Atualização não encontrada ou inválida', {
                invalidArgs: updateId
            })

            const updatedUpdate = await Update.update({ visible: false }, {
                where: {
                    id: update.id
                }
            })

            return updatedUpdate
        },

        deleteUpdate: async (root, args, context) => {
            const { updateId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const update = await Update.findByPk(updateId)
            if (!update) throw new UserInputError('Atualização não encontrada ou inválida', {
                invalidArgs: updateId
            })

            await Update.destroy({ where: { id: update.id } })
            return null
        },

        createCommunity: async (root, args, context) => {
            const {
                title,
                picture,
                description,
                categoryId,
                type,
                language,
            } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            // Validation

            const category = await Category.findByPk(categoryId)
            if (!category) throw new UserInputError('Categoria inválida', { invalidArgs: categoryId })

            const community = await Community.create({
                title,
                picture,
                description,
                categoryId: category.id,
                creatorId: currentUser.id,
                language,
                type
            })

            await Update.create({
                body: "<p>criou uma comunidade</p>",
                action: "joinCommunity",
                object: JSON.stringify({
                    id: community.id,
                    name: community.title,
                    url: `/comunidades/${community.id}`,
                    picture: community.picture
                }),
                userId: currentUser.id
            })

            return community
        },

        joinCommunity: async (root, args, context) => {
            const { communityId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const user = currentUser
            const community = await Community.findByPk(communityId, {
                include: {
                    model: User,
                    as: 'Members',
                    attributes: ["id"]
                }
            })

            if (!community) throw new UserInputError('Comunidade não encontrada ou inválida', { invalidArgs: args.communityId })

            if (community.Members.find(m => m.id.toString() === user.id.toString())) {
                throw new UserInputError('Usuário já é membro desta comunidade', { invalidArgs: args })
            }

            await community.addMembers(user.id)

            await Update.create({
                body: "<p>entrou em uma nova comunidade</p>",
                action: "joinCommunity",
                object: JSON.stringify({
                    id: community.id,
                    name: community.title,
                    url: `/comunidades/${community.id}`,
                    picture: community.picture
                }),
                userId: user.id
            })

            return community
        },

        leaveCommunity: async (root, args, context) => {
            const { communityId } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const user = currentUser
            const community = await Community.findByPk(communityId, {
                include: {
                    model: User,
                    as: 'Members',
                    attributes: ["id"]
                }
            })

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
        },

        createTopic: async (root, args, context) => {
            const { communityId, title, body } = args
            const { currentUser } = context
            if (!currentUser) throw new UserInputError('Erro de autenticação')

            const community = await Community.findByPk(communityId)
            if (!community) throw new ApolloError('Comunidade não encontrada ou inválida', {
                invalidArgs: communityId
            })

            if (!currentUser.Subscriptions.find(c => c.id.toString() === community.id.toString())) {
                throw new UserInputError('Usuário não tem permissão para criar tópicos nesta comunidade')
            }

            //Body Validation

            const safeBody = sanitizeHtml(body)
            const topic = await Topic.create({
                title,
                body: safeBody,
                creatorId: currentUser.id,
                communityId: community.id
            })
            
            return topic
        },

        deleteTopic: async (root, args, context) => {
            const { topicId } = args
            const { currentUser } = context

            const topic = await Topic.findByPk(topicId, {
                include: {
                    model: Community,
                    as: 'Community',
                    attributes: ["creatorId"]
                }
            })
            console.log("deleting topic...".red, JSON.stringify(topic))

            if (!topic) throw new UserInputError('Tópico não encontrado', { invalidArgs: topicId })

            if (
                (currentUser.id.toString() !== topic.creatorId.toString())
                && currentUser.id.toString() !== topic.Community.creatorId.toString()
            ) {
                throw new UserInputError('Não tem permissão para excluir o tópico')
            }

            await Topic.destroy({ where: { id: topic.id } })

            return null
        },

        sendTopicComment: async (root, args, context) => {
            const { topicId, body } = args
            const { currentUser } = context

            //Body Validation

            const safeBody = sanitizeHtml(body)

            const topic = await Topic.findByPk(topicId)
            if (!topic) throw new ApolloError('Tópico não encontrado ou inválido', {
                invalidArgs: topicId
            })

            const topiccomment = await TopicComment.create({
                senderId: currentUser.id,
                receiverId: topic.creatorId,
                topicId: topic.id,
                body: safeBody
            })

            return topiccomment
        },

        deleteTopicComment: async (root, args, context) => {
            const { topicCommentId } = args
            const { currentUser } = context

            const comment = await TopicComment.findByPk(topicCommentId, {
                include: {
                    model: Topic,
                    as: 'Topic',
                    include: {
                        model: Community,
                        as: 'Community',
                        attributes: ["creatorId"]
                    }
                }
            })
            console.log("deleting TopicComment...".red, JSON.stringify(comment))

            if (!comment) throw new UserInputError('Comentário não encontrado', { invalidArgs: topicCommentId })

            if (
                (currentUser.id.toString() !== comment.senderId.toString())
                && currentUser.id.toString() !== comment.Topic.Community.creatorId.toString()
            ) {
                throw new UserInputError('Não tem permissão para excluir o comentário')
            }

            await TopicComment.destroy({ where: { id: comment.id } })

            return null
        }
    }
    return mutation
}