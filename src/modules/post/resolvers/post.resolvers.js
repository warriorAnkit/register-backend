const { pubsub, pubsubEvents } = require('../../../pubsub');
const postCreatedByFieldResolver = require('../field-resolver/post-created-by');

const createPost = require('./mutations/create-post');
const post = require('./queries/post');
const posts = require('./queries/posts');

const resolvers = {
  Query: {
    post,
    posts,
  },
  Mutation: {
    createPost,
  },
  // Post: {
  //   createdBy: postCreatedByFieldResolver,
  // },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(pubsubEvents.POST_CREATED),
    },
  },
};

module.exports = resolvers;
