
const {
  literal,
} = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getLiveTemplatesByProject = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  const { projectId } = args;
  console.log(projectId);
  try {
    // Check if the projectId is provided
    if (!projectId) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    // Fetch templates associated with the projectId where status is LIVE
    const liveTemplates = await models.Template.findAll({
      where: {
        projectId,
        status: 'LIVE',
      },
      attributes: {
        include: [
          // Subquery to count number of sets for each template, explicitly referencing the "Template" table alias
          [
            literal(`(SELECT COUNT(DISTINCT s.id)
                      FROM "set" s
                      WHERE s.template_id = "Template".id)`),
            'numberOfSets',
          ],

          // Subquery to count unique combinations of set_id and row_number, referencing "Template"
          [
            literal(`(SELECT COUNT(DISTINCT CONCAT(fieldResponses.set_id, '-', fieldResponses.row_number))
                      FROM "field_response" AS fieldResponses
                      WHERE fieldResponses.template_id = "Template".id)`),
            'numberOfEntries',
          ],
        ],
      },
      raw: true,
    });

    return liveTemplates;
  } catch (error) {
    postLogger.error(`Error from getLiveTemplatesByProject resolver => ${error.message}`, requestMeta);
    console.log(error);
    // throw new CustomGraphqlError(getMessage('INTERNAL_SERVER_ERROR', localeService));
    throw new CustomGraphqlError(error.message || 'INTERNAL_SERVER_ERROR');
  }
};

module.exports = getLiveTemplatesByProject;

