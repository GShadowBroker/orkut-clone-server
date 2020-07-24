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
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        born: {
            type: DataTypes.DATEONLY
        },
        age: {
            type: DataTypes.VIRTUAL(DataTypes.INTEGER, ['born']),
            get: function () {
                return new Date().getFullYear() - new Date(this.get('born')).getFullYear()
            }
        },
        city: DataTypes.STRING,
        country: {
            type: DataTypes.STRING
        },
        gender: DataTypes.ENUM({
            values: [
                'masculino',
                'feminino',
                'outro'
            ]
        }),
        about: {
            type: DataTypes.STRING
        },
        interests: {
            type: DataTypes.STRING
        },
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