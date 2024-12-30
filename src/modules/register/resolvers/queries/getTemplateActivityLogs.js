const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getTemplateActivityLogsBytemplateId = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;

  try {
    const { templateId } = args;
    if (!templateId) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const {
      TemplateActivityLog: ActivityLogModel,
      Template: TemplateModel,
      Person: UserModel,
    } = models;

    // Fetch activity logs for the given templateId
    const logs = await ActivityLogModel.findAll({
      where: { templateId }, // Use templateId to filter logs
      include: [
        {
          model: TemplateModel,
          as: 'template',
          attributes: ['id', 'name'],
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'firstName'],
        },
      ],
      attributes: [
        'id',
        'actionType',
        'entityType',
        'entityId',
        'changes',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
    });

    const resolvedLogs = await Promise.all(
      logs.map(async log => {
        let entityName = '';
        if (log.entityType === 'FIELD') {
          const fieldResponse = await models.FieldResponse.findByPk(log.entityId);
          if (fieldResponse) {
            const field = await models.TableField.findByPk(fieldResponse.fieldId);
            entityName = field ? field.fieldName : 'Unknown Field';
          } else {
            entityName = 'Unknown Field';
          }
        } else if (log.entityType === 'PROPERTY') {
          const propertyResponse = await models.PropertyResponse.findByPk(log.entityId);
          if (propertyResponse) {
            const property = await models.TemplateProperty.findByPk(propertyResponse.propertyId);
            entityName = property ? property.propertyName : 'Unknown Property';
          } else {
            entityName = 'Unknown Property';
          }
        }
        let formattedChanges = {};
        if (log.changes) {
          formattedChanges = {
            previousValue: log.changes.from,
            newValue: log.changes.to,
          };
        }
        console.log('formattedChanges', formattedChanges);
        return {
          id: log.id,
          actionType: log.actionType,
          entityType: log.entityType,
          entityName,
          entityId: log.entityId,
          changes: formattedChanges,
          templateName: log.template?.name || 'Unknown Template',
          editedBy: log.user?.firstName || 'Unknown User',
          timestamp: log.createdAt,
        };
      }),
    );

    return resolvedLogs;
  } catch (error) {
    postLogger.error(`Error in getActivityLogsBytemplateId resolver: ${error.message}`, requestMeta);
    throw error;
  }
};

module.exports = getTemplateActivityLogsBytemplateId;
