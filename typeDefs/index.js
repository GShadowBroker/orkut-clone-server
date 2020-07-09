const { gql } = require('apollo-server')

module.exports = gql`
    type Comment {
        id: ID!,
        createdAt: String!,
        updatedAt: String!,
        body: String!,
        authorId: ID!
    }

    type User {
        id: ID!,
        createdAt: String!,
        updatedAt: String!,
        name: String!,
        email: String,
        profile_picture: String,
        born: String,
        country: String,
        city: String,
        about: String,
        photos: [String]!,
        Friends: [User]!,
        Requestees: [User]!,
        Requesters: [User]!,
        Subscriptions: [Community]!,
        scraps: [Comment]!,
        videos: [String]!,
        testimonials: [Comment]!,
        updates: [Comment]!
    }

    type FriendRequest {
        createdAt: String!,
        updatedAt: String!,
        requesterId: ID!,
        requesteeId: ID!
    }

    type Post {
        id: ID!
        createdAt: String!,
        updatedAt: String!,
        comments: [Comment]!,
        author: User!
    }

    type Community {
        id: ID!,
        createdAt: String!,
        updatedAt: String!,
        title: String!,
        picture: String,
        description: String,
        category: String,
        language: String,
        Members: [User]!

        #forum: [Post]!, # Forum
        #moderators: [User]!,
        #owner: User!
    }

    type Query {
        allUsers: [User]!
        findUser(userId: ID!): User

        allCommunities: [Community]!
    }

    type Mutation {
        sendFriendRequest(requesterId: ID!, requesteeId: ID!): [FriendRequest]!
        respondFriendRequest(requesterId: ID!, requesteeId: ID!, accept: Boolean!): User
        unfriend(userId: ID!, friendId: ID!): User

        joinCommunity(userId: ID!, communityId: ID!): Community
        leaveCommunity(userId: ID!, communityId: ID!): Community
    }
`