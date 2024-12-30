/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const CreateSet = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { templateId, propertyValues } = args;
    const { user } = req;
    // Create a new response set
    const newSet = await models.Set.create({
      templateId,
      userId: user.id,
      updatedBy: user.id,
    });

    await Promise.all(propertyValues.map(async propertyValue => {
      const propertyResponse = await models.PropertyResponse.create({
        setId: newSet.id,
        templateId,
        propertyId: propertyValue.propertyId,
        createdById: user.id,
        updatedById: user.id,
        value: propertyValue.value,
      });
    }));

    return {
      success: true,
      setId: newSet.id,
      message: getMessage('SET_SUBMISSION_STATUS_SUCCESS', localeService, { name: user.name || 'User' }),
    };
  } catch (error) {
    postLogger.error(`Error from CreateSet resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = CreateSet;
