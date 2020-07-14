module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        // id: {
        //     type: DataTypes.UUID,
        //     defaultValue: DataTypes.UUIDV4,
        //     allowNull: false,
        //     primaryKey: true
        // },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        profile_picture: {
            type: DataTypes.STRING,
            defaultValue: "https://i.imgur.com/BoHH3Pb.png",
            allowNull: false
        },
        born: {
            type: DataTypes.DATEONLY
        },
        city: DataTypes.STRING,
        country: {
            type: DataTypes.STRING
        },
        gender: DataTypes.STRING,
        about: {
            type: DataTypes.STRING
        },
        // photos: {
        //     type: DataTypes.ARRAY(DataTypes.STRING),
        //     defaultValue: [],
        //     allowNull: false
        // },
        videos: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            select: false // Won't be returned in queries by default. To return it, use .select('+password'). In theory. But it doesn't work anyway...
        }
    }, {});
    return User
}

// const User = sequelize.define({
//         name: String,
//         profile_picture: String,
//         born: Date,
//         country: String,
//         city: String,
//         about: String,
//         created: Date,
//         edited: Date,
//         photos: [String],
//         friends: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User'
//         }],
//         friend_requests: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User'
//         }],
//         communities: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Community'
//         }],
//         scraps: [{
//             id:  mongoose.Types.ObjectId(),
//             body: String,
//             authorId: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'User'
//             },
//             created: Date
//         }],
//         videos: [String],
//         testimonials: [{
//             id:  mongoose.Types.ObjectId(),
//             body: String,
//             authorId: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'User'
//             },
//             created: Date
//         }],
//         updates: [{
//             id:  mongoose.Types.ObjectId(),
//             body: String,
//             authorId: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'User'
//             },
//             created: Date
//         }]
// })