
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getTemplateById = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Template: TemplateModel } = models;
    const { id } = args;
    console.log(id);
    // Check if the template ID is provided
    if (!id) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    // Fetch the template by its ID
    const template = await TemplateModel.findByPk(id, {
      include: [
        { model: models.TableField, as: 'fields' }, // Include fields if needed
        { model: models.TemplateProperty, as: 'properties' }, // Include properties if needed
      ],
    });

    // If template is not found, throw an error
    if (!template) {
      throw new CustomGraphqlError(getMessage('TEMPLATE_NOT_FOUND', localeService));
    }

    // Return the template

    return template;
  } catch (error) {
    postLogger.error(`Error from getTemplateById resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getTemplateById;
