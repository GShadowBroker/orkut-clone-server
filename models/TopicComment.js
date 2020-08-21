module.exports = (sequelize, DataTypes) => {
  const TopicComment = sequelize.define(
    "topiccomment",
    {
      body: DataTypes.STRING(4000),
    },
    {}
  );
  return TopicComment;
};
