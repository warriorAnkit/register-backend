
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getGlobalTemplateById = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;
  try {
    const { GlobalTemplate: GlobalTemplateModel } = models; // Assuming you have a GlobalTemplate model
    const { id } = args;

    if (!id) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const globalTemplate = await GlobalTemplateModel.findByPk(id, {
      include: [
        { model: models.GlobalTemplateField, as: 'fields' }, // Include fields if needed
        { model: models.GlobalTemplateProperty, as: 'properties' }, // Include properties if needed
      ],
    });

    if (!globalTemplate) {
      throw new CustomGraphqlError(getMessage('GLOBAL_TEMPLATE_NOT_FOUND', localeService));
    }

    return globalTemplate;
  } catch (error) {
    postLogger.error(`Error from getGlobalTemplateById resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getGlobalTemplateById;
