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
const Scrap = sequelize.define('scrap', { body: DataTypes.STRING(1000) });
const Testimonial = sequelize.define('testimonial', { body: DataTypes.STRING });
const Update = sequelize.define('updates', { body: DataTypes.STRING });
const Photo = sequelize.define('photo', { url: DataTypes.STRING, description: DataTypes.STRING });

// Associations

// Scraps
User.hasMany(Scrap, { as: 'Scraps', foreignKey: { name: 'receiverId', allowNull: false } });
// Adds userId to scraps by default. foreignKey: 'receiverId' creates receiverId field in scraps.
// users get accessor .getScraps().
User.hasMany(Scrap, { as: 'SentScraps', foreignKey: { name: 'senderId', allowNull: false } });
// Adds senderId field to scraps.
// users get accessor .getSentScraps().
Scrap.belongsTo(User, { as: "Receiver", foreignKey: { name: 'receiverId', allowNull: false } });
// Has to call .getScraps({ include: { model: User, as: 'Receiver' }})
Scrap.belongsTo(User, { as: "Sender", foreignKey: { name: 'senderId', allowNull: false } });
// Has to call .getScraps({ include: { model: User, as: 'Sender' }})

// Testimonials
User.hasMany(Testimonial, { as: 'Testimonials', foreignKey: { name: 'receiverId', allowNull: false } });
User.hasMany(Testimonial, { as: 'sentTestimonials', foreignKey: { name: 'senderId', allowNull: false } });
Testimonial.belongsTo(User, { as: "Receiver", foreignKey: { name: 'receiverId', allowNull: false } });
Testimonial.belongsTo(User, { as: "Sender", foreignKey: { name: 'senderId', allowNull: false } });

// Updates
User.hasMany(Update, { as: 'Updates', foreignKey: { name: 'userId', allowNull: false } });
Update.belongsTo(User);

// // Photo - User - Comments
User.hasMany(Photo, { as: 'Photos', foreignKey: { name: 'userId', allowNull: false } });
Photo.belongsTo(User);

// User.hasMany(Photo, { foreignKey: 'userId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
// Photo.belongsTo(User);

// Photo.hasMany(Comment, { foreignKey: 'photoId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
// Comment.belongsTo(Photo);

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

        const gledy = await User.create({ name: 'Gledyson', password: "123456", profile_picture: "https://pbs.twimg.com/media/DoceX9qV4AAwG0-.jpg", email: 'gledysonferreira@gmail.com', city: 'Dourados', country: 'Brazil' });
        const adam = await User.create({ name: 'Adam', profile_picture: "https://www1.pictures.zimbio.com/gi/Adam+Sandler+Funny+People+Q+Session+7IWV7W2kXXGl.jpg", email: 'adam@gmail.com', city: 'Barcelona', country: 'Spain' });
        const eve = await User.create({ name: 'Eve', profile_picture: "https://s31242.pcdn.co/wp-content/uploads/2019/06/EveCREDWiki.jpg", email: 'eve@gmail.com', city: 'Hokkaido', country: 'Japan' });
        const snek = await User.create({ name: 'Snek', profile_picture: "https://cdn.bulbagarden.net/upload/thumb/e/ef/Arbok_anime.png/250px-Arbok_anime.png", email: 'snek@gmail.com', city: 'New Dheli', country: 'India' });

        await gledy.addFriends(adam.id)
        await adam.addFriends(gledy.id)

        await gledy.addFriends(eve.id)
        await eve.addFriends(gledy.id)

        await gledy.addFriends(snek.id)
        await snek.addFriends(gledy.id)

        await adam.addFriends(eve.id)
        await eve.addFriends(adam.id)

        await snek.addFriends(eve.id)
        await eve.addFriends(snek.id)

        await Photo.create({
            url: "https://i.pinimg.com/236x/d9/01/6b/d9016bbe8c945fdeac3501500f3e6d8a.jpg",
            description: "Look at the girlfriend I'll never have! lol",
            userId: "1"
        })
        await Photo.create({
            url: "https://i.imgur.com/nkjxhp8.jpg",
            description: "Dat curve tho lol",
            userId: "1"
        })

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

        await Scrap.create({
            body: 'Eve sending message to Gledy',
            senderId: "3",
            receiverId: "1",
        })
        await Scrap.create({
            body: 'Hey, it\'s Adam! Yo fren!',
            senderId: "2",
            receiverId: "1",
        })

        await Testimonial.create({
            body: "O que dizer de Gureduson? Nada.",
            senderId: "4",
            receiverId: "1"
        })

        await Testimonial.create({
            body: "Devolve meu mago negro!!!!",
            senderId: "2",
            receiverId: "1"
        })

        await Update.create({
            body: "Hoje to titi",
            userId: "1"
        })

    } catch(error) {
        console.error('Error synchronizing models'.red, error);
    }
})();

module.exports = {
    sequelize,
    User,
    Community,
    Scrap,
    Testimonial,
    Update,
    Photo
}