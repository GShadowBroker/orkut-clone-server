module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define(
    "topic",
    {
      title: DataTypes.STRING,
      body: DataTypes.STRING(4000),
    },
    {}
  );
  return Topic;
};
