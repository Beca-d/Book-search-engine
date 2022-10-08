const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
                .select("-__v -password")
            
            return userData;
            }

            throw new AuthenticationError('You need to log in.');
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            try {
                const user = await User.create(args);
        
                const token = signToken(user);
                return { token, user };
            }
            catch (err) {
                console.log(err);
            }
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

        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._Id },
                    {
                    $addToSet: { savedbooks: args.input },
                    },
                    {
                    new: true,
                    runValidators: true,
                    }
                );

                return updatedUser;   
            }
            throw new AuthenticationError('You need to log in');
        },
        
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedbooks: { bookId: args.bookId }}},
                { new: true }
            );
            return updatedUser;
            }
            throw new AuthenticationError('You need to log in');
        },
    },
};

  module.exports = resolvers;