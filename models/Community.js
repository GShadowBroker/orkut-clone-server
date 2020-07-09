module.exports = (sequelize, DataTypes) => {
    const Community = sequelize.define('community', {
        // id: {
        //     type: DataTypes.UUID,
        //     defaultValue: DataTypes.UUIDV4,
        //     allowNull: false,
        //     primaryKey: true
        // },
        title: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true
        },
        description: {
            type: DataTypes.STRING(1000)
        },
        category: DataTypes.STRING,
        language: DataTypes.STRING
    }, {});
    return Community
}