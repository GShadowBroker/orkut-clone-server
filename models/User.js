module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
        validate: {
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        required: true,
        validate: {
          isEmail: true,
          len: [5, 255],
        },
      },
      profile_picture: {
        type: DataTypes.STRING,
        defaultValue:
          "https://res.cloudinary.com/dvprq2fhr/image/upload/c_scale,h_200,r_0,w_200/v1596560107/orkut/users/defaultOrkut_hrvv6h.png",
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      born: {
        type: DataTypes.DATEONLY,
      },
      age: {
        type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["born"]),
        get: function () {
          return (
            new Date().getFullYear() - new Date(this.get("born")).getFullYear()
          );
        },
      },
      city: DataTypes.STRING,
      country: {
        type: DataTypes.STRING,
      },
      sex: DataTypes.ENUM({
        values: ["masculino", "feminino", "notinformed"],
      }),
      about: {
        type: DataTypes.STRING(3000),
      },
      interests: {
        type: DataTypes.STRING,
      },
      videos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        select: false, // Won't be returned in queries by default. To return it, use .select('+password')
      },
    },
    {}
  );
  return User;
};

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
