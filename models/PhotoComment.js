module.exports = (sequelize, DataTypes) => {
  const PhotoComment = sequelize.define(
    "photocomment",
    {
      body: DataTypes.STRING(1000),
    },
    {}
  );
  return PhotoComment;
};
