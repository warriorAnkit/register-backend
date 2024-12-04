const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const getActivityLogsBySetId = async (parent, args, ctx) => {
  const { requestMeta, localeService, models } = ctx;

  try {
    const { setId } = args;
    if (!setId) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }
    const {
      ResponseActivityLog: ActivityLogModel,
      Template: TemplateModel,
      Person: UserModel,
    } = models;

    const logs = await ActivityLogModel.findAll({
      where: { setId },
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
      ], // Fetch only relevant log details
      order: [['createdAt', 'DESC']], // Sort logs by timestamp (most recent first)
    });

    // Resolve entity names based on entityType and entityId
    const resolvedLogs = await Promise.all(
      logs.map(async log => {
        let entityName = '';
        let rowNumber = '-';
        if (log.entityType === 'FIELD') {
          // Fetch the FieldResponse based on entityId
          const fieldResponse = await models.FieldResponse.findByPk(log.entityId);
          if (fieldResponse) {
            // Get the TableField associated with this FieldResponse
            const field = await models.TableField.findByPk(fieldResponse.fieldId);
            entityName = field ? field.fieldName : 'Unknown Field';
            rowNumber = fieldResponse.rowNumber || null;
          } else {
            entityName = 'Unknown Field';
          }
        } else if (log.entityType === 'PROPERTY') {
          const propertyResponse = await models.PropertyResponse.findByPk(log.entityId);

          if (propertyResponse) {
            // Get the TemplateProperty associated with this PropertyResponse
            const property = await models.TemplateProperty.findByPk(propertyResponse.propertyId);
            entityName = property ? property.propertyName : 'Unknown Property';
          } else {
            entityName = 'Unknown Property';
          }
        }

        return {
          id: log.id,
          actionType: log.actionType,
          entityType: log.entityType,
          entityName,
          entityId: log.entityId,
          changes: log.changes,
          rowNumber,
          templateName: log.template?.name || 'Unknown Template',
          editedBy: log.user?.firstName || 'Unknown User',
          timestamp: log.createdAt,
        };
      }),
    );
    return resolvedLogs;
  } catch (error) {
    postLogger.error(`Error in getActivityLogsBySetId resolver: ${error.message}`, requestMeta);
    throw error;
  }
};
module.exports = getActivityLogsBySetId;
