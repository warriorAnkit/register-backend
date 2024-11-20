const moment = require('moment');
const { Op } = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const jwt = require('../../../../utils/auth/jwt');
const passwordUtils = require('../../../../utils/auth/password');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const loginUser = async (parent, args, ctx) => {
  const {
    req: { useragent = {} }, requestMeta, models, localeService,
  } = ctx;
  try {
    const { data } = args;

    const { Person: PersonModel } = models;

    const {
      email, password,
    } = data;

    if (!email || !password) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const personWhere = {
      email: {
        [Op.iLike]: `${email}`,
      },
    };

    const person = await PersonModel.findOne({ where: personWhere });
    if (!person) {
      throw new CustomGraphqlError(getMessage('EMAIL_DOES_NOT_EXIST', localeService));
    }

    const passwordMatch = passwordUtils.comparePassword(password, person.password);

    if (!passwordMatch) {
      throw new CustomGraphqlError(getMessage('INVALID_CREDENTIALS', localeService));
    }

    if (!person.isActive) {
      throw new CustomGraphqlError(getMessage('PERSON_IS_DEACTIVATED', localeService));
    }

    const accessToken = await jwt.generateAccessToken(person.id);
    // console.log(person.id+accessToken+"ghgh   "+useragent);
    // console.log(useragent);
    await jwt.saveAccessToken(person.id, accessToken, useragent);

    if (!person.refreshToken) {
      const refreshToken = await jwt.generateRefreshToken(person.id);
      await person.update({ refreshToken });
    }

    const lastActiveOn = moment();
    await person.update({ lastActiveOn });

    return {
      message: getMessage('LOGIN_SUCCESSFULLY', localeService),
      data: person,
      accessToken,
      refreshToken: person.refreshToken,
    };
  } catch (error) {
    personLogger.error(`Error from loginUser > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = loginUser;
