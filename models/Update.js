module.exports = (sequelize, DataTypes) => {
    const Update = sequelize.define('updates', {
        body: {
            type: DataTypes.STRING(1000),
            required: true,
            allowNull: false
        },
        verb: {
            type: DataTypes.ENUM({
                values: [
                    "add",
                    "edit"
                ]
            }),
            required: true,
            allowNull: false
        },
        object: {
            type: DataTypes.ENUM({
                values: [
                    "update",
                    "friend",
                    "community",
                    "photos"
                ]
            }),
            required: true,
            allowNull: false
        },
        picture: {
            type: DataTypes.STRING,
            validate: {
                isUrl: true
            }
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {});
    return Update
}