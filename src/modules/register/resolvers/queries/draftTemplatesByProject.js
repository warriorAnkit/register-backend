const { literal } = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getDraftTemplatesByProject = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Template: TemplateModel } = models;
    const { projectId } = args;

    // Check if the projectId is provided
    if (!projectId) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    // Fetch templates associated with the projectId where status is LIVE
    const draftTemplates = await TemplateModel.findAll({
      where: {
        projectId, // Filter templates by projectId
        status: 'DRAFT', // Only fetch templates where status is 'LIVE'
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

    // If no live templates are found, throw an error
    // if (!draftTemplates.length) {
    //   throw new CustomGraphqlError(getMessage('LIVE_TEMPLATES_NOT_FOUND', localeService));
    // }

    // Return the list of live templates

    return draftTemplates;
  } catch (error) {
    postLogger.error(`Error from getLiveTemplatesByProject resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getDraftTemplatesByProject;
