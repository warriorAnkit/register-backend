/* eslint-disable no-unused-vars */
const { Op, literal } = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllSetsForAllTemplates = async (parent, args, ctx) => {
  try {
    const {
      requestMeta, req, localeService, models,
    } = ctx;
    const {
      projectId, page = 1, pageSize = 10, search = '',
    } = args;

    if (page <= 0 || pageSize <= 0) {
      throw new CustomGraphqlError(getMessage('INVALID_PAGINATION', localeService));
    }

    const offset = (page - 1) * pageSize;
    // Fetch all sets related to all templates
    const { rows: sets, count: totalCount } = await models.Set.findAndCountAll({
      order: [['createdAt', 'DESC']], // Sort by createdAt (descending)
      include: [
        {
          model: models.Template, // Assuming Template model exists and is related to Set
          attributes: ['id', 'name', 'projectId'], // Fetch the template name and projectId
          where: {
            projectId,
            name: { // Search by template name (case-insensitive search)
              [Op.iLike]: `%${search.trim()}%`, // Case-insensitive search
            },
          }, // Filter by projectId
        },
      ],
      offset,
      limit: pageSize,
    });

    // If no sets found, throw a custom error
    // if (!sets || sets.length === 0) {
    //   throw new CustomGraphqlError('No sets found for any templates');
    // }

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
    return {
      sets: formattedSets,
      totalCount, // Include the total count of sets for pagination
    };
  } catch (error) {
    console.error('Error fetching sets:', error);
    throw error;
  }
};

module.exports = getAllSetsForAllTemplates;
