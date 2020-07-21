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
        body: String!,
        userId: ID!,
        senderId: ID!,
        receiverId: ID!,
        photoId: ID!
        Sender: User!
    }

    type Scrap {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: String!,
        senderId: ID!,
        receiverId: ID!,
        Sender: User!
    }

    type PhotoComment {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: String!,
        receiverId: ID!,
        photoId: ID!,
        Sender: User!
    }

    type Testimonial {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: String!,
        senderId: ID!,
        receiverId: ID!,
        Sender: User!
    }

    type Update {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: String!,
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

        Friends: [User]!,
        Requestees: [User]!,
        Requesters: [User]!,
        Subscriptions: [Community]!,
        Scraps: [Scrap]!,
        Testimonials: [Testimonial]!,
        Updates: [Update]!,
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
        
        Comments: [PhotoComment]
    }

    type PhotoCount {
        count: Int,
        rows: [Photo]!
    }
    type ScrapCount {
        count: Int,
        rows: [Scrap]!
    }
    type PhotoCommentCount {
        count: Int,
        rows: [PhotoComment]!
    }

    type Query {
        allUsers(, limit: Int, offset: Int): [User]!
        findUser(userId: ID): User

        findFriends(userId: ID!, limit: Int, offset: Int): [User]!

        allCommunities(limit: Int, offset: Int): [Community]!

        findScraps(receiverId: ID!, limit: Int, offset: Int): ScrapCount!

        findTestimonials(receiverId: ID!, limit: Int, offset: Int): [Testimonial]!
        findUpdates(userId: ID!, limit: Int, offset: Int): [Update]!
        findPhotos(userId: ID!, limit: Int, offset: Int): PhotoCount!

        findPhoto(photoId: ID!, userId: ID!): Photo
        findPhotoComments(photoId: ID!, limit: Int, offset: Int): PhotoCommentCount!
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

        sendScrap(body: String!, senderId: ID!, userId: ID!): Scrap
        deleteScrap(userId: ID!, scrapId: ID!): Scrap

        sendTestimonial(body: String!, senderId: ID!, userId: ID!): Testimonial
        deleteTestimonial(userId: ID!, testimonialId: ID!): Testimonial

        joinCommunity(userId: ID!, communityId: ID!): Community
        leaveCommunity(userId: ID!, communityId: ID!): Community
    }
`