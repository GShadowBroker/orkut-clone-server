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
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true
        },
        description: {
            type: DataTypes.STRING(3000)
        },
        type: DataTypes.ENUM({
            values: ['público', 'privado']
        }),
        language: DataTypes.STRING,
        country: DataTypes.STRING
    }, {});
    return Community
}