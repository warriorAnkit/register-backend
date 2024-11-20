const { pubsub, pubsubEvents } = require('../../../../pubsub');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../post-logger');

const createPost = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { Post: PostModel } = models;
    const { data } = args;
    const { text } = data;

    const { user } = req;

    const createPostData = {
      text,
      createdBy: user.id,
      updatedBy: user.id,
    };

    const createdPost = await PostModel.create(createPostData);

    const response = {
      data: createdPost,
      message: getMessage('POST_CREATE_SUCCESS', localeService, { name: 'JOHN DOE' }),
    };

    pubsub.publish(pubsubEvents.POST_CREATED, {
      postCreated: {
        data: createdPost,
      },
    });
    return response;
  } catch (err) {
    postLogger.error(`Error from createPost resolver => ${err}`, requestMeta);
    throw err;
  }
};

module.exports = createPost;
