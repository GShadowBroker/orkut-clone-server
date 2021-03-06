const { ApolloServer } = require("apollo-server");
const colors = require("colors");
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const { sequelize } = require("./models");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const context = require("./context");
const clearOldUpdates = require("./utils/clearOldUpdates");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    reportSchema: true,
    variant: "current",
  },
  context,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`.cyan);
  clearOldUpdates(1000 * 60 * 60 * 6);
});
