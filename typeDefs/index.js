const { gql } = require('apollo-server')

module.exports = gql`
    scalar Date
    scalar DateTime
    scalar EmailAddress
    scalar JSON
    
    enum Sex {
        masculino,
        feminino,
        notinformed
    }

    enum Order {
        ASC
        DESC
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

        action: String,
        object: JSON,
        picture: String,
        visible: Boolean,

        User: User!
    }

    type User {
        id: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        name: String!,
        email: String,
        profile_picture: String,
        sex: Sex,
        born: Date,
        age: Int,
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
        Posts: [Update]!,
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

    type Category {
        id: ID!,
        title: String!
    }

    type TopicComment {
        id: ID!,
        communityId: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        body: String!,
        senderId: ID,
        receiverId: ID,

        Receiver: User,
        Sender: User,
        Topic: Topic
    }

    type Topic {
        id: ID!,
        communityId: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        title: String!,
        body: String!,

        Community: Community,
        TopicCreator: User,
        Comments: [TopicComment]
    }

    type Community {
        id: ID!,
        creatorId: ID!,
        createdAt: DateTime!,
        updatedAt: DateTime!,
        title: String!,
        picture: String!,
        description: String!,
        language: String,
        country: String
        type: String!

        Creator: User,
        Category: Category,
        Members: [User]!
        Topics: [Topic]!
        Comments: [TopicComment]!

        #moderators: [User]!
    }

    type Photo {
        id: ID!
        createdAt: DateTime!,
        updatedAt: DateTime!,
        userId: ID!
        folderId: ID
        url: String!
        description: String
        
        Comments: [PhotoComment]
    }

    type PhotoFolder {
        id: ID!
        createdAt: DateTime!,
        updatedAt: DateTime!,
        title: String!
        userId: ID
        visible_to_all: Boolean!

        User: User
        Photos: [Photo]
    }

    type PhotoCount {
        count: Int!,
        rows: [Photo]!
    }
    type ScrapCount {
        count: Int!,
        rows: [Scrap]!
    }
    type PhotoCommentCount {
        count: Int!,
        rows: [PhotoComment]!
    }
    type UpdateCount {
        count: Int!,
        rows: [Update]!
    }
    type TopicCount {
        count: Int!,
        rows: [Topic]!
    }
    type UserCount {
        count: Int!,
        rows: [User]!
    }
    type TopicCommentCount {
        count: Int!
        rows: [TopicComment]!
    }
    type CommunityCount {
        count: Int!
        rows: [Community]!
    }

    type Query {
        allUsers(limit: Int, offset: Int): [User]!
        findUser(userId: ID): User

        getFeed(limit: Int, offset: Int): UpdateCount
        getFriendSuggestions: [User]!

        findFriends(userId: ID!, limit: Int, offset: Int): [User]!

        findScraps(receiverId: ID!, limit: Int, offset: Int): ScrapCount!

        findTestimonials(receiverId: ID!, limit: Int, offset: Int): [Testimonial]!

        findUpdates(userId: ID!, limit: Int, offset: Int): [Update]!

        findPhotoFolders(userId: ID!): [PhotoFolder]!

        findPhotos(userId: ID!, folderId: ID!, limit: Int, offset: Int): PhotoCount!
        findPhoto(photoId: ID!, userId: ID!): Photo
        findPhotoComments(photoId: ID!, limit: Int, offset: Int): PhotoCommentCount!

        allCommunities(
            creatorId: ID, 
            filter: String, 
            limit: Int, 
            offset: Int, 
            limitTopic: Int, 
            offsetTopic: Int,
            limitComment: Int,
            offsetComment: Int
        ): CommunityCount!
        getCommunityMembersCount(communityId: ID!): Int

        findCommunity(communityId: ID!): Community
        
        findTopicCount(communityId: ID!): Int
        findTopic(topicId: ID!, limit: Int, offset: Int): Topic
        findCommunityTopics(communityId: ID!, filter: String, limit: Int, offset: Int, limitComment: Int, offsetComment: Int): TopicCount!

        findTopicComments(topicId: ID!, order: Order!, limit: Int, offset: Int): TopicCommentCount!

        findCommunityMembers(communityId: ID!, filter: String, random: Boolean, limit: Int, offset: Int): UserCount!

        allCategories: [Category]!
    }

    type Token {
        id: ID!
        value: String!
    }

    type Mutation {
        register(
            email: EmailAddress!,
            password: String!,
            born: Date!,
            name: String!,
            sex: Sex,
            country: String!
        ): User
        login(
            email: EmailAddress!,
            password: String!
        ): Token

        sendFriendRequest(requesteeId: ID!): [FriendRequest]!
        respondFriendRequest(requesterId: ID!, accept: Boolean!): User
        unfriend(friendId: ID!): User

        updateProfilePicture(newPhoto: String!): User

        sendScrap(body: String!, userId: ID!): Scrap
        deleteScrap(userId: ID!, scrapId: ID!): Scrap

        sendTestimonial(body: String!, userId: ID!): Testimonial
        deleteTestimonial(userId: ID!, testimonialId: ID!): Testimonial

        sendUpdate(body: String!): Update
        hideUpdate(updateId: ID!): Update
        deleteUpdate(updateId: ID!): Update

        createPhotoFolder(title: String, visible_to_all: Boolean): PhotoFolder
        deletePhotoFolder(folderId: ID!): PhotoFolder

        createPhotoComment(body: String!, photoId: ID!): PhotoComment
        deletePhotoComment(commentId: ID!): PhotoComment

        createCommunity(
            title: String!
            picture: String!
            description: String
            categoryId: ID!
            type: String!
            language: String!
            country: String!
        ): Community
        joinCommunity(communityId: ID!): Community
        leaveCommunity(communityId: ID!): Community

        createTopic(communityId: ID!, title: String!, body: String!): Topic
        deleteTopic(topicId: ID!): Topic

        sendTopicComment(topicId: ID!, body: String!): TopicComment
        deleteTopicComment(topicCommentId: ID!): TopicComment
    }
`