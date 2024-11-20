const {
  literal,
} = require('sequelize');

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getArchiveTemplatesByProject = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Template: TemplateModel } = models;
    const { projectId } = args;

    // Check if the projectId is provided
    if (!projectId) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    // Fetch templates associated with the projectId where status is archive
    const archiveTemplates = await TemplateModel.findAll({
      where: {
        projectId, // Filter templates by projectId
        status: 'ARCHIVED', // Only fetch templates where status is 'archive'
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

    // // If no archive templates are found, throw an error
    // if (!archiveTemplates.length) {
    //   throw new CustomGraphqlError(getMessage('archive_TEMPLATES_NOT_FOUND', localeService));
    // }

    // Return the list of archive templates
    return archiveTemplates;
  } catch (error) {
    postLogger.error(`Error from getarchiveTemplatesByProject resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getArchiveTemplatesByProject;
