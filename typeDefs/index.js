const { gql } = require('apollo-server')

module.exports = gql`
    type Comment {
        id: ID!,
        createdAt: String!,
        updatedAt: String!,
        body: String!,
        userId: ID!,
        senderId: ID!,
        receiverId: ID!,
        photoId: ID!
        Sender: User!
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

    type Photo {
        id: ID!
        userId: ID!
        url: String!
        description: String
    }

    type Query {
        allUsers: [User]!
        findUser(userId: ID!): User

        findFriends(userId: ID!): [User]!

        allCommunities: [Community]!

        findScraps(receiverId: ID!): [Comment]!
        findTestimonials(receiverId: ID!): [Comment]!
        findUpdates(userId: ID!): [Comment]!
        findPhotos(userId: ID!): [Photo]!
    }

    type Mutation {
        sendFriendRequest(requesterId: ID!, requesteeId: ID!): [FriendRequest]!
        respondFriendRequest(requesterId: ID!, requesteeId: ID!, accept: Boolean!): User
        unfriend(userId: ID!, friendId: ID!): User

        sendScrap(body: String!, senderId: ID!, userId: ID!): Comment
        deleteScrap(userId: ID!, scrapId: ID!): Comment

        joinCommunity(userId: ID!, communityId: ID!): Community
        leaveCommunity(userId: ID!, communityId: ID!): Community
    }
`