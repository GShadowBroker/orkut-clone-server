module.exports = (sequelize, DataTypes) => {
  const Testimonial = sequelize.define(
    "testimonial",
    {
      body: DataTypes.STRING(1000),
    },
    {}
  );
  return Testimonial;
};
