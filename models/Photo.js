module.exports = (sequelize, DataTypes) => {
  const Photo = sequelize.define(
    "photo",
    {
      url: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {}
  );
  return Photo;
};
