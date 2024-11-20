/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { Console } = require('winston/lib/winston/transports');

const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

// const db = require('../models');

const createTemplate = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { Template: TemplateModel } = models;
    const db = models;
    // console.log(req.user);
    const {
      name, fields, properties, projectId: providedProjectId, templateType,
    } = args;
    const { user } = req;
    let projectId = providedProjectId || null;
    // Get the projectId for the user if not provided
    if (!projectId) {
      projectId = await models.ProjectUser.getProjectId(user.id, models);
    }
    if (user.role === 'USER') {
      throw new CustomGraphqlError(getMessage('TEMPLATE_CREATE_PERMISSION_ERROR', localeService));
    }

    const template = await TemplateModel.create({
      name,
      status: 'DRAFT',
      createdById: user.id,
      updatedById: user.id,
      projectId,
      templateType,
    });

    // console.log(template);

    for (const field of fields) {
      await db.TableField.create({
        ...field,
        templateId: template.id,
      });
    }

    for (const property of properties) {
      await db.TemplateProperty.create({
        ...property,
        templateId: template.id,
      });
    }

    const createdTemplate = await TemplateModel.findByPk(template.id, {
      include: [
        { model: models.TableField, as: 'fields' },
        { model: models.TemplateProperty, as: 'properties' },
      ],

    });

    await models.TemplateActivityLog.create({
      userId: user.id, // Log the ID of the user who created the template
      templateId: createdTemplate.id, // Reference to the newly created template
      actionType: 'CREATE_TEMPLATE',
      entityType: 'TEMPLATE',
      entityId: createdTemplate.id, // Entity ID of the template
      changes: {
        before: null,
        after: {
          id: createdTemplate.id,
          name: createdTemplate.name,
          fields: createdTemplate.fields,
          properties: createdTemplate.properties,
        },
      },
    });
    const response = {
      data: createdTemplate,
      message: getMessage('TEMPLATE_CREATE_SUCCESS', localeService, { name: createdTemplate.name }),
    };

    return response;
  } catch (err) {
    console.log('hii');
    postLogger.error(`Error from createTemplate resolver => ${err}`, requestMeta);
    // throw new CustomGraphqlError(getMessage('INTERNAL_SERVER_ERROR', localeService, { error: err.message || 'Unknown error occurred' }));
    throw err;
  }
};

module.exports = createTemplate;
