const personLogger = require('../../person-logger');

const getCurrentUser = async (parent, args, ctx) => {
  const { requestMeta, req = {} } = ctx;
  try {
    const { user } = req;
    return user;
  } catch (error) {
    personLogger.error(`Error from me > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getCurrentUser;
