const generateResponse = require('../../../../../utils/rest/generate-response');
const postLogger = require('../../post-logger');

const posts = async (req, res, next) => {
  const { logInfo = {} } = req;
  try {
    postLogger.info('posts > FETCHING POSTS', logInfo);
    return res.send(generateResponse(null, { posts: [] }));
  } catch (error) {
    postLogger.error(`Error from posts controller => ${error}`, logInfo);
    return next(error);
  }
};

module.exports = posts;
