/* eslint-disable no-unused-vars */

const { template } = require('lodash');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllResponsesForTemplate = async (parent, args, ctx) => {
  try {
    const {
      models,
    } = ctx;
    const { templateId } = args;
    // Fetch Field Responses
    const fieldResponses = await models.FieldResponse.findAll({
      where: { templateId },
      order: [['setId', 'DESC']], //
      include: [
        {
          model: models.TableField,
          attributes: ['id', 'field_name'],
        },
      ],
    });

    // Fetch Property Responses
    const propertyResponses = await models.PropertyResponse.findAll({
      where: { templateId },
      order: [['setId', 'DESC']], //
      include: [
        {
          model: models.TemplateProperty,
          attributes: ['id', 'propertyName'],
        },
      ],
    });

    // Create a map to hold both field and property responses organized by setId
    const setsMap = {};

    // Process Field Responses
    fieldResponses.forEach(response => {
      const { setId, rowNumber, TableField } = response;
      if (!TableField) {
        return;
      }
      if (!setsMap[setId]) {
        setsMap[setId] = { fieldResponses: {}, propertyResponses: [] };
      }

      if (!setsMap[setId].fieldResponses[rowNumber]) {
        setsMap[setId].fieldResponses[rowNumber] = [];
      }
      setsMap[setId].fieldResponses[rowNumber].push({
        id: response.id,
        fieldId: response.fieldId,
        fieldName: response.TableField.field_name, // Add field name
        value: response.value,
        rowNumber,

      });
    });

    // Process Property Responses
    propertyResponses.forEach(response => {
      const { setId, TemplateProperty } = response;
      if (!TemplateProperty) {
        return;
      }
      if (!setsMap[setId]) {
        setsMap[setId] = { fieldResponses: {}, propertyResponses: [] };
      }

      setsMap[setId].propertyResponses.push({
        id: response.id,
        propertyId: response.propertyId,
        propertyName: response.TemplateProperty.propertyName, // Add property name
        value: response.value,
        createdAt: response.createdAt,
        userId: response.userId,
      });
    });

    // Convert the map into a structured array format for easy processing
    const formattedResponses = Object.keys(setsMap).map(setId => ({
      // eslint-disable-next-line radix
      setId: parseInt(setId),
      fieldResponses: Object.keys(setsMap[setId].fieldResponses)
        .sort((a, b) => a - b)
        .map(rowNumber => setsMap[setId].fieldResponses[rowNumber]),
      propertyResponses: setsMap[setId].propertyResponses,
    }));
    formattedResponses.sort((a, b) => b.setId - a.setId);
    return {
      success: true,
      responses: formattedResponses, // Merged field and property responses for each setId
    };
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw new CustomGraphqlError('Error fetching responses');
  }
};

module.exports = getAllResponsesForTemplate;
