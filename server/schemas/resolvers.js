const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      users: async () => {
        return User.find();
      },

      user: async (parent, { userId }) => {
        return User.findOne({ _id: userId });
      },
      me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError('You need to log in.');
      },
    },

    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);

        return { token, profile };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
          throw new AuthenticationError('No user found with this email!');
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw new AuthenticationError('Incorrect password!');
        }

        const token = signToken(user);
        return { token, user };
      },

      saveBook: async (parent, { userId, book }, context) => {
        if (context.user) {
          return User.findOneAndUpdate(
            { _id: userId },
            {
              $addToSet: { savedbooks: book },
            },
            {
              new: true,
              runValidators: true,
            }
          );
        }
        throw new AuthenticationError('You need to log in');
      },
      removeBook: async (parent, { book }, context) => {
        if (context.user) {
          return User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedbooks: book } },
            { new: true }
          );
        }
        throw new AuthenticationError('You need to log in');
      },
    },
  };

  module.exports = resolvers;