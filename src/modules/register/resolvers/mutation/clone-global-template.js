/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const cloneGlobalTemplate = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const {
      globalTemplateId, projectId: providedProjectId,
    } = args;
    const { user } = req;

    const db = models;

    // Find the Global Template
    const globalTemplate = await db.GlobalTemplate.findByPk(globalTemplateId, {
      include: [
        { model: db.GlobalTemplateField, as: 'fields' },
        { model: db.GlobalTemplateProperty, as: 'properties' },
      ],
    });

    if (!globalTemplate) {
      throw new CustomGraphqlError(getMessage('GLOBAL_TEMPLATE_NOT_FOUND', localeService));
    }

    let projectId = providedProjectId || null;
    // Get the projectId for the user if not provided
    if (!projectId) {
      projectId = await models.ProjectUser.getProjectId(user.id, models);
    }

    // Create the new Template in the user's workspace
    const template = await db.Template.create({
      name: `${globalTemplate.name}`,
      status: 'DRAFT',
      projectId,
      createdById: user.id,
      updatedById: user.id,
      templateType: 'GLOBAL',
    });

    // Clone fields
    for (const field of globalTemplate.fields) {
      await db.TableField.create({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        maxLength: field.maxLength,
        isRequired: field.isRequired,
        options: field.options,
        templateId: template.id,
      });
    }

    // Clone properties
    for (const property of globalTemplate.properties) {
      await db.TemplateProperty.create({
        propertyName: property.propertyName,
        propertyFieldType: property.propertyFieldType,
        maxLength: property.maxLength,
        isRequired: property.isRequired,
        options: property.options,
        templateId: template.id,
      });
    }

    // Fetch the cloned template with fields and properties
    const clonedTemplate = await db.Template.findByPk(template.id, {
      include: [
        { model: db.TableField, as: 'fields' },
        { model: db.TemplateProperty, as: 'properties' },
      ],
    });

    // Log the clone action
    await models.TemplateActivityLog.create({
      userId: user.id,
      templateId: clonedTemplate.id,
      actionType: 'CLONE_GLOBAL_TEMPLATE',
      entityType: 'TEMPLATE',
      entityId: clonedTemplate.id,
      changes: {
        before: null,
        after: {
          id: clonedTemplate.id,
          name: clonedTemplate.name,
          fields: clonedTemplate.fields,
          properties: clonedTemplate.properties,
        },
      },
    });

    const response = {
      data: clonedTemplate,
      message: getMessage('TEMPLATE_CLONE_SUCCESS', localeService, { name: clonedTemplate.name }),
    };

    return response;
  } catch (err) {
    postLogger.error(`Error from cloneGlobalTemplate resolver => ${err}`, requestMeta);
    throw err;
  }
};

module.exports = cloneGlobalTemplate;
