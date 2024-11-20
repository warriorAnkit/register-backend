const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const jwt = require('../../../../utils/auth/jwt');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const refreshTokenResolver = async (parent, args, ctx) => {
  const {
    requestMeta, localeService, req: { useragent = {} }, models,
  } = ctx;
  try {
    const { Person: PersonModel } = models;

    const { data: { refreshToken } } = args;

    // DECODE REFRESH TOKEN AND GET FIREBASE USER ID
    const decodedToken = await jwt.decodeToken(refreshToken, false);
    const { userId } = decodedToken;

    // CHECK IF USER EXISTS
    const user = await PersonModel.findByPk(userId);

    if (!user) {
      throw new CustomGraphqlError(getMessage('INVALID_TOKEN', localeService), 'INVALID_TOKEN');
    }

    const accessToken = await jwt.generateAccessToken(userId);
    await jwt.saveAccessToken(userId, accessToken, useragent);
    return { accessToken, user };
  } catch (error) {
    personLogger.error(`Error from refreshTokenResolver > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = refreshTokenResolver;
