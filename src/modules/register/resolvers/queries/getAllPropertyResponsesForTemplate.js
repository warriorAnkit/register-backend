/* eslint-disable radix */
/* eslint-disable no-unused-vars */
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllPropertyResponsesForTemplate = async (parent, args, ctx) => {
  try {
    const {
      requestMeta, req, localeService, models,
    } = ctx;
    const { templateId } = args;

    const propertyResponses = await models.PropertyResponse.findAll({
      where: { templateId },
      order: [['createdAt', 'ASC']], // You can order based on createdAt or another relevant field
      include: [
        {
          model: models.TemplateProperty,
          attributes: ['id', 'propertyName'],
        },
      ],
    });

    // Create a map to hold responses organized by setId
    const setsMap = {};

    propertyResponses.forEach(response => {
      const { setId } = response;

      if (!setsMap[setId]) {
        setsMap[setId] = [];
      }

      // Push the property response into the correct set
      setsMap[setId].push({
        id: response.id,
        propertyId: response.propertyId,
        value: response.value,
        createdAt: response.createdAt,
        createdById: response.createdById,
        userId: response.userId,
      });
    });

    // Convert the map into a structured array format for easy processing
    const formattedResponses = Object.keys(setsMap).map(setId => ({
      setId: parseInt(setId),
      propertyResponses: setsMap[setId],
    }));

    // eslint-disable-next-line no-shadow
    // formattedResponses.forEach(({ propertyResponses }) => console.log(propertyResponses));

    return {
      success: true,
      propertyResponses: formattedResponses,
    };
  } catch (error) {
    console.error('Error fetching property responses:', error);
    throw new CustomGraphqlError('Error fetching property responses');
  }
};

module.exports = getAllPropertyResponsesForTemplate;
