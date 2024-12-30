/* eslint-disable no-unused-vars */
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getPropertyResponsesForSet = async (parent, args, ctx) => {
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

    const propertyResponses = await models.PropertyResponse.findAll({
      where: { setId },
    });

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
      propertyResponses: formattedPropertyResponses,
    };
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
};

module.exports = getPropertyResponsesForSet;

