module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "video",
    {
      url: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {}
  );
  return Video;
};
