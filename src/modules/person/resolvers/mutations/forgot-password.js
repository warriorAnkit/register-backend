const randomstring = require('randomstring');
const { Op } = require('sequelize');

const CONFIG = require('../../../../config/config');
const providers = require('../../../../providers');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const jwt = require('../../../../utils/auth/jwt');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const forgotPassword = async (parent, args, ctx) => {
  const {
    req: { useragent = {} }, requestMeta, models, localeService,
  } = ctx;
  const { os, browser } = useragent;
  try {
    const { Person: PersonModel } = models;

    const { data } = args;
    const { email } = data;

    if (!email.trim()) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const personWhere = {
      email: {
        [Op.iLike]: `${email}`,
      },
    };

    const person = await PersonModel.findOne({ where: personWhere });
    if (!person) {
      throw new CustomGraphqlError(getMessage('USER_NOT_FOUND', localeService));
    }

    const token = randomstring.generate(128);
    await jwt.saveResetToken(person.id, token, { os, browser });

    const sendMailData = {
      receiverEmails: [person.email],
      template: 'USER_RESET_PASSWORD', // FIXME: CHANGE TEMPLATE KEY from EMAIL PROVIDER
      data: {
        firstName: person.firstName,
        url: `${CONFIG.APP_URL}/reset-password?uid=${person.id}&token=${token}`,
      },
    };

    providers.email.sendEmail(sendMailData);

    const response = {
      message: getMessage('RESET_PASSWORD_LINK_SENT_SUCCESSFUL', localeService),
    };

    return response;
  } catch (error) {
    personLogger.error(`Error from forgotPassword > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = forgotPassword;
