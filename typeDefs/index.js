const { gql } = require('apollo-server')

module.exports = gql`
    type Post {
        id: ID!,
        message: String!,
        authorId: ID!,
        created: String!
    }

    type User {
        id: ID!,
        name: String!,
        profile_picture: String,
        born: String,
        country: String,
        city: String,
        about: String,
        created: String,
        edited: String,
        photos: [String]!,
        friends: [ID]!, ### Will return User
        friend_requests: [ID]!, ### Will return User
        communities: [ID]!, ### Will return User
        scraps: [Post]!,
        videos: [String]!,
        testimonials: [Post]!,
        updates: [Post]!
    }

    type Community {
        id: ID!,
        title: String!,
        members: [ID]!,
        posts: [Post]!, ### Forum
        description: String,
        moderators: [User]!,
        owner: User!
    }

    type Query {
        allUsers: [User]!
    }
`