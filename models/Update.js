module.exports = (sequelize, DataTypes) => {
    const Update = sequelize.define('updates', {
        body: {
            type: DataTypes.STRING(1000),
            required: true,
            allowNull: false
        },
        action: {
            type: DataTypes.ENUM({
                values: [
                    "joinCommunity",
                    "addFriend",
                    "addPost",
                    "addPhoto"
                ]
            }),
            required: true,
            allowNull: false
        },
        object: {
            type: DataTypes.JSON
        },
        picture: {
            type: DataTypes.STRING,
            validate: {
                isUrl: true
            }
        },
        visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {});
    return Update
}