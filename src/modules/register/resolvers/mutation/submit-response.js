/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const submitResponse = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { templateId, tableEntries, propertyValues } = args;
    const { user } = req;
    // Create a new response set
    const newSet = await models.Set.create({
      templateId,
      userId: user.id, // Save the user ID who submitted the response
    });

    // Store property responses for the created set (one entry per propertyId)
    await Promise.all(propertyValues.map(async propertyValue => {
      const propertyResponse = await models.PropertyResponse.create({
        setId: newSet.id,
        templateId,
        propertyId: propertyValue.propertyId,
        createdById: user.id,
        updatedById: user.id,
        value: propertyValue.value,
      });

      // Log the property response submission
      await models.ResponseActivityLog.create({
        userId: user.id,
        templateId,
        actionType: 'SUBMIT_RESPONSE',
        entityType: 'PROPERTY',
        entityId: propertyResponse.id,
        changes: {
          previousValue: null,
          newValue: propertyValue.value,
        },
      });
    }));

    for (const [rowIndex, row] of tableEntries.entries()) {
      const rowNumber = rowIndex + 1;
      await Promise.all(row.map(async fieldEntry => {
        const fieldResponse = await models.FieldResponse.create({
          setId: newSet.id, // Link to the new set
          templateId,
          fieldId: fieldEntry.fieldId,
          userId: user.id,
          value: fieldEntry.value !== null ? fieldEntry.value : '', // Store blank if null
          rowNumber, // Assign the same row number for this entry
        });

        // Log the field response submission
        await models.ResponseActivityLog.create({
          userId: user.id,
          templateId,
          actionType: 'SUBMIT_RESPONSE',
          entityType: 'FIELD',
          entityId: fieldResponse.id,
          changes: {
            previousValue: null,
            newValue: fieldResponse.value,
          },
        });
      }));
    }

    return {
      success: true,
      message: getMessage('RESPONSE_SUBMITTED', localeService, { name: user.name || 'User' }),
    };
  } catch (error) {
    console.error('Error submitting response:', error);
    postLogger.error(`Error from submitResponse resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = submitResponse;
