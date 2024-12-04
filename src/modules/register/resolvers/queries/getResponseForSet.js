/* eslint-disable no-unused-vars */
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllResponsesForSet = async (parent, args, ctx) => {
  try {
    const { req, localeService, models } = ctx;
    const { setId } = args;

    // Fetch the set information
    const set = await models.Set.findOne({
      where: { id: setId },
      attributes: ['id', 'userId', 'createdAt', 'updatedBy', 'updatedAt'],
    });

    if (!set) {
      throw new Error('Set not found');
    }

    const fieldResponses = await models.FieldResponse.findAll({
      where: { setId },
      order: [['rowNumber', 'ASC']],
      include: [
        {
          model: models.TableField,
          attributes: ['id', 'field_name'],
        },
      ],
    });

    const propertyResponses = await models.PropertyResponse.findAll({
      where: { setId },
    });

    const rowsMap = {};

    fieldResponses.forEach(response => {
      const { rowNumber } = response; // Get the row number
      if (!rowsMap[rowNumber]) {
        rowsMap[rowNumber] = []; // Initialize if it doesn't exist
      }
      // Include row number in the response
      rowsMap[rowNumber].push({
        rowNumber, // Add row number here
        id: response.id,
        fieldId: response.fieldId,
        value: response.value,
      });
    });

    const formattedFieldResponses = Object.keys(rowsMap)
      .sort((a, b) => a - b)
      .map(rowKey => rowsMap[rowKey]); // Convert keys to the corresponding row arrays

    const formattedPropertyResponses = propertyResponses.map(response => ({
      id: response.id,
      propertyId: response.propertyId,
      value: response.value,
      createdAt: response.createdAt,
    }));

    const setDetails = {
      id: set.id,
      createdBy: set.userId,
      createdAt: set.createdAt,
      updatedBy: set.updatedBy,
      updatedAt: set.updatedAt,
    };

    return {
      setDetails,
      fieldResponses: formattedFieldResponses,
      propertyResponses: formattedPropertyResponses,
    };
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
};

module.exports = getAllResponsesForSet;

