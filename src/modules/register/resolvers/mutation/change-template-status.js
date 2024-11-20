const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const changeTemplateStatus = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { Template: TemplateModel, TemplateActivityLog } = models;
    const { user } = req;
    const { id, newStatus } = args;
    if (user.role === 'USER') {
      throw new CustomGraphqlError(getMessage('TEMPLATE_STATUS_CHANGE_ACCESS', localeService));
    }

    const template = await TemplateModel.findByPk(id, { raw: true });
    if (!template) {
      throw new CustomGraphqlError(getMessage('TEMPLATE_NOT_FOUND', localeService));
    }
    if (template.status === newStatus) {
      throw new CustomGraphqlError(getMessage('TEMPLATE_STATUS_SAME', localeService));
    }

    await TemplateModel.update(
      { status: newStatus },
      { where: { id } },
    );

    // Log the activity for the status change
    await TemplateActivityLog.create({
      userId: req.user.id, // Assuming user ID is stored in req.user
      templateId: id,
      actionType: 'CHANGE_STATUS', // You can log different actions if needed
      entityType: 'TEMPLATE',
      entityId: id,
      changes: {
        from: template.status,
        to: newStatus,
      },
    });

    const updatedTemplate = await TemplateModel.findByPk(id, {
      include: [
        { model: models.TableField, as: 'fields' },
        { model: models.TemplateProperty, as: 'properties' },
      ],
    });
    // console.log(updatedTemplate);

    const response = {
      data: updatedTemplate,
      message: getMessage('TEMPLATE_UPDATE_SUCCESS', localeService, { name: updatedTemplate.name }),
    };

    return response;
  } catch (err) {
    postLogger.error(`Error from makeTemplateLive resolver => ${err}`, requestMeta);
    // throw new CustomGraphqlError(getMessage('TEMPLATE_UPDATE_ERROR', localeService, { error: err.message || 'Unknown error occurred' }));
    throw err;
  }
};

module.exports = changeTemplateStatus;
