/* eslint-disable no-unused-vars */

const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getAllGlobalTemplate = async (parent, args, ctx) => {
  const { requestMeta, models } = ctx;
  try {
    const { GlobalTemplate: GlobalTemplateModel } = models; // Assuming you have a GlobalTemplate model

    // Fetch all global templates
    const globalTemplates = await GlobalTemplateModel.findAll({
      include: [
        { model: models.GlobalTemplateField, as: 'fields' }, // Include fields if needed
        { model: models.GlobalTemplateProperty, as: 'properties' }, // Include properties if needed
      ],
    });

    return globalTemplates;
  } catch (error) {
    postLogger.error(`Error from getGlobalTemplates resolver => ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getAllGlobalTemplate;
