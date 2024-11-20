const { Op } = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const passwordUtils = require('../../../../utils/auth/password');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const signUp = async (parent, args, ctx) => {
  const { requestMeta, models, localeService } = ctx;
  try {
    const { data } = args;

    const { Person: PersonModel } = models;

    const {
      email, password, firstName, lastName,
    } = data;
    

    if (!email || !password) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const personWhere = {
      email: {
        [Op.iLike]: `${email}`,
      },
    };

    const personExist = await PersonModel.count({ where: personWhere });
    if (personExist) {
      throw new CustomGraphqlError(getMessage('EMAIL_ALREADY_EXIST', localeService));
    }

    const createPersonData = {
      email,
      firstName,
      lastName,
      password: passwordUtils.generatePassword(password),
    };

    await PersonModel.create(createPersonData);

    // TODO: CAN SEND EMAIL TO VERIFY EMAIL ADDRESS, if REQUIRED

    const response = {
      message: getMessage('ACCOUNT_CREATED_PLEASE_LOGIN', localeService),
    };

    return response;
  } catch (error) {
    personLogger.error(`Error from signUp > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = signUp;
