const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const getProjectIdForUser = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { user } = ctx.req;

    if (!user) {
      throw new CustomGraphqlError(getMessage('USER_NOT_AUTHENTICATED', localeService));
    }

    const userId = user.id;

    const projectUser = await models.ProjectUser.findOne({
      where: { userId },
      attributes: ['projectId'],
      raw: true,
    });

    if (!projectUser) {
      throw new CustomGraphqlError(getMessage('PROJECT_NOT_FOUND', localeService));
    }

    return projectUser.projectId;
  } catch (error) {
    personLogger.error(`Error from getProjectIdForUser > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getProjectIdForUser;
