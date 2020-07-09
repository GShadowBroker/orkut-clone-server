const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./User');
const communityModel = require('./Community');

// DB Connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: process.env.DB_DIALECT,
    logging: false // Disable query logging
});

// Models
const User = userModel(sequelize, DataTypes);
const Community = communityModel(sequelize, DataTypes);
const Comment = sequelize.define('comment', { body: DataTypes.STRING });
const Photo = sequelize.define('photo', { url: DataTypes.STRING });

// Associations
// Scraps

// Photo - User - Comments
User.hasMany(Photo, { foreignKey: 'userId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
Photo.belongsTo(User);

Photo.hasMany(Comment, { foreignKey: 'photoId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
Comment.belongsTo(Photo);

// Communities - Users
User.belongsToMany(Community, { as: 'Subscriptions', through: 'user_communities', foreignKey: User.id });
Community.belongsToMany(User, { as: 'Members', through: 'user_communities', foreignKey: Community.id });

// Friend requests and friends
User.belongsToMany(User, { as: 'Friends', through: 'friends' });
User.belongsToMany(User, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
User.belongsToMany(User, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});

// Synchronize - Development ONLY
(async () => {
    try {
        await sequelize.sync({ force: true })
        console.log('All models were synchronized'.green);

        const gledy = await User.create({ name: 'Gledyson', password: "123456", email: 'gledysonferreira@gmail.com', city: 'Dourados', country: 'Brazil' });
        const adam = await User.create({ name: 'Adam', email: 'adam@gmail.com', city: 'Barcelona', country: 'Spain' });
        const eve = await User.create({ name: 'Eve', email: 'eve@gmail.com', city: 'Hokkaido', country: 'Japan' });
        const snek = await User.create({ name: 'Snek', email: 'snek@gmail.com', city: 'New Dheli', country: 'India' });

        const comunidade1 = await Community.create({
            title: "Eu Odeio Acordar Cedo",
            picture: "https://i.imgur.com/BHBqg9S.jpg",
            description: "Para todos aqueles que acham que o dia só começa ao meio-dia.\n\"Eu faço samba e amor até mais tarde e tenho muito sono de manhã\" (Chico Buarque)",
            category: "Outros",
            language: "Português (Brasil)"
        })
        const comunidade2 = await Community.create({
            title: "Lindomar, O Subzero Brasileiro",
            picture: "https://www.museudememes.com.br/wp-content/uploads/2017/03/lindomar-00.jpg",
            description: "\"foi ai que indignado, um rapaz se destaca entre a multidão... Jovem, simples, de havaianas...\nLindomar, o tigre voador, o SUBZERO BRASILEIRO. Sua sagacidade levou multidões ao delírio, a perfeita voadora foi executada com maestria... o golpe ficou conhecido na época, como O LOSANGO ABERTO\nDivina vai ao chão... seu vestido, agora consumido pela poeira... ela chora... Lindomar ri, sabe que sua tarefa foi completa, e assim, desaparece entre a multidão.\"",
            category: "Outros",
            language: "Português (Brasil)"
        })

        // // Test methods
        // const sendRequest =  async (requester, requestee) => {
        //     if (requester.id === requestee.id) {
        //         console.log('Cannot friend yourself'.red)
        //         return
        //     }
        //     const result = await requester.addRequestee(requestee.id)
        //     return result
        // }

        // const acceptRequest = async (requestee, requester) => {
        //     if (!requestee.Requesters.find(r => r.id === requester.id)) {
        //         console.log('Cannot find friend request'.red)
        //         return
        //     }
        // }

        // const odeio = await Community.create({ title: 'Eu odeio acordar cedo' })
        // await snek.addSubscriptions(odeio.id)

        // await odeio.addMembers(adam.id)

        // const refetchSnek = await User.findOne({ where: { name: 'Snek' }, include: { all: true } })
        // const refecthOdeio = await Community.findOne({ where: { title: 'Eu odeio acordar cedo' }, include: { all: true } })
        // const refetchAdam = await User.findOne({ where: { name: 'Adam' }, include: { all: true } })

        // console.log('Snek'.green, JSON.stringify(refetchSnek))
        // console.log('Community'.green, JSON.stringify(refecthOdeio))
        // console.log('Adam'.green, JSON.stringify(refetchAdam))

    } catch(error) {
        console.error('Error synchronizing models'.red, error);
    }
})();

module.exports = {
    sequelize,
    User,
    Community
}