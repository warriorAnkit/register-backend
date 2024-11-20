const defaultLogger = require('../../logger');
const { models: { Person: PersonModel, AccessToken: AccessTokenModel } } = require('../../sequelize-client');
const CustomGraphqlError = require('../../shared-lib/error-handler');
const { getMessage } = require('../messages');

const encryption = require('./encryption');
const getDecodedToken = require('./get-decoded-token');

const getUser = async (token, localeService) => {
  if (!token) {
    throw new CustomGraphqlError(getMessage('NOT_LOGGEDIN', localeService), 'LOGIN_REQUIRED');
  }

  if (!token.startsWith('Bearer ')) {
    throw new CustomGraphqlError(getMessage('INVALID_TOKEN', localeService), 'INVALID_TOKEN');
  }

  const authToken = token.slice(7, token.length);
  // console.log("auythtokren",authToken);
  
    try {
      const decodedToken = await getDecodedToken(authToken, localeService);
      const encryptedToken = encryption.encryptWithAES(authToken);
  
      // console.log("Encrypted Token:", encryptedToken);
      // console.log("User ID from Token:", decodedToken.userId);
      // console.log(decodedToken,"   judghfju");
      const accessToken = await AccessTokenModel.findOne({
          where: { token: encryptedToken, personId: decodedToken.userId },
          include: { model: PersonModel, as: 'person' },
      });
  
      //  console.log("Access Token Query Result:", accessToken);
  
      if (!accessToken) {
          throw new CustomGraphqlError(getMessage('UNAUTHENTICATED', localeService), 'UNAUTHENTICATED');
      }
      const user = JSON.parse(JSON.stringify(accessToken.person));
      return user;
  } catch (error) {
      console.log("Error caught:", error);
      defaultLogger.error(`Error from getUser > ${error}`, null);
      throw error;
  }
  
};

module.exports = getUser;
