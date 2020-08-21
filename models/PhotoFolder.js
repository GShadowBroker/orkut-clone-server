module.exports = (sequelize, DataTypes) => {
  const PhotoFolder = sequelize.define(
    "photofolder",
    {
      title: DataTypes.STRING,
      visible_to_all: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {}
  );
  return PhotoFolder;
};
