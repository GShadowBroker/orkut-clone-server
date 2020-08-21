module.exports = (sequelize, DataTypes) => {
  const Scrap = sequelize.define(
    "scrap",
    {
      body: DataTypes.STRING(1000),
    },
    {}
  );
  return Scrap;
};
