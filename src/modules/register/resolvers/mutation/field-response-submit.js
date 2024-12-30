/* eslint-disable max-lines */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
const { Op } = require('sequelize');

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

const FieldResponseSubmit = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const {
      setId, tableEntries, rowNumberDelete, filling,
    } = args;
    const { user } = req;
    const existingSet = await models.Set.findByPk(setId);
    if (!existingSet) {
      throw new CustomGraphqlError('Response set not found');
    }
    console.log('tableEntries', tableEntries);
    console.log('rowNumberDelete', rowNumberDelete);
    if (rowNumberDelete) {
      const rowNumber = rowNumberDelete;
      console.log('rowNumber', rowNumber);
      const rowsToDeleteResponses = await models.FieldResponse.findAll({
        where: { setId, rowNumber },
        raw: true,
      });
      for (const response of rowsToDeleteResponses) {
        await models.FieldResponse.update(
          { deletedAt: new Date() },
          { where: { id: response.id } },
        );
        if (!filling) {
          await models.ResponseActivityLog.create({
            userId: user.id,
            setId,
            templateId: existingSet.templateId,
            actionType: 'DELETE_RESPONSE',
            entityType: 'FIELD',
            entityId: response.id,
            changes: {
              previousValue: response.value,
              newValue: 'DELETED',
            },
          });
        }
      }
      console.log(rowNumber);
      const rowsToUpdate = await models.FieldResponse.findAll({
        where: {
          setId,
          rowNumber: {
            [Op.gt]: rowNumber, // Use Op.gt instead of $gt
          },
        },
        raw: true,
      });
      for (const response of rowsToUpdate) {
        // Decrease the rowNumber for the remaining responses
        const updatedRowNumber = response.rowNumber - 1;
        // Update the rowNumber in the FieldResponse
        await models.FieldResponse.update(
          { rowNumber: updatedRowNumber },
          { where: { id: response.id } },
        );
      }
    }
    const updatedOrCreatedResponses = [];
    if (tableEntries) {
      const convertedEntries = convertNullResponseIdsToNegativeOne(tableEntries);
      console.log('convertedEntries', convertedEntries);
      let maxRowNumber = await models.FieldResponse.max('rowNumber', { where: { setId } }) || 0;
      // let processedRow = [];
      for (const row of convertedEntries) {
        console.log('row', row);

        const hasNewEntries = row.some(entry => entry.responseId === -1);
        if (hasNewEntries) {
          maxRowNumber += 1;
        }
      }
      for (const row of convertedEntries) {
        console.log('row', row);
        console.log('maxRowNumber', maxRowNumber);
        await Promise.all(row.map(async fieldEntry => {
          const {
            responseId, fieldId, value, rowNumber, isNewRow,
          } = fieldEntry;

          if (responseId !== -1) {
            const existingFieldResponse = await models.FieldResponse.findOne({
              where: { setId, id: responseId },
            });

            if (existingFieldResponse && existingFieldResponse.value !== value) {
              const previousValue = existingFieldResponse.value;
              await existingFieldResponse.update({ value, userId: user.id });
              if (!filling) {
                if (!isNewRow) {
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
              }
              updatedOrCreatedResponses.push({
                responseId: existingFieldResponse.id,
                fieldId,
                value,
                rowNumber: existingFieldResponse.rowNumber,
                status: 'updated',
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
            if (!filling) {
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
            updatedOrCreatedResponses.push({
              responseId: newFieldResponse.id,
              fieldId,
              value,
              rowNumber: newFieldResponse.rowNumber,
              status: 'created',
            });
          }
        }));
      }
    }
    await existingSet.update({
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    return {

      success: true,
      message: getMessage('RESPONSE_UPDATED', localeService, { name: user.name || 'User' }),
      updatedOrCreatedResponses,
    };
  } catch (error) {
    postLogger.error(`Error from fieldResponse resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = FieldResponseSubmit;
