const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./User');
const communityModel = require('./Community');
const updateModel = require('./Update')

// DB Connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: process.env.DB_DIALECT,
    logging: false
});

// Models
const User = userModel(sequelize, DataTypes);
const Community = communityModel(sequelize, DataTypes);
const Update = updateModel(sequelize, DataTypes);

const Topic = sequelize.define('topic', { title: DataTypes.STRING, body: DataTypes.STRING(2048) })
const TopicComment = sequelize.define('topiccomment', { body: DataTypes.STRING(2048) });
const Category = sequelize.define('category', { title: DataTypes.STRING }, { timestamps: false });

const Scrap = sequelize.define('scrap', { body: DataTypes.STRING(1000) });
const Testimonial = sequelize.define('testimonial', { body: DataTypes.STRING(1000) });

const Photo = sequelize.define('photo', { url: DataTypes.STRING, description: DataTypes.STRING });
const PhotoComment = sequelize.define('photocomment', { body: DataTypes.STRING(1000) });

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
Update.belongsTo(User, { as: 'User', foreignKey: { name: 'userId', allowNull: false } });

// // Photo - User - Comments
User.hasMany(Photo, { as: 'Photos', foreignKey: { name: 'userId', allowNull: false } });
Photo.belongsTo(User);
Photo.hasMany(PhotoComment, { as: 'Comments', foreignKey: { name: 'photoId', allowNull: false } });
PhotoComment.belongsTo(Photo);

User.hasMany(PhotoComment, { as: 'PhotoComments', foreignKey: { name: 'receiverId', allowNull: false } })
User.hasMany(PhotoComment, { as: 'sentPhotoComments', foreignKey: { name: 'senderId', allowNull: false } })
PhotoComment.belongsTo(User, { as: "Receiver", foreignKey: { name: 'receiverId', allowNull: false } });
PhotoComment.belongsTo(User, { as: "Sender", foreignKey: { name: 'senderId', allowNull: false } });

// User.hasMany(Photo, { foreignKey: 'userId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
// Photo.belongsTo(User);

// Photo.hasMany(Comment, { foreignKey: 'photoId', onDelete: 'CASCADE' }); // TEST AND ADD ONDELETE CASCADE
// Comment.belongsTo(Photo);

// Friend requests and friends
User.belongsToMany(User, { as: 'Friends', through: 'friends' });
User.belongsToMany(User, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
User.belongsToMany(User, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});

// Communities - Users
User.belongsToMany(Community, { as: 'Subscriptions', through: 'user_communities', foreignKey: User.id });
Community.belongsToMany(User, { as: 'Members', through: 'user_communities', foreignKey: Community.id });

User.hasMany(Community, { as: 'CreatedCommunities', foreignKey: { name: "creatorId", allowNull: false } });
Community.belongsTo(User, { as: 'Creator', foreignKey: { name: 'creatorId', allowNull: false } });

Category.hasMany(Community, { as: 'Community', foreignKey: { name: 'categoryId', allowNull: false } });
Community.belongsTo(Category, { as: 'Category', foreignKey: { name: 'categoryId', allowNull: false } });

// Topics
User.hasMany(Topic, { as: "Topics", foreignKey: { name: "creatorId", allowNull: false } });
Topic.belongsTo(User, { as: "TopicCreator", foreignKey: { name: 'creatorId', allowNull: false } });

User.hasMany(TopicComment, { as: 'TopicComments', foreignKey: { name: 'receiverId', allowNull: false } });
User.hasMany(TopicComment, { as: 'sentTopicComments', foreignKey: { name: 'senderId', allowNull: false } });
TopicComment.belongsTo(User, { as: "Receiver", foreignKey: { name: 'receiverId', allowNull: false } });
TopicComment.belongsTo(User, { as: "Sender", foreignKey: { name: 'senderId', allowNull: false } });

Community.hasMany(Topic, { as: "Topics", foreignKey: { name: "communityId", allowNull: false } });
Topic.belongsTo(Community, { as: "Community", foreignKey: { name: "communityId", allowNull: false } });

Topic.hasMany(TopicComment, { as: 'Comments', foreignKey: { name: 'topicId', allowNull: false } });
TopicComment.belongsTo(Topic, { as: "Topic", foreignKey: { name: "topicId", allowNull: false } });

// Synchronize - Development ONLY
if (process.env.NODE_ENV === 'development') {
    (async () => {
        try {
            await sequelize.sync({ force: true })
    
            const gledy = await User.create({ name: 'Gledyson', password: "$2b$10$m6f1jkf0y9Md9c0hed8G0OlODjNZ10qTWBW6IlcFPrJvaCEqQ520q", gender: "masculino", born: "1990-04-21", profile_picture: "https://static.wikia.nocookie.net/b0252c1c-26b9-4fff-8e0e-99a4875bec63", email: 'gledysonferreira@gmail.com', city: 'Dourados', country: 'Brazil' });
            const adam = await User.create({ name: 'Adam', profile_picture: "https://www1.pictures.zimbio.com/gi/Adam+Sandler+Funny+People+Q+Session+7IWV7W2kXXGl.jpg", email: 'adam@gmail.com', city: 'Barcelona', country: 'Spain', password: '$2b$10$tCDBfOxyyotx4kCkZJWfl.LSS82egqFbREtEUe.V70Ju0WmO/zIlq' });
            const eve = await User.create({ name: 'Eve', profile_picture: "https://s31242.pcdn.co/wp-content/uploads/2019/06/EveCREDWiki.jpg", email: 'eve@gmail.com', city: 'Hokkaido', country: 'Japan', password: '$2b$10$tCDBfOxyyotx4kCkZJWfl.LSS82egqFbREtEUe.V70Ju0WmO/zIlq' });
            const snek = await User.create({ name: 'Snek', profile_picture: "https://cdn.bulbagarden.net/upload/thumb/e/ef/Arbok_anime.png/250px-Arbok_anime.png", email: 'snek@gmail.com', city: 'New Dheli', country: 'India', password: '$2b$10$tCDBfOxyyotx4kCkZJWfl.LSS82egqFbREtEUe.V70Ju0WmO/zIlq' });
            const larissa = await User.create({ name: 'Larissa Andrade', profile_picture: "https://i.pinimg.com/originals/91/69/ba/9169bac70902ec1756a341aa66584b09.jpg", gender: "feminino", born: "1997-08-12", email: 'larissaa@gmail.com', city: 'São Paulo', country: 'Brazil', password: '$2b$10$tCDBfOxyyotx4kCkZJWfl.LSS82egqFbREtEUe.V70Ju0WmO/zIlq' });

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

            await gledy.addFriends(larissa.id)
            await larissa.addFriends(gledy.id)
            
            photos = [
                'https://i.pinimg.com/564x/99/cf/9f/99cf9ff40f47e1f3faf0f85f78180f4c.jpg',
                'https://i.pinimg.com/564x/bc/88/cd/bc88cd673e8bf8742efaace41bfc4d44.jpg',
                'https://i.pinimg.com/564x/6b/ad/dd/6badddbcf567b7b71f41866daf75f680.jpg',
                'https://i.pinimg.com/564x/80/a1/af/80a1af62746f35b6e50e57e264c02d42.jpg',
                'https://i.pinimg.com/564x/79/f9/b7/79f9b7cea2ef99af6a0490b4c02eeea5.jpg',
                'https://i.pinimg.com/564x/d3/c9/b8/d3c9b853544733f65f5531f86a1ac49e.jpg',
                'https://i.pinimg.com/564x/6c/0d/bd/6c0dbd91c618a970ddb5e329548955cf.jpg',
                'https://i.pinimg.com/564x/aa/09/88/aa0988c66ff97e4eab013e45dbd747d4.jpg',
                'https://i.pinimg.com/564x/ef/21/5f/ef215fdd30790758edd00ad097e166b4.jpg',
                'https://i.pinimg.com/564x/af/be/ef/afbeef3e39f023b6b9b4ef9de0a24b9d.jpg',
                'https://i.pinimg.com/564x/87/16/4c/87164c19bf9f2916e133e752a9192b01.jpg',
                'https://i.pinimg.com/564x/dc/fe/79/dcfe79a3691cf6077d26ab1e406f0f40.jpg',
                'https://i.pinimg.com/564x/f5/f2/bb/f5f2bbb27b853f8452ef43f337c8b52d.jpg'
            ];

            categories = [
                'Alunos e Escolas',
                'Animais: de estimação ou não',
                'Artes e Entretenimento',
                'Atividades',
                'Automotivo',
                'Cidades e Bairros',
                'Computadores e Internet',
                'Culinária, Bebidas e Vinhos',
                'Culturas e Comunidade',
                'Empresa',
                'Escolas e Cursos',
                'Esportes e Lazer',
                'Família e Lar',
                'Gays, Lésbicas e Bi',
                'Governo e Política',
                'História e Ciências',
                'Hobbies e Trabalhos Manuais',
                'Jogos',
                'Moda e Beleza',
                'Música',
                'Negócios',
                'Países e Regiões',
                'Pessoas',
                'Religiões e Crenças',
                'Românticas e Relacionamentos',
                'Saúde, Bem-estar e Fitness',
                'Viagens',
                'Outros'
            ];

            for (let p of photos) {
                await Photo.create({
                    url: p,
                    description: "minha foto",
                    userId: "1"
                });
            }

            for (let c of categories) {
                await Category.create({
                    title: c
                });
            }

            const comunidade1 = await Community.create({
                title: "Eu Odeio Acordar Cedo",
                picture: "https://i.imgur.com/BHBqg9S.jpg",
                description: "Para todos aqueles que acham que o dia só começa ao meio-dia.\n\"Eu faço samba e amor até mais tarde e tenho muito sono de manhã\" (Chico Buarque)",
                categoryId: "28",
                creatorId: "1",
                language: "Português (Brasil)",
                type: "público"
            });
            const comoBeberAgua = await Topic.create({
                title: "Como beber água?",
                body: "<p>Então eu tava em casa e me surge uma dúvida... como beber água?</p>",
                creatorId: "1",
                communityId: "1"
            });
            const comment = await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })
            await TopicComment.create({
                topicId: comoBeberAgua.id,
                senderId: "3",
                receiverId: comoBeberAgua.creatorId,
                body: "<p>Mano, para que tá cringe. Cadê os moderadores dessa bagaça?</p>"
            })



            const comunidade2 = await Community.create({
                title: "Lindomar, O Subzero Brasileiro",
                picture: "https://www.museudememes.com.br/wp-content/uploads/2017/03/lindomar-00.jpg",
                description: "\"foi ai que indignado, um rapaz se destaca entre a multidão... Jovem, simples, de havaianas...\nLindomar, o tigre voador, o SUBZERO BRASILEIRO. Sua sagacidade levou multidões ao delírio, a perfeita voadora foi executada com maestria... o golpe ficou conhecido na época, como O LOSANGO ABERTO\nDivina vai ao chão... seu vestido, agora consumido pela poeira... ela chora... Lindomar ri, sabe que sua tarefa foi completa, e assim, desaparece entre a multidão.\"",
                categoryId: "28",
                creatorId: "1",
                language: "Português (Brasil)",
                type: "público"
            });

            const comunidade3 = await Community.create({
                title: "To fazendo amor, com 8 pessoas",
                picture: "https://img10.orkut.br.com/community/ad70283c50e4c2005fbc93887e29ee3d.jpg",
                description: "...mas meu coraçãããão... vai ser pra sempre seu...",
                categoryId: "25",
                type: "privado",
                language: "Português (Brasil)",
                creatorId: "1"
            })

            await gledy.addSubscriptions(comunidade1)
            await gledy.addSubscriptions(comunidade2)
    
            await Scrap.create({
                body: "<p>Hello World!</p>",
                senderId: "3",
                receiverId: "1",
            });
    
            await Testimonial.create({
                body: "<p>O que dizer de Gureduson? Nada.</p>",
                senderId: "4",
                receiverId: "1"
            });
    
            await Testimonial.create({
                body: "<p>Devolve meu mago negro!!!!</p>",
                senderId: "2",
                receiverId: "1"
            });
    
            await Update.create({
                body: "<p>Hoje to titi</p>",
                verb: "add",
                object: "update",
                userId: "1"
            });

            console.log('All models synchronized successfully!'.green)
    
        } catch(error) {
            console.error('Error synchronizing models'.red, error);
        }
    })();
}

module.exports = {
    sequelize,
    User,
    Community,
    Category,
    Scrap,
    Testimonial,
    Update,
    Photo,
    PhotoComment,
    Topic,
    TopicComment
}