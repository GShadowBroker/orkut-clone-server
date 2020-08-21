module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "category",
    {
      title: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  return Category;
};
