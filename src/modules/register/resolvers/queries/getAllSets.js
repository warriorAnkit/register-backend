/* eslint-disable no-unused-vars */
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllSetsForAllTemplates = async (parent, args, ctx) => {
  try {
    const {
      requestMeta, req, localeService, models,
    } = ctx;
    const { projectId } = args;
    // Fetch all sets related to all templates
    const sets = await models.Set.findAll({
      order: [['createdAt', 'DESC']], // Sort by createdAt (descending)
      include: [
        {
          model: models.Template, // Assuming Template model exists and is related to Set
          attributes: ['id', 'name', 'projectId'], // Fetch the template name and projectId
          where: { projectId }, // Filter by projectId
        },
      ],
    });

    // If no sets found, throw a custom error
    if (!sets || sets.length === 0) {
      throw new CustomGraphqlError('No sets found for any templates');
    }

    // Format the sets data

    const formattedSets = sets.map(set => ({
      setId: set.id,
      userId: set.userId,
      templateName: set.Template.name,
      templateId: set.templateId,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      updatedBy: set.updatedBy,
    }));

    // Return formatted sets data
    return formattedSets;
  } catch (error) {
    console.error('Error fetching sets:', error);
    throw error;
  }
};

module.exports = getAllSetsForAllTemplates;
