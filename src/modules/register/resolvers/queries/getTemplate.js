
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getTemplateById = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { Template: TemplateModel } = models;
    const { id } = args;

    // Check if the template ID is provided
    if (!id) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    // Fetch the template by its ID
    const template = await TemplateModel.findByPk(id, {
      include: [
        // eslint-disable-next-line comma-spacing
        { model: models.TableField, as: 'fields' , order: [['id', 'ASC']] }, // Include fields if needed
        { model: models.TemplateProperty, as: 'properties', order: [['id', 'ASC']] }, // Include properties if needed
      ],
    });
    template.fields.sort((a, b) => a.id - b.id);
    template.properties.sort((a, b) => a.id - b.id);
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
