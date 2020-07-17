const { gql } = require('apollo-server')

module.exports = gql`
    scalar Date
    scalar DateTime
    scalar EmailAddress
    scalar URL
    scalar JSON
    
    enum Gender {
        masculino,
        feminino
    }

    type Comment {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: JSON!,
        userId: ID!,
        senderId: ID!,
        receiverId: ID!,
        photoId: ID!
        Sender: User!
    }

    type User {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        name: String!,
        email: String,
        profile_picture: URL,
        gender: Gender,
        born: Date,
        country: String,
        city: String,
        about: String,
        videos: [String]!,
        updates: [Comment]!,

        Friends: [User]!,
        Requestees: [User]!,
        Requesters: [User]!,
        Subscriptions: [Community]!,
        Scraps: [Comment]!,
        Testimonials: [Comment]!,
        Updates: [Comment]!,
        Photos: [Photo]!
    }

    type FriendRequest {
        createdAt: DateTime!,
        updatedAt: DateTime!,
        requesterId: ID!,
        requesteeId: ID!
    }

    type Post {
        id: ID!
        createdAt: DateTime!,
        updatedAt: DateTime!,
        comments: [Comment]!,
        author: User!
    }

    type Community {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        title: String!,
        picture: URL,
        description: String,
        category: String,
        language: String,

        Members: [User]!

        #forum: [Post]!, # Forum
        #moderators: [User]!,
        #owner: User!
    }

    type Photo {
        id: ID!
        createdAt: DateTime!,
        updatedAt: DateTime!,
        userId: ID!
        url: URL!
        description: String
    }

    type Query {
        allUsers: [User]!
        findUser(userId: ID!): User

        findFriends(userId: ID!): [User]!

        allCommunities: [Community]!

        findScraps(receiverId: ID!, limit: Int, offset: Int): [Comment]!

        findTestimonials(receiverId: ID!): [Comment]!
        findUpdates(userId: ID!): [Comment]!
        findPhotos(userId: ID!): [Photo]!
    }

    type Token {
        id: ID!
        value: String!
    }

    type Mutation {
        register(
            email: EmailAddress!,
            password: String!,
            repeatPassword: String!,
            born: Date!,
            name: String!,
            gender: Gender!,
            city: String!,
            country: String!
        ): User
        login(
            email: EmailAddress!,
            password: String!
        ): Token

        sendFriendRequest(requesterId: ID!, requesteeId: ID!): [FriendRequest]!
        respondFriendRequest(requesterId: ID!, requesteeId: ID!, accept: Boolean!): User
        unfriend(userId: ID!, friendId: ID!): User

        sendScrap(body: JSON!, senderId: ID!, userId: ID!): Comment
        deleteScrap(userId: ID!, scrapId: ID!): Comment

        joinCommunity(userId: ID!, communityId: ID!): Community
        leaveCommunity(userId: ID!, communityId: ID!): Community
    }
`