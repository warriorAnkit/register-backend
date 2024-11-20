const postLogger = require('../../post-logger');

const posts = async (parent, args, ctx) => {
  const { models: { Post: PostModel }, requestMeta } = ctx;
  try {
    const {
      sort: { field = 'createdAt', order = 'DESC' } = {},
      filter: { skip = 0, limit = 20 } = {},
    } = args;

    const postFilter = {
      limit,
      offset: skip,
      order: [[field, order]],
    };

    const postsRes = PostModel.findAll(postFilter);
    const count = PostModel.count(postFilter);
    const response = { data: postsRes, count };

    return response;
  } catch (err) {
    postLogger.error(`Error from posts resolver => ${err}`, requestMeta);
    throw err;
  }
};

module.exports = posts;
