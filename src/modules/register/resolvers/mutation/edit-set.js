/* eslint-disable max-lines */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const editSet = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { setId, propertyValues } = args;
    const { user } = req;

    const existingSet = await models.Set.findByPk(setId);
    if (!existingSet) {
      throw new CustomGraphqlError('Response set not found');
    }
    for (const propertyValue of propertyValues) {
      let { responseId } = propertyValue;
      const { propertyId, value } = propertyValue;

      if (responseId === null) {
        responseId = -1;
      }
      if (responseId !== -1) {
        const existingPropertyResponse = await models.PropertyResponse.findOne({
          where: { setId, id: responseId },
        });

        if (existingPropertyResponse) {
          if (existingPropertyResponse.value !== value) {
            const previousValue = existingPropertyResponse.value;

            await existingPropertyResponse.update({
              value,
              updatedById: user.id, // Update the user who made the change
            });

            // Log the change in response activity log
            await models.ResponseActivityLog.create({
              userId: user.id,
              setId,
              templateId: existingSet.templateId,
              actionType: 'EDIT_RESPONSE',
              entityType: 'PROPERTY',
              entityId: existingPropertyResponse.id,
              changes: {
                previousValue,
                newValue: value,
              },
            });
          }
        }
      } else {
        const newPropertyResponse = await models.PropertyResponse.create({
          setId,
          templateId: existingSet.templateId,
          propertyId,
          createdById: user.id,
          value,
          updatedById: user.id,
        });

        await models.ResponseActivityLog.create({
          userId: user.id,
          setId,
          templateId: existingSet.templateId,
          actionType: 'EDIT_RESPONSE',
          entityType: 'PROPERTY',
          entityId: newPropertyResponse.id,
          changes: { previousValue: null, newValue: value },
        });
      }
    }

    await existingSet.update({
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: getMessage('RESPONSE_UPDATED', localeService, { name: user.name || 'User' }),
    };
  } catch (error) {
    postLogger.error(`Error from editResponse resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = editSet;
