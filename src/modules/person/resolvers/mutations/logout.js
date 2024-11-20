const moment = require('moment');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const jwt = require('../../../../utils/auth/jwt');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const logout = async (parent, args, ctx) => {
  const {
    req: { user, useragent = {} }, requestMeta, models, localeService,
  } = ctx;

  try {
    const { Person: PersonModel } = models;

    // Check if user is logged in
    if (!user || !user.id) {
      throw new CustomGraphqlError(getMessage('USER_NOT_AUTHENTICATED', localeService));
    }

    // Find user in the database
    const person = await PersonModel.findByPk(user.id);
    if (!person) {
      throw new CustomGraphqlError(getMessage('USER_NOT_FOUND', localeService));
    }

    // Clear or invalidate access token and refresh token
    await jwt.deleteAccessToken(user.id, useragent);  // Delete the access token
    await person.update({ refreshToken: null, lastActiveOn: moment() });

    return {
      message: getMessage('LOGOUT_SUCCESS', localeService),
    };
  } catch (error) {
    personLogger.error(`Error from logoutUser > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = logout;
