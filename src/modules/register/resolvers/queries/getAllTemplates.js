const { Op, literal } = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllTemplates = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Template: TemplateModel } = models;
    const {
      page = 1, pageSize = 10, search = '', filters = 'all', projectId,
    } = args;

    console.log('getAllTemplates -> args', args);
    // Validate pagination inputs
    if (page <= 0 || pageSize <= 0) {
      throw new CustomGraphqlError(getMessage('INVALID_PAGINATION', localeService));
    }

    if (!projectId) {
      throw new CustomGraphqlError(getMessage('MISSING_PROJECT_ID', localeService)); // Throw error if projectId is missing
    }
    const filterCondition = filters.toLowerCase() === 'all'
      ? {}
      : {
        status: filters.toUpperCase(), // Apply the status filter
      };

    // Construct the where clause
    const whereClause = {
      ...filterCondition,
      ...(search && {
        name: { [Op.iLike]: `%${search.trim()}%` }, // Case-insensitive search by template name
      }),
      projectId, // Filter by project ID
    };

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Fetch templates with pagination, filters, and search
    const { rows: templates, count: totalCount } = await TemplateModel.findAndCountAll({
      where: whereClause,
      attributes: {
        include: [
          // Subquery to count number of sets for each template
          [
            literal(`(SELECT COUNT(DISTINCT s.id)
                      FROM "set" s
                      WHERE s.template_id = "Template".id)`),
            'numberOfSets',
          ],

          // Subquery to count unique combinations of set_id and row_number
          [
            literal(`(SELECT COUNT(DISTINCT CONCAT(fieldResponses.set_id, '-', fieldResponses.row_number))
                      FROM "field_response" AS fieldResponses
                      WHERE fieldResponses.template_id = "Template".id)`),
            'numberOfEntries',
          ],
        ],
      },
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']], // Order by the most recently updated templates
      raw: true,
    });
    // Return paginated result

    return {
      templates,
      totalCount,
      page,
      pageSize,
    };
  } catch (error) {
    postLogger.error(`Error from getAllTemplates resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getAllTemplates;
