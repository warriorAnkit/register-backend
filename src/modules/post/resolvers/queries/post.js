const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../post-logger');

const post = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Post: PostModel } = models;
    const { where } = args;
    const { id } = where;

    if (!id.trim()) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const postInstance = await PostModel.findByPk(id);
    if (!postInstance) {
      throw new CustomGraphqlError(getMessage('POST_NOT_FOUND', localeService));
    }

    return postInstance;
  } catch (error) {
    postLogger.error(`Error from posts resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = post;
