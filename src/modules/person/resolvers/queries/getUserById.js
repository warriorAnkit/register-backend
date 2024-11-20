const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const getUserById = async (parent, args, ctx) => {
  const { userId } = args; // Retrieve userId from arguments
  const { requestMeta, localeService, models } = ctx;

  try {
    const user = await models.Person.findOne({
      where: { id: userId }, // Use the correct column name ('id' for primary key)
      attributes: ['firstName', 'lastName'], // Include required attributes
      raw: true,
    });

    if (!user) {
      throw new CustomGraphqlError(getMessage('USER_NOT_FOUND', localeService));
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    personLogger.error(`Error from getUserById > ${error.message}`, requestMeta);
    throw error;
  }
};

module.exports = getUserById;
