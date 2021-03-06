const jwt = require("jsonwebtoken");
const {
  User,
  Community,
  Scrap,
  Photo,
  Testimonial,
  Update,
  Video,
} = require("../models");

module.exports = async ({ req }) => {
  const auth = req ? req.headers.authorization : null;
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    const decodedToken = jwt.verify(
      auth.substring(7),
      process.env.TOKEN_SECRET
    );
    const currentUser = await User.findByPk(decodedToken.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Scrap,
          as: "Scraps",
          attributes: ["id"],
          separate: true,
        },
        {
          model: User,
          as: "Friends",
          attributes: ["id", "name", "profile_picture"],
        },
        {
          model: Community,
          as: "Subscriptions",
          attributes: ["id", "title", "picture"],
        },
        {
          model: Photo,
          as: "Photos",
          attributes: ["id", "url", "description", "folderId"],
          separate: true,
        },
        {
          model: Video,
          as: "Videos",
          attributes: ["id", "url"],
          separate: true,
        },
        {
          model: User,
          as: "Requesters",
          attributes: ["id", "name", "profile_picture"],
        },
        {
          model: Testimonial,
          as: "Testimonials",
          attributes: ["id"],
          separate: true,
        },
        {
          model: Update,
          as: "Posts",
          attributes: ["id", "body"],
          separate: true,
        },
      ],
    });
    return { currentUser };
  }
};
