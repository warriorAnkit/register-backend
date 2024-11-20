const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const updateUser = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models: { Person: PersonModel },
  } = ctx;
  try {
    const { user } = req;
    const { data } = args;

    const updateUserData = {
      firstName: data.firstName,
      lastName: data.lastName,
      profileImage: data.profileImage,
    };
    await PersonModel.update(updateUserData, { where: { id: user.id } });

    const response = {
      data: user,
      message: getMessage('USER_UPDATE_SUCCESS', localeService),
    };
    ctx.dataSources.authorLoader.clear(user.id);
    return response;
  } catch (error) {
    personLogger.error(`Error from updateUser > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = updateUser;
