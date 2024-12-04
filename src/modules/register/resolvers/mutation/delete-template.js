/* eslint-disable no-unused-vars */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const deleteTemplate = async (parent, { id }, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;
  const { user } = req;
  try {
    const { Template: TemplateModel } = models;

    if (user.role !== 'FORM_CREATOR') {
      throw new CustomGraphqlError(getMessage('TEMPLATE_UPDATE_PERMISSION_ERROR', localeService));
    }

    const template = await TemplateModel.findByPk(id);
    if (!template) {
      throw new CustomGraphqlError(getMessage('TEMPLATE_NOT_FOUND', localeService));
    }

    await TemplateModel.update(
      {
        status: 'DELETED',
        deletedAt: new Date(),
      },
      {
        where: { id },
      },
    );
    await models.TemplateActivityLog.create({
      userId: req.user.id, // Assuming user ID is stored in req.user
      templateId: id,
      actionType: 'DELETE_TEMPLATE',
      entityType: 'TEMPLATE',
      entityId: id, // The ID of the deleted template
      changes: null, // You can log the changes if necessary, or keep it null
    });

    return true; // Return true if deletion is successful
  } catch (err) {
    postLogger.error(`Error from deleteTemplate resolver => ${err}`, requestMeta);
    // throw new Error(getMessage('TEMPLATE_DELETE_ERROR', localeService, { error: err.message || 'Unknown error occurred' }));
    throw err;
  }
};

module.exports = deleteTemplate;
