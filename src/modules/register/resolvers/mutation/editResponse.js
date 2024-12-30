/* eslint-disable max-lines */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

function convertNullResponseIdsToNegativeOne(tableEntries) {
  return tableEntries.map(row => row.map(entry => ({
    ...entry,
    responseId: entry.responseId === null ? -1 : Number(entry.responseId),
  })));
}

const editResponse = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { setId, tableEntries, propertyValues } = args;
    const { user } = req;
    console.log('tableEntries', tableEntries);
    const convertedEntries = convertNullResponseIdsToNegativeOne(tableEntries);

    const existingSet = await models.Set.findByPk(setId);
    if (!existingSet) {
      throw new CustomGraphqlError('Response set not found');
    }

    // Fetch all current field responses for this set
    const existingFieldResponses = await models.FieldResponse.findAll({
      where: { setId },
      raw: true,
    });
    const tableEntryIds = new Set(convertedEntries.flat().map(entry => entry.responseId).filter(id => id !== -1));

    await Promise.all(existingFieldResponses.map(async existingFieldResponse => {
      if (!tableEntryIds.has(existingFieldResponse.id)) {
        await models.FieldResponse.update(
          { deletedAt: new Date() },
          { where: { id: existingFieldResponse.id } },
        );

        await models.ResponseActivityLog.create({
          userId: user.id,
          setId,
          templateId: existingSet.templateId,
          actionType: 'DELETE_RESPONSE',
          entityType: 'FIELD',
          entityId: existingFieldResponse.id,
          changes: {
            previousValue: existingFieldResponse.value,
            newValue: 'DELETED',
          },
        });
      }
    }));

    let maxRowNumber = await models.FieldResponse.max('rowNumber', { where: { setId } }) || 0;
    console.log('vonvertedEntries', convertedEntries);
    for (const row of convertedEntries) {
      const hasNewEntries = row.some(entry => entry.responseId === -1);

      if (hasNewEntries) {
        maxRowNumber += 1;
      }

      await Promise.all(row.map(async fieldEntry => {
        const {
          responseId, fieldId, value, rowNumber,
        } = fieldEntry;

        if (responseId !== -1) {
          const existingFieldResponse = await models.FieldResponse.findOne({
            where: { setId, id: responseId },
          });

          if (existingFieldResponse && existingFieldResponse.value !== value) {
            const previousValue = existingFieldResponse.value;
            await existingFieldResponse.update({ value, userId: user.id });

            await models.ResponseActivityLog.create({
              userId: user.id,
              setId,
              templateId: existingSet.templateId,
              actionType: 'EDIT_RESPONSE',
              entityType: 'FIELD',
              entityId: existingFieldResponse.id,
              changes: { previousValue, newValue: value },
            });
          }
        } else {
          const newFieldResponse = await models.FieldResponse.create({
            setId,
            templateId: existingSet.templateId,
            fieldId,
            createdById: user.id,
            value,
            userId: user.id,
            rowNumber: rowNumber || maxRowNumber,
          });

          await models.ResponseActivityLog.create({
            userId: user.id,
            setId,
            templateId: existingSet.templateId,
            actionType: 'EDIT_RESPONSE',
            entityType: 'FIELD',
            entityId: newFieldResponse.id,
            changes: { previousValue: null, newValue: value },
          });
        }
      }));
    }
    for (const propertyValue of propertyValues) {
      let { responseId } = propertyValue;
      const { propertyId, value } = propertyValue;
      // console.log(responseId);
      if (responseId === null) {
        responseId = -1;
      }
      // console.log('noe id', responseId);
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
        // Handle the case where the responseId is -1 (new property response)
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

module.exports = editResponse;
